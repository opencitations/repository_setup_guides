# Setting up a project with UV

[UV](https://docs.astral.sh/uv/) is an extremely fast Python package manager and project manager written in Rust. It replaces multiple tools (pip, pipx, pyenv, virtualenv, poetry) with a single, unified interface. UV is 10-100x faster than traditional Python tools and follows modern Python packaging standards (PEP 621, PEP 735).

## Installation

Follow the official [installation instructions](https://docs.astral.sh/uv/getting-started/installation/) for your operating system.

### Standalone installer (recommended)

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows:**
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

### Using pipx

```bash
pipx install uv
```

### Other package managers

**Homebrew (macOS):**
```bash
brew install uv
```

**WinGet (Windows):**
```bash
winget install --id=astral-sh.uv -e
```

### Verify installation

```bash
uv --version
```

### Updating UV

If installed via the standalone installer:
```bash
uv self update
```

For other installation methods, use the respective package manager's update command.

## Initializing a new project

UV provides flexible project initialization depending on your needs.

### Create a new application

To start a new application project:

```bash
uv init my-new-project
cd my-new-project
```

This creates a basic application structure:

```
my-new-project/
├── .gitignore
├── .python-version
├── README.md
├── pyproject.toml
└── main.py
```

### Create a new package

For a distributable package with proper structure:

```bash
uv init my-package --package
cd my-package
```

This creates a package structure:

```
my-package/
├── .gitignore
├── .python-version
├── README.md
├── pyproject.toml
└── src/
    └── my_package/
        ├── __init__.py
        └── py.typed
```

### Initialize an existing project

If you have an existing project, initialize UV in its root directory:

```bash
cd existing-project
uv init
```

This creates the necessary configuration files while preserving your existing code structure.

## The `pyproject.toml` file

UV uses the standard PEP 621 format for project metadata. Here's an example `pyproject.toml`:

```toml
[project]
name = "my-package"
version = "0.1.0"
description = "A short description of the package"
authors = [
    {name = "Your Name", email = "you@example.com"}
]
readme = "README.md"
requires-python = ">=3.9"
dependencies = [
    "requests>=2.28.0",
]

[dependency-groups]
dev = [
    "pytest>=7.0.0",
    "ruff>=0.1.0",
]

[build-system]
requires = ["hatchling>=1.26"]
build-backend = "hatchling.build"
```

-   **`[project]`**: core project metadata following PEP 621 standard.
-   **`[project.dependencies]`**: project runtime dependencies. UV uses standard version specifiers (e.g., `>=2.28.0` means version 2.28.0 or higher).
-   **`[dependency-groups]`**: optional dependency groups (PEP 735 standard), such as development dependencies. These are not installed by default when someone installs your package.
-   **`[build-system]`**: specifies the build backend. UV works with multiple backends including `hatchling`, `flit_core`, `setuptools`, or UV's own `uv_build`.

## Managing dependencies

### Adding dependencies

To add a runtime dependency:

```bash
uv add requests
# Add a specific version
uv add requests==2.28.0
# Add with version constraint
uv add "requests>=2.28.0"
# Add as a development dependency
uv add --dev pytest
# Add to a custom dependency group
uv add --group lint ruff
```

UV automatically resolves dependencies, updates `pyproject.toml`, and updates the `uv.lock` file.

### Removing dependencies

To remove a dependency:

```bash
uv remove requests
# Remove a development dependency
uv remove --dev pytest
```

### The `uv.lock` file

The `uv.lock` file records the exact versions of all installed dependencies (including transitive dependencies). **You should commit this file to your version control repository.** This ensures that everyone working on the project, as well as your CI/CD pipelines, uses the exact same versions of all dependencies, guaranteeing reproducible builds.

### Installing dependencies

To install all dependencies defined in `pyproject.toml` (using `uv.lock` if it exists):

```bash
uv sync
# To install only production dependencies (without dev group)
uv sync --no-dev
# To install a specific group
uv sync --group lint
# To install all optional dependencies
uv sync --all-extras
# To ensure the lockfile is up-to-date (recommended for CI)
uv sync --locked
```

UV automatically creates and manages a virtual environment for your project in the `.venv` directory within your project root.

### Updating dependencies

To update dependencies to their latest compatible versions:

```bash
# Update lockfile only
uv lock --upgrade
# Update lockfile and sync environment
uv sync --upgrade
# Update a specific package
uv lock --upgrade-package requests
# Update and sync a specific package
uv sync --upgrade-package requests
```

This will update `uv.lock` with the latest compatible versions according to the constraints in `pyproject.toml`.

## Running commands

UV provides the `uv run` command to execute commands within your project's virtual environment. The environment is automatically synced before each run, ensuring consistency.

```bash
uv run python my_script.py
uv run pytest
```

This executes the specified command within the project's virtual environment without explicitly activating a shell. **UV automatically ensures the environment is synchronized with `uv.lock` before running the command.** This is the recommended approach for scripts and CI/CD pipelines (see examples in the [Automated testing](./../ci_cd/automated_testing.md) and [Automated releases](./../ci_cd/releases.md) guides).

## Python version management

UV includes built-in Python version management, eliminating the need for separate tools like pyenv.

### Install a Python version

```bash
# Install the latest Python version
uv python install
# Install a specific version
uv python install 3.11
# Install multiple versions
uv python install 3.9 3.10 3.11 3.12
```

### List installed Python versions

```bash
uv python list
```

### Pin a Python version for your project

The `.python-version` file created by `uv init` specifies the Python version for your project. You can update it manually or use:

```bash
echo "3.11" > .python-version
```

## Building and publishing packages

### Building a package

To build your package for distribution:

```bash
# Build both source distribution and wheel
uv build
# Build wheel only
uv build --wheel
# Build source distribution only
uv build --sdist
```

Built packages are placed in the `dist/` directory.

### Publishing to PyPI

To publish your package to PyPI:

```bash
# Publish with a token (recommended)
uv publish --token $UV_PUBLISH_TOKEN
# Publish to TestPyPI
uv publish --publish-url https://test.pypi.org/legacy/ --token $UV_PUBLISH_TOKEN
```

You can also use environment variables:
- `UV_PUBLISH_TOKEN`: PyPI API token
- `UV_PUBLISH_USERNAME`: Username (usually `__token__` when using tokens)
- `UV_PUBLISH_PASSWORD`: Password or token
- `UV_PUBLISH_URL`: Custom index URL (e.g., for TestPyPI)

## Version management

UV includes built-in version bumping:

```bash
# Show current version
uv version
# Bump patch version (1.0.0 → 1.0.1)
uv version --bump patch
# Bump minor version (1.0.0 → 1.1.0)
uv version --bump minor
# Bump major version (1.0.0 → 2.0.0)
uv version --bump major
```

These commands automatically update the `version` field in the `[project]` section of `pyproject.toml`.

## Conclusion

UV streamlines Python project setup, dependency management, and packaging with exceptional performance. By using the standard `pyproject.toml` format and `uv.lock` file, it ensures consistency and reproducibility across different development and deployment environments. Its unified approach replaces multiple tools with a single, fast, and modern solution.
