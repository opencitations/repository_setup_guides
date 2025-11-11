# Repository setup guides

This repository contains guides for setting up and maintaining Python development repositories.
## Documentation site

**View the full documentation at: https://opencitations.github.io/repository_setup_guides/**

## Topics covered

-   **Virtual environments**: Complete UV guide from installation to publishing
-   **Version control**: Semantic commits using the Conventional Commits specification
-   **CI/CD**: GitHub Actions workflows, automated testing with pytest and UV, automated releases with semantic-release
-   **Documentation**: Starlight setup with automated GitHub Pages deployment

## Local development

To run the documentation site locally:

```bash
cd docs
npm install
npm run dev
```

The site will be available at `http://localhost:4321/repository_setup_guides/`

## Structure

The documentation source files are located in:
-   `docs/src/content/docs/virtual_environments/`: Python dependency management
-   `docs/src/content/docs/version_control/`: Version control best practices
-   `docs/src/content/docs/ci_cd/`: Continuous integration and deployment guides
-   `docs/src/content/docs/documentation/`: Documentation site setup guides

## Example repositories

These repositories apply principles discussed in the guides:

-   [opencitations/oc_meta](https://github.com/opencitations/oc_meta)
-   [opencitations/heritrace](https://github.com/opencitations/heritrace)
-   [opencitations/time-agnostic-library](https://github.com/opencitations/time-agnostic-library)
