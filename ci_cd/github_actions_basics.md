# GitHub Actions basics

GitHub Actions is a powerful and flexible automation platform integrated directly into GitHub. It allows you to automate your build, test, and deployment pipeline right from your repository.

## Core concepts

-   **Workflow:** an automated process defined by a YAML file placed in the `.github/workflows/` directory of your repository. A workflow is made up of one or more jobs.
-   **Event:** a specific activity in your repository that triggers a workflow run (e.g., a `push` to a branch, a `pull_request` being opened, a `schedule`, or manual trigger `workflow_dispatch`).
-   **Job:** a set of steps that execute on the same runner. Jobs run in parallel by default, but can be configured to run sequentially if one job depends on another.
-   **Step:** an individual task within a job. A step can run shell commands or execute an *action*.
-   **Action:** a reusable piece of code that performs a specific task. Actions can be sourced from:
    -   The [GitHub Marketplace](https://github.com/marketplace?type=actions)
    -   Public repositories
    -   A directory within your own repository
-   **Runner:** a server (managed by GitHub or self-hosted) that runs your workflow jobs.

## Workflow syntax

Workflows are defined using YAML syntax. Here's a basic example:

```yaml
# .github/workflows/greet.yml

# Workflow name (optional, shown on GitHub Actions tab)
name: Greetings

# Trigger: run on pushes to the main branch
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
      # Step 1: use a pre-built action (checks out repository code)
      - name: Check out repository code
        uses: actions/checkout@v4 # Use version 4 of the checkout action

      # Step 2: run a simple shell command
      - name: Say hello
        run: echo "Hello, GitHub Actions!"

      # Step 3: run a multi-line script
      - name: Multi-line script
        run: |
          echo "This is the first line."
          echo "This is the second line."
```

### Key elements:

-   `name`: the name displayed for the workflow.
-   `on`: defines the event(s) that trigger the workflow. See [Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows) for a full list.
-   `jobs`: contains one or more jobs.
-   `jobs.<job_id>`: defines a job with a unique ID.
-   `runs-on`: specifies the type of runner (e.g., `ubuntu-latest`, `windows-latest`, `macos-latest`).
-   `steps`: a sequence of tasks within a job.
-   `steps.name`: an optional name for the step.
-   `steps.uses`: specifies an action to run (e.g., `actions/checkout@v4`). Always use a specific version tag or commit SHA for security and stability.
-   `steps.run`: executes command-line programs using the operating system's shell.

## How it works

1.  You commit a `.github/workflows/your_workflow.yml` file to your repository.
2.  An event defined in the `on:` section occurs (e.g., you push code to `main`).
3.  GitHub detects the event and triggers the corresponding workflow.
4.  GitHub provisions a runner specified by `runs-on`.
5.  The runner executes the jobs defined in the workflow, running each step in sequence.
6.  You can view the progress and logs of the workflow run in the "Actions" tab of your repository.

This basic structure allows you to build complex automations for various development tasks, such as [Automated testing](./automated_testing.md) and [Automated releases](./releases.md). 