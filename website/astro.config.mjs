// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://biawak.web.id',
	integrations: [
		starlight({
			title: 'Biawak Framework 🦎',
			customCss: ['./src/styles/custom.css'],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/robyajo/biawak' },
			],
			editLink: {
				baseUrl: 'https://github.com/robyajo/biawak/tree/main/website/',
			},
			sidebar: [
				{
					label: '🚀 Getting Started',
					items: [
						{ label: 'Pengenalan & Instalasi', slug: 'getting-started/quick-start' },
					],
				},
				{
					label: '🗄️ Database & ORM',
					items: [
						{ label: 'Zero-Config SQLite → Production MySQL', slug: 'database/sqlite-to-mysql' },
					],
				},
				{
					label: '⚡ CLI & Developer Tools',
					items: [
						{ label: 'Biawak Code Generator (make)', slug: 'cli/generator' },
					],
				},
				{
					label: '📢 Release Notes & Blog',
					items: [
						{ autogenerate: { directory: 'blog' } },
					],
				},
			],
		}),
	],
});
