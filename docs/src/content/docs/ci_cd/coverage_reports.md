---
title: Coverage reports
description: Guide to generating coverage badges and publishing HTML reports to GitHub Pages
---

Publishing test coverage reports to GitHub Pages provides visibility into code coverage and displays a badge in the repository README.

This guide covers generating coverage data with `pytest-cov`, creating SVG badges with `genbadge`, and publishing both to GitHub Pages through GitHub Actions workflows.

## Prerequisites

- Project uses [UV](/repository_setup_guides/virtual_environments/uv_setup/) for dependency management
- Tests written with `pytest` (see [automated testing](/repository_setup_guides/ci_cd/automated_testing/))
- GitHub Pages enabled for the repository

## Dependencies

Add coverage tools to development dependencies:

```bash
uv add --dev pytest-cov genbadge[coverage]
```

The `pyproject.toml` will include:

```toml
[dependency-groups]
dev = [
    "genbadge[coverage]>=1.1.3",
    "pytest>=8.0.0",
    "pytest-cov>=7.0.0",
]
```

## Workflow configuration

### Running tests with coverage

Modify the test step to generate coverage reports. Running coverage on a single Python version avoids duplicate reports when using a matrix strategy:

```yaml
- name: Run tests with coverage
  if: matrix.python-version == '3.13'
  run: uv run pytest tests/ --cov=package_name --cov-report=html --cov-report=xml
```

Options:
- `--cov=package_name`: measure coverage for the specified package
- `--cov-report=html`: generate HTML report in `htmlcov/` directory
- `--cov-report=xml`: generate XML report as `coverage.xml` (used by badge generator)

### Generating the coverage badge

The `genbadge` tool reads the XML coverage report and creates an SVG badge:

```yaml
- name: Generate coverage badge
  if: matrix.python-version == '3.13'
  run: uv run genbadge coverage -i coverage.xml -o coverage-badge.svg
```

### Uploading artifacts

Upload both the HTML report and badge as artifacts for use by the deployment workflow:

```yaml
- name: Upload coverage report
  if: matrix.python-version == '3.13'
  uses: actions/upload-artifact@v4
  with:
    name: coverage-report
    path: htmlcov/

- name: Upload coverage badge
  if: matrix.python-version == '3.13'
  uses: actions/upload-artifact@v4
  with:
    name: coverage-badge
    path: coverage-badge.svg
```

## Publishing to GitHub Pages

### Deploy workflow integration

The documentation deployment workflow downloads coverage artifacts and includes them in the site build. Use `workflow_run` to trigger after tests complete:

```yaml
name: Deploy documentation

on:
  workflow_run:
    workflows: ["Run tests"]
    types: [completed]
    branches: [main]
```

Download the artifacts into the `docs/public/coverage/` directory:

```yaml
- name: Download coverage report
  if: github.event_name == 'workflow_run'
  uses: actions/download-artifact@v4
  with:
    name: coverage-report
    path: docs/public/coverage
    github-token: ${{ secrets.GITHUB_TOKEN }}
    run-id: ${{ github.event.workflow_run.id }}

- name: Download coverage badge
  if: github.event_name == 'workflow_run'
  uses: actions/download-artifact@v4
  with:
    name: coverage-badge
    path: docs/public/coverage
    github-token: ${{ secrets.GITHUB_TOKEN }}
    run-id: ${{ github.event.workflow_run.id }}
```

The path `docs/public/coverage/` assumes an Astro-based documentation site. Adjust the path based on your static site setup to ensure coverage files are included in the deployed output.

### URL structure

After deployment, the coverage files are available at:
- Badge: `https://username.github.io/package-name/coverage/coverage-badge.svg`
- HTML report: `https://username.github.io/package-name/coverage/`

## Adding the badge to README

Add a clickable badge that displays coverage percentage and links to the full report:

```markdown
[![Coverage](https://username.github.io/package-name/coverage/coverage-badge.svg)](https://username.github.io/package-name/coverage/)
```

Replace `username` and `package-name` with the actual GitHub username/organization and repository name.

## Complete workflow example

### Tests workflow (`.github/workflows/tests.yml`)

```yaml
name: Run tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12", "3.13"]

    steps:
    - name: Check out code
      uses: actions/checkout@v4

    - name: Install UV
      uses: astral-sh/setup-uv@v6
      with:
        enable-cache: true
        python-version: ${{ matrix.python-version }}

    - name: Install Python
      run: uv python install

    - name: Install dependencies
      run: uv sync --locked --all-extras --dev

    - name: Run tests
      if: matrix.python-version != '3.13'
      run: uv run pytest tests/

    - name: Run tests with coverage
      if: matrix.python-version == '3.13'
      run: uv run pytest tests/ --cov=package_name --cov-report=html --cov-report=xml

    - name: Generate coverage badge
      if: matrix.python-version == '3.13'
      run: uv run genbadge coverage -i coverage.xml -o coverage-badge.svg

    - name: Upload coverage report
      if: matrix.python-version == '3.13'
      uses: actions/upload-artifact@v4
      with:
        name: coverage-report
        path: htmlcov/

    - name: Upload coverage badge
      if: matrix.python-version == '3.13'
      uses: actions/upload-artifact@v4
      with:
        name: coverage-badge
        path: coverage-badge.svg
```
