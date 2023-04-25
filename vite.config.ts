import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'

const config: UserConfig = {
	base: '/zen-zei/', // Change this to match your repo name
	plugins: [sveltekit()]
}

export default config
