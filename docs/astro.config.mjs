import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
	markdown: {
		rehypePlugins: [
			[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]
		],
	},
	// GitHub Pages configuration
	site: 'https://opencitations.github.io',
	base: '/repository_setup_guides',

	integrations: [
		starlight({
			title: 'Repository setup guides',
			description: 'Collection of guides for setting up and maintaining software development repositories',

			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/opencitations/repository_setup_guides' },
			],

			sidebar: [
				{
					label: 'Virtual environments',
					items: [
						{ label: 'UV setup', slug: 'virtual_environments/uv_setup' },
					],
				},
				{
					label: 'Version control',
					items: [
						{ label: 'Semantic commits', slug: 'version_control/semantic_commits' },
					],
				},
				{
					label: 'CI/CD',
					items: [
						{ label: 'GitHub Actions basics', slug: 'ci_cd/github_actions_basics' },
						{ label: 'Automated testing', slug: 'ci_cd/automated_testing' },
						{ label: 'Releases', slug: 'ci_cd/releases' },
					],
				},
			],
		}),
	],
});
