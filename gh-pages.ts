var ghpages = require('gh-pages')

ghpages.publish(
	'public', // path to public directory
	{
		branch: 'gh-pages',
		repo: 'https://github.com/Wolfskii/zen-zei.git', // Update to point to your repository
		user: {
			name: 'Dawid Kaleta', // update to use your name
			email: 'dawid.kaleta@outlook.com' // Update to use your email
		}
	},
	() => {
		console.log('Deploy Complete!')
	}
)
