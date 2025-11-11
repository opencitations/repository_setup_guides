---
title: Automating releases with GitHub Actions and Semantic Release
description: Set up automated version bumping, changelog generation, GitHub releases, and PyPI publishing
---

Automating the release process supports consistent versioning and integrates with Semantic Commits. This guide explains how to set up a [GitHub Actions](/repository_setup_guides/ci_cd/github_actions_basics/) workflow, inspired by this project's `release.yml`, to handle version bumping, changelog generation, GitHub releases, and PyPI publishing using the [`semantic-release`](https://semantic-release.gitbook.io/) tool.

## Prerequisites

-   **Semantic commits:** your project uses [Semantic commit messages](/repository_setup_guides/version_control/semantic_commits/). `semantic-release` relies on these messages to determine the next version number and generate changelogs.
-   **UV project:** this guide assumes a Python project managed with [UV](/repository_setup_guides/virtual_environments/uv_setup/), ready for building and publishing.
-   **Testing workflow:** a separate GitHub Actions workflow (e.g., `run-tests.yml` as described in the [Automated testing guide](/repository_setup_guides/ci_cd/automated_testing/)) that runs your tests. The release workflow will trigger upon successful completion of the test workflow.
-   **PyPI token:** a PyPI API token stored as a secret (e.g., `PYPI_TOKEN`) in your GitHub repository settings (`Settings > Secrets and variables > Actions`).

## Core idea: `semantic-release`

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
-   `@semantic-release/commit-analyzer`: determines release type based on commits.
-   `@semantic-release/release-notes-generator`: generates changelog content.
-   `@semantic-release/changelog`: updates a `CHANGELOG.md` file.
-   `@semantic-release/npm` (if publishing JS packages) or `@semantic-release/exec` (to run custom commands like `uv publish`).
-   `@semantic-release/github`: creates GitHub releases and comments on related issues/PRs.
-   `@semantic-release/git`: commits changes like `package.json` or `CHANGELOG.md` and pushes the Git tag.

**Example snippet for `.releaserc.json` (adapt as needed):**
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
        "prepareCmd": "uv version ${nextRelease.version}"
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
*(Note: In this example, `@semantic-release/exec` uses `prepareCmd` to update the `pyproject.toml` with the new version via `uv version` (see the [UV guide](/repository_setup_guides/virtual_environments/uv_setup/#version-management) for versioning commands). The updated `pyproject.toml` (along with `CHANGELOG.md`) is typically committed by the `@semantic-release/git` plugin as specified in the `assets`.)*

## Example workflow: release after tests pass

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
    # Condition: only run if the test workflow succeeded AND
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

      - name: Install UV
        uses: astral-sh/setup-uv@v6
        with:
          enable-cache: true
          python-version: "3.10" # Or your project's Python version

      - name: Install Python
        run: uv python install

      - name: Install dependencies
        run: uv sync --locked

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "lts/*" # Use long-term support version

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
          UV_PUBLISH_TOKEN: ${{ secrets.PYPI_TOKEN }}
        run: |
          uv build
          uv publish --token $UV_PUBLISH_TOKEN
          # See the UV guide for more on building and publishing:
          # /repository_setup_guides/virtual_environments/uv_setup/#building-and-publishing-packages
```

### Explanation:

1.  **`on.workflow_run`**: triggers when the specified workflow (`Run tests`) completes on the `master` branch (see [GitHub Actions basics](/repository_setup_guides/ci_cd/github_actions_basics/#events) for more on triggers).
2.  **`if: github.event.workflow_run.conclusion == 'success' && contains(...)`**: runs the job only if tests passed and the triggering commit message included `[release]`.
3.  **`permissions`**: grants permissions for `semantic-release` to push commits/tags and interact with GitHub releases/issues.
4.  **Checkout**: fetches the code. `fetch-depth: 0` is required for `semantic-release` to analyze all relevant history.
5.  **Install UV and dependencies**: installs UV with caching enabled, installs Python, and syncs project dependencies using [UV](/repository_setup_guides/virtual_environments/uv_setup/).
6.  **Setup Node.js**: installs Node.js, as `semantic-release` is a Node.js application.
7.  **Install semantic-release plugins**: installs `semantic-release` and its configured plugins globally using `npm`.
8.  **Run semantic-release**: executes `semantic-release` using `npx`. Environment variables `GITHUB_TOKEN` (automatically provided by Actions) and your `PYPI_TOKEN` secret are made available. `semantic-release` reads its configuration, analyzes commits, performs versioning, generates notes, tags, creates the GitHub release, and triggers configured publishing steps (like the `@semantic-release/exec` command or other plugins).

This setup provides automated release workflow integration with semantic commits.
