// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.rocketflag.app',
	integrations: [
		starlight({
			title: 'RocketFlag Docs',
			logo: {
				light: './src/assets/rocketflag-logo-text.svg',
				dark: './src/assets/rocketflag-logo-text-light.svg',
				replacesTitle: true,
			},
			favicon: '/favicon.svg',
			components: {
				ThemeProvider: './src/components/ThemeProvider.astro',
				ThemeSelect: './src/components/ThemeSelect.astro',
			},
			expressiveCode: {
				styleOverrides: { borderRadius: '0' },
			},
			customCss: [
				'@fontsource/geist/400.css',
				'@fontsource/geist/500.css',
				'@fontsource/geist/600.css',
				'@fontsource/geist/700.css',
				'@fontsource/jetbrains-mono/400.css',
				'@fontsource/jetbrains-mono/500.css',
				'./src/styles/theme.css',
			],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/RocketFlag' }
			],
			sidebar: [
				{
					label: 'Introduction',
					items: [
						{ label: 'What is RocketFlag?', slug: 'intro/what-is-rocketflag' },
						{ label: 'Concepts', slug: 'intro/concepts' },
						{ label: 'Accounts & Sign-in', slug: 'intro/accounts-and-sign-in' },
						{ label: 'Quick Start Guide', slug: 'guides/quick-start' },
					],
				},
				{
					label: 'User Guides',
					items: [
						{ label: 'Organisations & Users', slug: 'guides/organisations-and-users' },
						{ label: 'Projects & Environments', slug: 'guides/projects-and-environments' },
						{ label: 'Environment Management', slug: 'guides/environment-management' },
						{ label: 'Feature Flags', slug: 'guides/feature-flags' },
						{ label: 'Group (Multi-Env) Flags', slug: 'guides/group-flags' },
						{ label: 'Analytics & Stats', slug: 'guides/analytics-and-stats' },
						{ label: 'Audit Logs', slug: 'guides/audit-logs' },
						{ label: 'Managing Stale Flags', slug: 'guides/stale-flags' },
						{ label: 'Best Practices & Workflow', slug: 'guides/best-practices' },
						{ label: 'Security & Privacy', slug: 'guides/security-and-privacy' },
						{ label: 'FAQ & Troubleshooting', slug: 'guides/faq' },
					],
				},
				{
					label: 'Developer Guides',
					items: [
						{ label: 'API Reference', slug: 'dev/api-reference' },
						{ label: 'Node SDK', slug: 'dev/node-sdk' },
						{ label: 'React SDK', slug: 'dev/react-sdk' },
						{ label: 'Go SDK', slug: 'dev/go-sdk' },
						{ label: 'Protected Keys', slug: 'dev/protected-keys' },
						{ label: 'Per-Environment Cohorts', slug: 'dev/per-env-cohorts' },
						{ label: 'Sample Projects', slug: 'dev/examples' },
					],
				},
			],
		}),
	],
});
