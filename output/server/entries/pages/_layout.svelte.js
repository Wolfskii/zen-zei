import { c as create_ssr_component, v as validate_component } from "../../chunks/index.js";
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<header>
</header>`;
});
const Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<footer></footer>`;
});
const styles = "";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div id="app">${validate_component(Header, "Header").$$render($$result, {}, {}, {})}
	<main>${slots.default ? slots.default({}) : ``}</main>
	${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}</div>

<div id="overlay"></div>

<video autoplay muted loop id="bg-video"><source src="videos/rain.mp4" type="video/mp4"></video>`;
});
export {
  Layout as default
};
