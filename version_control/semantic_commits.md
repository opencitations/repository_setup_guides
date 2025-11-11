# Understanding semantic commits

Semantic commits, based on the [Conventional Commits specification](https://www.conventionalcommits.org/), provide a standardized format for commit messages. This format makes commit histories more readable and enables automation for tasks like version bumping and changelog generation.

## Specification overview

A semantic commit message follows this structure:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Components:

1.  **Type:** a mandatory prefix indicating the kind of change introduced by the commit. Common types include:
    *   `feat`: introduces a new feature to the codebase (correlates with `MINOR` in semantic versioning).
    *   `fix`: patches a bug in the codebase (correlates with `PATCH` in semantic versioning).
    *   `build`: changes that affect the build system or external dependencies (e.g., npm, poetry).
    *   `chore`: other changes that don't modify source or test files (e.g., updating build tasks, package manager configs).
    *   `ci`: changes to CI configuration files and scripts (e.g., GitHub Actions).
    *   `docs`: documentation-only changes.
    *   `style`: changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.).
    *   `refactor`: a code change that neither fixes a bug nor adds a feature.
    *   `perf`: a code change that improves performance.
    *   `test`: adding missing tests or correcting existing tests.

2.  **Scope (optional):** a noun enclosed in parentheses providing contextual information about the area of the codebase affected by the change (e.g., `feat(api): ...`, `fix(parser): ...`).

3.  **Description:** a concise summary of the code change, written in the imperative, present tense (e.g., "add", "change", "fix", not "added", "changed", "fixed"). It should not be capitalized and should not end with a period.

4.  **Body (optional):** a longer description providing additional context, motivation for the change, and contrasting it with previous behavior. Separated from the description by a blank line.

5.  **Footer(s) (optional):** one or more lines providing meta-information. Separated from the body by a blank line. Common footers:
    *   **Breaking changes:** starts with `BREAKING CHANGE:` (or `BREAKING-CHANGE:`) followed by a description of the breaking API change. A breaking change can be part of any commit *type*. It correlates with `MAJOR` in semantic versioning.
    *   **Issue references:** linking to issue trackers (e.g., `Refs: #13`, `Closes: #42`, `Fixes: #101`).

## Examples

**Simple fix:**
```
fix: correct minor typo in function name
```

**New feature with scope:**
```
feat(auth): implement JWT authentication middleware
```

**Commit with body and footer:**
```
fix: prevent race condition in user update

The previous implementation could lead to data inconsistency
if two update requests arrived simultaneously.
This change introduces a lock mechanism during the update process.

Closes: #78
```

**Commit with breaking change:**
```
refactor!: drop support for Python 3.8

Python 3.8 is nearing its end-of-life and is no longer actively supported.
Users must upgrade to Python 3.9 or newer.

BREAKING CHANGE: Removed compatibility code for Python 3.8. Projects using this library now require Python >= 3.9.
```
(Note: the `!` after the type/scope also indicates a breaking change). 

## Benefits

-   **Readability:** creates a more understandable and navigable Git history.
-   **Automation:**
    -   **Changelog generation:** tools can automatically parse commits to generate human-readable CHANGELOG files (e.g., `standard-version`, `git-cliff`).
    -   **Semantic versioning:** tools can automatically determine the next version number (MAJOR, MINOR, PATCH) based on the types (`feat`, `fix`) and breaking changes in the commits since the last release. This is utilized by tools like `semantic-release`, as shown in the [Automated releases guide](../ci_cd/releases.md).
    -   **Communication:** clearly communicates the nature of changes to team members, the public, and other stakeholders.