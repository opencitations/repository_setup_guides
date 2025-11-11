---
title: Starlight setup
description: Setting up Astro Starlight for documentation with GitHub Pages deployment
---

Starlight is a documentation theme built on Astro that provides a complete solution for creating technical documentation sites. This guide covers the setup process used in this repository, including project initialization, content organization, and automated deployment to GitHub Pages.

## Prerequisites

- Node.js (version 18 or higher)
- npm or another Node.js package manager
- Git repository hosted on GitHub
- Basic familiarity with markdown

## Initial setup

### Install dependencies

Create a `docs/` directory in your repository and initialize an Astro project with Starlight:

```bash
mkdir docs
cd docs
npm create astro@latest . -- --template starlight
```

The Starlight template includes the necessary dependencies:

```json
{
  "dependencies": {
    "@astrojs/starlight": "^0.36.2",
    "astro": "^5.6.1",
    "sharp": "^0.34.2"
  }
}
```

The `sharp` package is required by Astro for image optimization.

### Project structure

The Starlight template creates this structure:

```
docs/
├── astro.config.mjs          # Astro and Starlight configuration
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript configuration
├── public/                    # Static assets (favicon, images)
│   └── favicon.svg
└── src/
    ├── assets/               # Images to embed in markdown
    ├── content.config.ts     # Content collections configuration
    └── content/
        └── docs/             # All documentation markdown files
            └── index.mdx     # Homepage
```

All documentation content goes in `src/content/docs/`. This directory can contain markdown files (`.md` or `.mdx`) organized in subdirectories.

### Basic configuration

Edit `astro.config.mjs` to configure your documentation site:

```javascript
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'My Documentation',
      description: 'Site description for SEO',

      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/username/repository'
        },
      ],

      sidebar: [
        {
          label: 'Guides',
          items: [
            { label: 'Getting started', slug: 'guides/getting-started' },
          ],
        },
      ],
    }),
  ],
});
```

Configuration options:

- `title`: Site title displayed in the header
- `description`: Site description for search engines
- `social`: Social links displayed in the header (supports github, gitlab, discord, twitter, and more)
- `sidebar`: Manual navigation configuration

### Development and build scripts

The template includes npm scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

The build output is generated in the `dist/` directory.

## Content organization

### Directory structure

Organize documentation files in topic-based subdirectories:

```
src/content/docs/
├── index.mdx
├── guides/
│   ├── getting-started.md
│   └── advanced.md
├── api/
│   ├── overview.md
│   └── reference.md
└── examples/
    └── basic-usage.md
```

Each subdirectory can represent a navigation category in the sidebar.

### File naming conventions

- Use lowercase with underscores for multi-word file names: `getting_started.md`
- File names become URL slugs: `getting_started.md` → `/getting_started/`
- Use `.md` for standard markdown files
- Use `.mdx` when importing components

### Markdown frontmatter

Each markdown file requires frontmatter with at least a title:

```markdown
---
title: Page title
description: Page description for SEO and previews
---

Content starts here.
```

For the homepage, use the splash template:

```markdown
---
title: Site title
description: Site description
template: splash
hero:
  title: Hero title
  tagline: Hero subtitle or description
  actions:
    - text: Primary action
      link: /path/to/page/
      icon: right-arrow
      variant: primary
    - text: Secondary action
      link: https://external-site.com
      icon: external
      variant: secondary
---
```

The splash template provides a hero section with call-to-action buttons.

### Sidebar configuration

Configure the sidebar navigation in `astro.config.mjs`:

```javascript
sidebar: [
  {
    label: 'Category name',
    items: [
      { label: 'Page title', slug: 'directory/filename' },
      { label: 'Another page', slug: 'directory/other-file' },
    ],
  },
  {
    label: 'Another category',
    items: [
      { label: 'Page', slug: 'other-directory/page' },
    ],
  },
],
```

Sidebar features:

- Groups are defined with `label` and `items`
- Items reference content using `slug` (file path without extension, relative to `src/content/docs/`)
- Order is explicitly controlled
- Nesting is supported for subcategories

### Starlight components

Starlight provides built-in components for common documentation patterns. To use them, import in `.mdx` files:

```mdx
---
title: Page title
---

import { Card, CardGrid } from '@astrojs/starlight/components';

<CardGrid>
  <Card title="Feature one" icon="puzzle">
    Description of the first feature.
  </Card>
  <Card title="Feature two" icon="pencil">
    Description of the second feature.
  </Card>
</CardGrid>
```

Available components:

- `Card` and `CardGrid`: Display features or links in a grid layout
- `Tabs` and `TabItem`: Create tabbed content sections
- `Aside`: Highlight notes, tips, warnings, or cautions
- `Code`: Enhanced code blocks with additional features

Refer to the [Starlight components documentation](https://starlight.astro.build/guides/components/) for the complete list.

## GitHub Pages deployment

### Repository configuration

Enable GitHub Pages in your repository settings:

1. Navigate to Settings → Pages
2. Under "Build and deployment", select "GitHub Actions" as the source

### GitHub Actions workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v5

      - name: Install, build, and upload site
        uses: withastro/action@v5
        with:
          path: ./docs

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Workflow explanation:

- `on.push.branches`: Triggers on pushes to the main branch
- `on.workflow_dispatch`: Allows manual workflow execution
- `permissions`: Grants necessary permissions for GitHub Pages deployment
- `withastro/action@v5`: Handles Node.js setup, dependency installation, Astro build, and artifact upload
- `path: ./docs`: Specifies the subdirectory containing the Astro project
- `deploy-pages@v4`: Deploys the built site to GitHub Pages

The `withastro/action` simplifies the workflow by combining multiple steps:
1. Set up Node.js
2. Install dependencies with npm
3. Run `npm run build`
4. Upload the build artifact

### Site URL configuration

For GitHub Pages deployment, configure the site URL in `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://username.github.io',
  base: '/repository-name',

  integrations: [
    starlight({
      // ... other configuration
    }),
  ],
});
```

Configuration:

- `site`: Base URL for GitHub Pages (organization or user URL)
- `base`: Repository name as subpath

Internal links in content must include the base path:

```markdown
[Link to page](/repository-name/guides/getting-started/)
```

## Customization

### External links configuration

Configure external links to open in new tabs using rehype plugins. Install the plugin:

```bash
npm install rehype-external-links
```

Configure in `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { target: '_blank', rel: ['noopener', 'noreferrer'] }
      ]
    ],
  },

  // ... rest of configuration
});
```

This configuration:
- Opens external links in new tabs (`target: '_blank'`)
- Adds security attributes (`rel: ['noopener', 'noreferrer']`)
- Applies to all markdown content automatically

### Favicon customization

Replace the default favicon in `public/favicon.svg` with your own icon. Supported formats:

- SVG (recommended, adapts to light/dark mode)
- PNG or ICO (standard formats)

For SVG favicons that adapt to the color scheme:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <style>
    path { fill: #000; }
    @media (prefers-color-scheme: dark) {
      path { fill: #fff; }
    }
  </style>
  <path d="..." />
</svg>
```

### Theme customization

Starlight provides theming options in `astro.config.mjs`:

```javascript
starlight({
  customCss: [
    './src/styles/custom.css',
  ],

  expressiveCode: {
    themes: ['github-dark', 'github-light'],
  },
})
```

Customization options:

- `customCss`: Load custom CSS files for styling overrides
- `expressiveCode.themes`: Configure code block themes for light and dark modes
- `logo`: Add a custom logo to the header
- `favicon`: Specify a custom favicon path

Refer to the [Starlight customization documentation](https://starlight.astro.build/guides/customization/) for advanced theming options.

## Related guides

- [GitHub Actions basics](../ci_cd/github_actions_basics.md): Understanding GitHub Actions workflows
- [Semantic commits](../version_control/semantic_commits.md): Commit message conventions for documentation changes

## References

- [Astro documentation](https://docs.astro.build/)
- [Starlight documentation](https://starlight.astro.build/)
- [Starlight GitHub repository](https://github.com/withastro/starlight)
- [withastro/action documentation](https://github.com/withastro/action)
