// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	// GitHub Pages configuration
	site: 'https://opencitations.github.io',
	base: '/repository_setup_guides',

	integrations: [
		starlight({
			title: 'Repository Setup Guides',
			description: 'Collection of guides for setting up and maintaining software development repositories',

			// Social links in header
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/opencitations/repository_setup_guides' },
			],

			// Enable edit links
			editLink: {
				baseUrl: 'https://github.com/opencitations/repository_setup_guides/edit/main/docs/',
			},

			// Sidebar navigation with nested categories
			sidebar: [
				{
					label: 'CI/CD',
					items: [
						{ label: 'GitHub Actions basics', slug: 'ci_cd/github_actions_basics' },
						{ label: 'Automated testing', slug: 'ci_cd/automated_testing' },
						{ label: 'Releases', slug: 'ci_cd/releases' },
					],
				},
				{
					label: 'Version control',
					items: [
						{ label: 'Semantic commits', slug: 'version_control/semantic_commits' },
					],
				},
				{
					label: 'Virtual environments',
					items: [
						{ label: 'UV setup', slug: 'virtual_environments/uv_setup' },
					],
				},
			],
		}),
	],
});
