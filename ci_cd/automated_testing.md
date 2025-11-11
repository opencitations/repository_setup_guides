# Automated testing with GitHub Actions

Automating your test suite using [GitHub Actions](./github_actions_basics.md) ensures that your code is tested consistently on every push or pull request, catching regressions early.

This guide demonstrates setting up a workflow to run Python tests using `pytest` with dependencies managed by [Poetry](../virtual_environments/poetry_setup.md).

## Prerequisites

-   Your project uses Poetry for dependency management (`pyproject.toml` and `poetry.lock` exist).
-   You have tests written (e.g., using `pytest`) located in a standard directory like `tests/`.
-   `pytest` (or your chosen test runner) is listed as a development dependency in your `pyproject.toml`:
    ```toml
    [tool.poetry.group.dev.dependencies]
    pytest = "^8.3.5"
    # other dev dependencies...
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

    # Step 2: set up Python environment for the current matrix version
    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v5
      with:
        python-version: ${{ matrix.python-version }}

    # Step 3: install Poetry
    # Consider caching Poetry installation for speed
    - name: Install Poetry
      uses: snok/install-poetry@v1
      with:
        virtualenvs-create: true # Instruct Poetry to create a .venv
        virtualenvs-in-project: true # Create .venv in project root

    # Step 4: install dependencies, including development dependencies
    - name: Install dependencies
        run: |
          poetry install --with dev

    # Step 5: run tests using pytest via poetry run
    - name: Run tests with pytest
      run: poetry run pytest tests/
      # Replace 'tests/' with your actual test directory if different
```

### Explanation:

1.  **`name`**: Name of the workflow.
2.  **`on`**: Triggers the workflow on pushes and pull requests to the `master` branch, and allows manual runs.
3.  **`jobs.test`**: Defines the main job named `test`.
4.  **`runs-on: ubuntu-latest`**: Specifies the runner environment.
5.  **`strategy.matrix.python-version`**: Sets up a build matrix to run the tests across multiple specified Python versions (`3.10`, `3.11`, `3.12`, `3.13`). GitHub Actions will create a separate job instance for each version.
6.  **`steps`**: The sequence of operations:
    -   **`actions/checkout@v4`**: Checks out your repository code onto the runner.
    -   **`actions/setup-python@v5`**: Sets up the specified Python version from the matrix.
    -   **`snok/install-poetry@v1`**: Installs Poetry. We configure it to create the virtual environment (`.venv`) within the project directory, which simplifies caching.
    -   **`poetry install --with dev`**: This installs all dependencies, including development ones (see the [Poetry guide](../virtual_environments/poetry_setup.md#installing-dependencies) for more on `poetry install`).
    -   **`poetry run pytest tests/`**: Executes `pytest` within the Poetry-managed virtual environment (see the [Poetry guide](../virtual_environments/poetry_setup.md#run-a-command-directly) for `poetry run`), targeting the `tests/` directory.

## Benefits

-   **Consistency:** tests run in a clean, defined environment every time.
-   **Automation:** reduces manual effort and ensures tests are always executed.
-   **Early feedback:** catches bugs and regressions quickly after code changes.
-   **Confidence:** increases confidence in merging pull requests and deploying code. 