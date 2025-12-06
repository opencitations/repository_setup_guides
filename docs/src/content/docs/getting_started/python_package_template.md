---
title: Python package template
description: Create a new Python package with pre-configured CI/CD, testing, and documentation
---

A template repository for Python packages with pre-configured tooling:

- [UV](/repository_setup_guides/virtual_environments/uv_setup/) for dependency management
- [GitHub Actions](/repository_setup_guides/ci_cd/github_actions_basics/) for CI/CD
- [Semantic-release](/repository_setup_guides/ci_cd/releases/) for automated versioning and PyPI publishing
- Optional [Starlight](/repository_setup_guides/documentation/starlight_setup/) documentation site

Repository: [opencitations/python-package-template](https://github.com/opencitations/python-package-template)

## Quick start

### 1. Create repository from template

1. Go to [python-package-template](https://github.com/opencitations/python-package-template)
2. Click "Use this template" > "Create a new repository"
3. Choose owner and repository name
4. Click "Create repository"

### 2. Clone and run setup

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
python setup.py
```

### 3. Answer setup prompts

The script asks for:

- **Package name**: e.g., `my-awesome-lib` (hyphens allowed)
- **Description**: brief package description
- **Author name**: your name
- **Author email**: your email
- **GitHub username**: your username or organization
- **Include Starlight documentation?**: requires Node.js/npm

The script automatically:
- Renames directories and updates all configuration files
- Runs `uv sync` to create the lock file (if UV is installed)
- Sets up Starlight documentation (if selected)
- Removes itself when done

### 4. Configure GitHub repository

Add the PyPI token for automated publishing:

1. Create a token at https://pypi.org/manage/account/token/
2. Go to repository Settings > Secrets and variables > Actions
3. Add a new secret named `PYPI_TOKEN`

If you included documentation:

1. Go to Settings > Pages
2. Set Source to "GitHub Actions"

### 5. Start developing

```bash
# Run tests
uv run pytest tests/

# Make changes and commit
git add .
git commit -m "feat: add new feature"
git push
```

To trigger a release, include `[release]` in your commit message:

```bash
git commit -m "feat: add new feature [release]"
```

---

## Under the hood

### Project structure

```
your-package/
├── .github/
│   └── workflows/
│       ├── tests.yml           # Runs tests on push/PR
│       ├── release.yml         # Handles versioning and PyPI publishing
│       └── deploy-docs.yml     # Deploys documentation (optional)
├── src/
│   └── your_package/
│       └── __init__.py
├── tests/
│   └── test_example.py
├── docs/                       # Created if Starlight selected
├── .gitignore
├── .python-version
├── .releaserc.json
├── CHANGELOG.md
├── LICENSE.md
├── pyproject.toml
└── README.md
```

### Configuration files

#### pyproject.toml

Project metadata and dependencies using the [pyproject.toml standard](https://packaging.python.org/en/latest/specifications/pyproject-toml/):

- Build backend: hatchling
- Python version: >= 3.10
- Development dependencies in `[dependency-groups]`

See the [UV setup guide](/repository_setup_guides/virtual_environments/uv_setup/) for details on dependency management.

#### .releaserc.json

Configuration for semantic-release:

- Analyzes commits following the [conventional commits](/repository_setup_guides/version_control/semantic_commits/) specification
- Updates version in `pyproject.toml` using `uv version`
- Generates changelog and creates GitHub releases

### Commit conventions

The template uses [semantic commits](/repository_setup_guides/version_control/semantic_commits/) for automated versioning:

| Commit type | Version bump | Example |
|-------------|--------------|---------|
| `fix:` | Patch (0.0.x) | `fix: handle empty input` |
| `feat:` | Minor (0.x.0) | `feat: add export function` |
| `feat!:` or `BREAKING CHANGE:` | Major (x.0.0) | `feat!: change API` |

### GitHub Actions workflows

#### tests.yml

Runs on every push and pull request to `main`:

- Matrix testing across Python 3.10, 3.11, 3.12, and 3.13
- Uses UV with caching for fast dependency installation
- Executes pytest

See the [automated testing guide](/repository_setup_guides/ci_cd/automated_testing/) for details.

#### release.yml

Triggered after tests pass when the commit message contains `[release]`:

- Determines version bump from commit messages (feat = minor, fix = patch)
- Updates `pyproject.toml` and `CHANGELOG.md`
- Creates a GitHub release
- Publishes to PyPI

See the [releases guide](/repository_setup_guides/ci_cd/releases/) for details.

#### deploy-docs.yml

Created only if you selected Starlight documentation:

- Triggered on pushes to `main` that modify files in `docs/`
- Builds and deploys to GitHub Pages

See the [Starlight setup guide](/repository_setup_guides/documentation/starlight_setup/) for details.

## Learn more

- [UV setup](/repository_setup_guides/virtual_environments/uv_setup/) - dependency management
- [Semantic commits](/repository_setup_guides/version_control/semantic_commits/) - commit message conventions
- [GitHub Actions basics](/repository_setup_guides/ci_cd/github_actions_basics/) - workflow fundamentals
- [Automated testing](/repository_setup_guides/ci_cd/automated_testing/) - pytest with GitHub Actions
- [Releases](/repository_setup_guides/ci_cd/releases/) - semantic-release and PyPI publishing
- [Starlight setup](/repository_setup_guides/documentation/starlight_setup/) - documentation sites
