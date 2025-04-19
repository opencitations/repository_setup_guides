# Setting up a Project with Poetry

[Poetry](https://python-poetry.org/) is a tool for dependency management and packaging in Python. It allows you to declare the libraries your project depends on and it will manage (install/update) them for you. It replaces the need for `requirements.txt` files and tools like `pipenv` or `virtualenv` directly.

## Installation

Follow the official [installation instructions](https://python-poetry.org/docs/#installation) for your operating system. A common method is using `pipx`:

```bash
pipx install poetry
```

Or using the official installer:

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

Verify the installation:

```bash
poetry --version
```

## Initializing a New Project

To start a new project with Poetry, navigate to your desired parent directory and run:

```bash
poetry new my-new-project
cd my-new-project
```

This creates a standard project structure:

```
my-new-project/
├── pyproject.toml
├── README.md
├── my_new_project/
│   └── __init__.py
└── tests/
    └── __init__.py
```

If you have an existing project, you can initialize Poetry in its root directory:

```bash
cd existing-project
poetry init
```

This command will interactively guide you through creating the `pyproject.toml` file, which is the heart of a Poetry-managed project. It contains metadata, dependencies, development dependencies, and tool configurations.

## The `pyproject.toml` File

Here's an example `pyproject.toml`:

```toml
[tool.poetry]
name = "my-package"
version = "0.1.0"
description = "A short description of the package."
authors = ["Your Name <you@example.com>"]
readme = "README.md"
packages = [{include = "my_package"}]

[tool.poetry.dependencies]
python = "^3.9"  # Specify compatible Python versions
requests = "^2.28" # Example dependency

[tool.poetry.group.dev.dependencies]
pytest = "^7.0" # Example development dependency

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

-   **`[tool.poetry]`**: Core project metadata.
-   **`[tool.poetry.dependencies]`**: Project runtime dependencies. Version constraints follow semantic versioning rules (e.g., `^2.28` means >=2.28.0 and <3.0.0).
-   **`[tool.poetry.group.dev.dependencies]`**: Dependencies only needed for development (like testing or linting tools). These are not installed by default when someone installs your package.

## Managing Dependencies

### Adding Dependencies

To add a runtime dependency:

```bash
poetry add requests
# Add a specific version
poetry add requests@^2.28.0
# Add as a development dependency
poetry add pytest --group dev
```

Poetry resolves the dependencies, updates `pyproject.toml`, and modifies the `poetry.lock` file.

### The `poetry.lock` File

The `poetry.lock` file records the exact versions of all installed dependencies (including transitive dependencies). **You should commit this file to your version control repository.** This ensures that everyone working on the project, as well as your CI/CD pipelines, uses the exact same versions of all dependencies, guaranteeing reproducible builds.

### Installing Dependencies

To install all dependencies defined in `pyproject.toml` (using `poetry.lock` if it exists):

```bash
poetry install
# To install only production dependencies (without dev group)
poetry install --no-dev
# To install a specific group (e.g., dev)
poetry install --with dev
```

Poetry automatically creates and manages a virtual environment for your project, typically within a central cache directory or optionally within the project directory itself (`.venv`).

### Updating Dependencies

To update dependencies to their latest allowed versions according to `pyproject.toml`:

```bash
poetry update
# To update a specific package
poetry update requests
```

This will update `poetry.lock`.


### Run a Command Directly

```bash
poetry run python my_script.py
poetry run pytest
```

This executes the specified command within the project's virtual environment without explicitly activating a shell. This is often preferred for scripts and CI/CD pipelines (see examples in the [Automated Testing](./../ci_cd/automated_testing.md) and [Automated Releases](./../ci_cd/releases.md) guides).

## Conclusion

Poetry streamlines Python project setup, dependency management, and packaging. By using `pyproject.toml` and `poetry.lock`, it ensures consistency and reproducibility across different development and deployment environments. 