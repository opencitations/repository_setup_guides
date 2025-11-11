---
title: Automated testing with GitHub Actions
description: Guide to setting up automated Python testing using GitHub Actions and UV
---

Automating your test suite using [GitHub Actions](/repository_setup_guides/ci_cd/github_actions_basics/) runs tests on every push or pull request.

This guide demonstrates setting up a workflow to run Python tests using `pytest` with dependencies managed by [UV](/repository_setup_guides/virtual_environments/uv_setup/).

## Prerequisites

-   Your project uses UV for dependency management (`pyproject.toml` and `uv.lock` exist).
-   You have tests written (e.g., using `pytest`) located in a standard directory like `tests/`.
-   `pytest` (or your chosen test runner) is listed as a development dependency in your `pyproject.toml`:
    ```toml
    [dependency-groups]
    dev = [
        "pytest>=8.3.5",
    ]
    ```

## Example workflow: Python tests

Create a file named `.github/workflows/python-tests.yml`:

```yaml
name: Run Python tests

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        # Test against multiple Python versions
        python-version: ["3.10", "3.11", "3.12", "3.13"]

    steps:
    # Step 1: check out the repository code
    - name: Check out code
      uses: actions/checkout@v4

    # Step 2: install UV with caching enabled
    - name: Install UV
      uses: astral-sh/setup-uv@v6
      with:
        enable-cache: true
        python-version: ${{ matrix.python-version }}

    # Step 3: install Python version
    - name: Install Python
      run: uv python install

    # Step 4: install dependencies, including development dependencies
    - name: Install dependencies
      run: uv sync --locked --all-extras --dev

    # Step 5: run tests using pytest via uv run
    - name: Run tests with pytest
      run: uv run pytest tests/
      # Replace 'tests/' with your actual test directory if different
```

### Explanation:

1.  **`name`**: Name of the workflow.
2.  **`on`**: Triggers the workflow on pushes and pull requests to the `master` branch, and supports manual runs.
3.  **`jobs.test`**: Defines the main job named `test`.
4.  **`runs-on: ubuntu-latest`**: Specifies the runner environment.
5.  **`strategy.matrix.python-version`**: Sets up a build matrix to run the tests across multiple specified Python versions (`3.10`, `3.11`, `3.12`, `3.13`). GitHub Actions will create a separate job instance for each version.
6.  **`steps`**: The sequence of operations:
    -   **`actions/checkout@v4`**: Checks out your repository code onto the runner.
    -   **`astral-sh/setup-uv@v6`**: Installs UV with caching enabled. The `python-version` parameter specifies which Python version to use from the matrix.
    -   **`uv python install`**: Installs the specified Python version using UV's built-in Python version management.
    -   **`uv sync --locked --all-extras --dev`**: This installs all dependencies, including development ones and all optional extras. The `--locked` flag verifies the `uv.lock` file is up-to-date (see the [UV guide](/repository_setup_guides/virtual_environments/uv_setup/#installing-dependencies) for more on `uv sync`).
    -   **`uv run pytest tests/`**: Executes `pytest` within the UV-managed virtual environment (see the [UV guide](/repository_setup_guides/virtual_environments/uv_setup/#running-commands) for `uv run`), targeting the `tests/` directory. UV syncs the environment before running the command.

## Benefits

-   **Reproducibility:** tests run in a defined environment with locked dependencies.
-   **Matrix testing:** verifies compatibility across multiple Python versions.
-   **Integration:** executes tests automatically on each push and pull request.
