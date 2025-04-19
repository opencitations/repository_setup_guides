# Automating Releases with GitHub Actions and Semantic Release

Automating the release process ensures consistency, reduces manual effort, and integrates seamlessly with Semantic Commits. This guide explains how to set up a [GitHub Actions](./github_actions_basics.md) workflow, inspired by this project's `release.yml`, to automatically handle version bumping, changelog generation, GitHub releases, and PyPI publishing using the [`semantic-release`](https://semantic-release.gitbook.io/) tool.

## Prerequisites

-   **Semantic Commits:** Your project **must** consistently use [Semantic Commit Messages](./../version_control/semantic_commits.md). `semantic-release` relies on these messages to determine the next version number and generate changelogs.
-   **Poetry Project:** This guide assumes a Python project managed with [Poetry](../virtual_environments/poetry_setup.md), ready for building and publishing.
-   **Testing Workflow:** A separate GitHub Actions workflow (e.g., `run-tests.yml` as described in the [Automated Testing guide](./automated_testing.md)) that runs your tests. The release workflow will trigger upon successful completion of the test workflow.
-   **PyPI Token:** A PyPI API token stored as a secret (e.g., `PYPI_TOKEN`) in your GitHub repository settings (`Settings > Secrets and variables > Actions`).

## Core Idea: `semantic-release`

`semantic-release` automates the entire package release workflow:

1.  Analyzes commits since the last release (using the Semantic Commit format).
2.  Determines the next version number (patch, minor, major).
3.  Generates release notes/changelog based on the commits.
4.  Creates a Git tag for the new version.
5.  Creates a GitHub Release associated with the tag.
6.  (Optionally) Publishes packages to registries like PyPI.

## Configuration (`semantic-release`)

`semantic-release` needs configuration, typically defined in a `.releaserc.json` file in your project root. This configuration specifies plugins for different steps (analyzing commits, generating notes, publishing, etc.) and their options.

A typical configuration might include plugins like:
-   `@semantic-release/commit-analyzer`: Determines release type based on commits.
-   `@semantic-release/release-notes-generator`: Generates changelog content.
-   `@semantic-release/changelog`: Updates a `CHANGELOG.md` file.
-   `@semantic-release/npm` (if publishing JS packages) or `@semantic-release/exec` (to run custom commands like `poetry publish`).
-   `@semantic-release/github`: Creates GitHub releases and comments on related issues/PRs.
-   `@semantic-release/git`: Commits changes like `package.json` or `CHANGELOG.md` and pushes the Git tag.

**Example Snippet for `.releaserc.json` (adapt as needed):**
```json
{
  "branches": ["master"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release/exec",
      {
        "prepareCmd": "poetry version ${nextRelease.version}"
      }
    ],
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md", "pyproject.toml"],
        "message": "chore(release): ${nextRelease.version}\n\n${nextRelease.notes}"
      }
    ]
  ]
}
```
*(Note: In this example, `@semantic-release/exec` uses `prepareCmd` to update the `pyproject.toml` with the new version via `poetry version` (see the [Poetry guide](../virtual_environments/poetry_setup.md) for versioning commands). The updated `pyproject.toml` (along with `CHANGELOG.md`) is typically committed by the `@semantic-release/git` plugin as specified in the `assets`.)*

## Example Workflow: Release after Tests Pass

This workflow triggers when the `Run tests` workflow completes successfully on the `master` branch. It also includes a check (`if: contains(...)`) which looks for `[release]` in the commit message that *triggered* the test workflow. This acts as a safeguard or manual confirmation step.

Create a file named `.github/workflows/release.yml`:

```yaml
name: Release

on:
  workflow_run:
    workflows: ["Run tests"] # Replace "Run tests" with the actual name of your test workflow
    types:
      - completed
    branches: [master] # Or your main release branch

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    # Condition: Only run if the test workflow succeeded AND
    # the commit message that triggered the tests contained '[release]'
    if: github.event.workflow_run.conclusion == 'success' && contains(github.event.workflow_run.head_commit.message, '[release]')
    permissions:
      contents: write # Needed for semantic-release to push tags/commits
      issues: write # Needed for semantic-release to comment on issues
      pull-requests: write # Needed for semantic-release to comment on PRs

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Fetch all history for semantic-release analysis

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.10" # Or your project's Python version

      - name: Setup Poetry
        uses: snok/install-poetry@v1
        with:
          virtualenvs-create: true
          virtualenvs-in-project: true

      - name: Install dependencies
        run: poetry install

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "lts/*" # Use Long-Term Support version

      # Install semantic-release and necessary plugins globally in the runner
      - name: Install semantic-release plugins
        run: |
          npm install -g semantic-release \
                         @semantic-release/commit-analyzer \
                         @semantic-release/release-notes-generator \
                         @semantic-release/changelog \
                         @semantic-release/github \
                         @semantic-release/git \
                         @semantic-release/exec

      # Run semantic-release
      - name: Run semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Provided by Actions
          PYPI_TOKEN: ${{ secrets.PYPI_TOKEN }}     # Your PyPI token secret
        # Use npx to run the globally installed package
        run: npx semantic-release

      - name: Build and publish to PyPI
        if: success() # Typically check if semantic-release created a new version
        env:
          POETRY_PYPI_TOKEN_PYPI: ${{ secrets.PYPI_TOKEN }}
        run: |
          poetry build
          poetry publish
          # See the Poetry guide for more on building and publishing:
          # ../virtual_environments/poetry_setup.md
```

### Explanation:

1.  **`on.workflow_run`**: Triggers when the specified workflow (`Run tests`) completes on the `master` branch (see [GitHub Actions Basics](./github_actions_basics.md#events) for more on triggers).
2.  **`if: github.event.workflow_run.conclusion == 'success' && contains(...)`**: Ensures the job only runs if tests passed *and* the triggering commit message included `[release]`. This prevents accidental releases.
3.  **`permissions`**: Grants necessary permissions for `semantic-release` to push commits/tags and interact with GitHub releases/issues.
4.  **Checkout**: Fetches the code. `fetch-depth: 0` is crucial for `semantic-release` to analyze all relevant history. 
5.  **Setup Poetry**: Standard Python project setup using [Poetry](../virtual_environments/poetry_setup.md).
6.  **Setup Node.js**: Installs Node.js, as `semantic-release` is a Node.js application.
7.  **Install semantic-release plugins**: Installs `semantic-release` and its configured plugins globally using `npm`.
8.  **Run semantic-release**: Executes `semantic-release` using `npx`. Environment variables `GITHUB_TOKEN` (automatically provided by Actions) and your `PYPI_TOKEN` secret are made available. `semantic-release` reads its configuration, analyzes commits, performs versioning, generates notes, tags, creates the GitHub release, and triggers configured publishing steps (like the `@semantic-release/exec` command or other plugins).

This setup provides a robust, automated release process tightly coupled with your development workflow and commit conventions.