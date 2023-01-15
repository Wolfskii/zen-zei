module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier', 'standard'],
	plugins: ['svelte3', '@typescript-eslint'],
	ignorePatterns: ['*.cjs', 'commented out code.sonarlint(typescript:S125)'],
	overrides: [
		{
			files: ['*.svelte'],
			processor: 'svelte3/svelte3',
			rules: {
				'no-tabs': 'off'
			}
		}
	],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	rules: {
		semi: ['error', 'never'],
		quotes: ['error', 'single'],
		'comma-dangle': ['error', 'never'],
		indent: ['error', 'tab'],
		'no-tabs': 'off',
		'@typescript-eslint/no-namespace': 'error'
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
}
