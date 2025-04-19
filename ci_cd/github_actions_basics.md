# GitHub Actions Basics

GitHub Actions is a powerful and flexible automation platform integrated directly into GitHub. It allows you to automate your build, test, and deployment pipeline right from your repository.

## Core Concepts

-   **Workflow:** An automated process defined by a YAML file placed in the `.github/workflows/` directory of your repository. A workflow is made up of one or more jobs.
-   **Event:** A specific activity in your repository that triggers a workflow run (e.g., a `push` to a branch, a `pull_request` being opened, a `schedule`, or manual trigger `workflow_dispatch`).
-   **Job:** A set of steps that execute on the same runner. Jobs run in parallel by default, but can be configured to run sequentially if one job depends on another.
-   **Step:** An individual task within a job. A step can run shell commands or execute an *action*.
-   **Action:** A reusable piece of code that performs a specific task. Actions can be sourced from:
    -   The [GitHub Marketplace](https://github.com/marketplace?type=actions)
    -   Public repositories
    -   A directory within your own repository
-   **Runner:** A server (managed by GitHub or self-hosted) that runs your workflow jobs.

## Workflow Syntax

Workflows are defined using YAML syntax. Here's a basic example:

```yaml
# .github/workflows/greet.yml

# Workflow name (optional, shown on GitHub Actions tab)
name: Greetings

# Trigger: Run on pushes to the main branch
on:
  push:
    branches:
      - main
  # Allows manual triggering from the Actions tab
  workflow_dispatch:

# Jobs to run
jobs:
  # Job ID (must be unique within the workflow)
  say-hello:
    # Runner environment
    runs-on: ubuntu-latest

    # Steps to execute in this job
    steps:
      # Step 1: Use a pre-built action (checks out repository code)
      - name: Check out repository code
        uses: actions/checkout@v4 # Use version 4 of the checkout action

      # Step 2: Run a simple shell command
      - name: Say Hello
        run: echo "Hello, GitHub Actions!"

      # Step 3: Run a multi-line script
      - name: Multi-line script
        run: |
          echo "This is the first line."
          echo "This is the second line."
```

### Key Elements:

-   `name`: The name displayed for the workflow.
-   `on`: Defines the event(s) that trigger the workflow. See [Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows) for a full list.
-   `jobs`: Contains one or more jobs.
-   `jobs.<job_id>`: Defines a job with a unique ID.
-   `runs-on`: Specifies the type of runner (e.g., `ubuntu-latest`, `windows-latest`, `macos-latest`).
-   `steps`: A sequence of tasks within a job.
-   `steps.name`: An optional name for the step.
-   `steps.uses`: Specifies an action to run (e.g., `actions/checkout@v4`). Always use a specific version tag or commit SHA for security and stability.
-   `steps.run`: Executes command-line programs using the operating system's shell.

## How it Works

1.  You commit a `.github/workflows/your_workflow.yml` file to your repository.
2.  An event defined in the `on:` section occurs (e.g., you push code to `main`).
3.  GitHub detects the event and triggers the corresponding workflow.
4.  GitHub provisions a runner specified by `runs-on`.
5.  The runner executes the jobs defined in the workflow, running each step in sequence.
6.  You can view the progress and logs of the workflow run in the "Actions" tab of your repository.

This basic structure allows you to build complex automations for various development tasks, such as [Automated Testing](./automated_testing.md) and [Automated Releases](./releases.md). 