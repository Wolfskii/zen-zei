export const manifest = {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","robots.txt","sounds/rain.wav","videos/rain.mp4"]),
	mimeTypes: {".png":"image/png",".txt":"text/plain",".wav":"audio/wav",".mp4":"video/mp4"},
	_: {
		client: {"start":"_app/immutable/entry/start.ab825224.js","app":"_app/immutable/entry/app.99110e14.js","imports":["_app/immutable/entry/start.ab825224.js","_app/immutable/chunks/index.b1f1455e.js","_app/immutable/chunks/singletons.2370c4c3.js","_app/immutable/chunks/paths.817cd703.js","_app/immutable/entry/app.99110e14.js","_app/immutable/chunks/index.b1f1455e.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			() => import('./nodes/0.js'),
			() => import('./nodes/1.js'),
			() => import('./nodes/2.js'),
			() => import('./nodes/3.js')
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/about",
				pattern: /^\/about\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
};
