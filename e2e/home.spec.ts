import { expect, test } from '@playwright/test'

test('home renders the mixer title', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByRole('heading', { name: 'Build a quiet that is yours.' })).toBeVisible()
})
