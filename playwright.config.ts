import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	testDir: 'e2e'
}

export default config
