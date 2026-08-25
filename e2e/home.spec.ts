import { expect, test } from '@playwright/test'

test('home renders the mixer title', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByRole('heading', { name: 'Build a quiet that is yours.' })).toBeVisible()
	await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0)
	await expect(page.getByRole('button', { name: /Storm/ })).toBeVisible()
	await expect(page.getByRole('button', { name: /Surprise/ })).toBeVisible()
	await expect(page.getByRole('button', { name: /Favourites/ })).toBeVisible()
	await expect(page.getByRole('button', { name: 'New list' })).toBeVisible()
	await expect(page.getByRole('button', { name: /Keep screen on|Let the screen sleep/ })).toBeVisible()
	await expect(page.getByRole('button', { name: 'Listen' })).toBeVisible()
	await expect(page.getByRole('button', { name: /Use a still background|Use a moving background/ })).toBeVisible()
	await expect(page.getByRole('button', { name: 'Any source' })).toBeVisible()
	await expect(page.getByRole('button', { name: 'Hush master' })).toBeVisible()
	await expect(page.getByRole('button', { name: 'Play last scene' })).toHaveCount(0)
	await expect(page.getByRole('link', { name: /Open Thunder on YouTube/ })).toBeVisible()
})

test('listen mode hides the library and keeps scenes', async ({ page }) => {
	await page.goto('/')
	await page.getByRole('button', { name: 'Listen' }).click()
	await expect(page.getByRole('button', { name: /Favourites/ })).toHaveCount(0)
	await expect(page.getByRole('button', { name: 'Add sound' })).toHaveCount(0)
	await expect(page.getByRole('heading', { name: 'Build a quiet that is yours.' })).toHaveCount(0)
	await expect(page.getByRole('button', { name: 'New list' })).toHaveCount(0)
	await expect(page.getByRole('heading', { name: 'Listening' })).toBeVisible()
	await expect(page.getByRole('button', { name: /Storm/ })).toBeVisible()
	await page.getByRole('button', { name: 'Show library' }).click()
	await expect(page.getByRole('heading', { name: 'Build a quiet that is yours.' })).toBeVisible()
	await expect(page.getByRole('button', { name: /Favourites/ })).toBeVisible()
})

test('shared mix prompt appears from the query string', async ({ page }) => {
	await page.goto('/?mix=00000000-0000-4000-8000-000000000011:80&master=90')
	await expect(page.getByText('Play this mix?')).toBeVisible()
	await expect(page.getByRole('button', { name: 'Play mix' })).toBeVisible()
})
