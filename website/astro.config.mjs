// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://biawak-doc.vercel.app',
	integrations: [
		starlight({
			title: 'Biawak Framework',
			favicon: '/favico.svg',
			logo: {
				src: './src/assets/logo-biawak.png',
				alt: 'Biawak Framework Logo',
			},
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
					label: '🤖 AI Integration',
					items: [
						{ label: 'Integrasi AI Framework', slug: 'ai/framework-ai' },
						{ label: 'Paket NPM ai-biawak-sdk', slug: 'ai/ai-biawak-sdk' },
					],
				},
				{
					label: '📦 Client & Realtime SDKs',
					items: [
						{ label: 'Paket NPM biawak-sdk (WebSocket)', slug: 'sdk/biawak-sdk' },
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
