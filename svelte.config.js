import adapter from 'svelte-adapter-github'
import { vitePreprocess } from '@sveltejs/kit/vite'

export default {
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			fallback: null,
			precompress: false,
			domain: '',
			jekyll: false,
			paths: {
				base: process.env.NODE_ENV === 'development' ? '' : '/zen-zei'
			}
		})
	},
	preprocess: vitePreprocess()
}
