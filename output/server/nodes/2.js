import * as universal from '../entries/pages/_page.ts.js';

export const index = 2;
export const component = async () => (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+page.ts";
export const imports = ["_app/immutable/nodes/2.10d72aca.js","_app/immutable/chunks/index.b1f1455e.js"];
export const stylesheets = ["_app/immutable/assets/2.d7927e1c.css"];
export const fonts = [];
