import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/kit/vite'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		csp: {
			directives: {
				'default-src': ["'self'", '*'],
				'style-src': ["'self'", "'unsafe-inline'", '*']
			}
		},
		csrf: {
			checkOrigin: false
		},
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: null,
			precompress: true,
			strict: true
		}),
		paths: {
			base: '/zen-zei'
		}
	}
}

export default config
