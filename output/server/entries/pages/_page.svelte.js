import { c as create_ssr_component, e as escape, d as add_attribute, v as validate_component } from "../../chunks/index.js";
const SoundTileLocalFile_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: ".sound-tile.svelte-20ljdp{background-color:rgba(0, 0, 0, 0.2);aspect-ratio:1/1;padding:2rem;border-radius:10px;display:flex;flex-direction:column;text-align:center}",
  map: null
};
const SoundTileLocalFile = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { soundName } = $$props;
  let { soundFile } = $$props;
  if ($$props.soundName === void 0 && $$bindings.soundName && soundName !== void 0)
    $$bindings.soundName(soundName);
  if ($$props.soundFile === void 0 && $$bindings.soundFile && soundFile !== void 0)
    $$bindings.soundFile(soundFile);
  $$result.css.add(css$2);
  return `<div class="sound-tile svelte-20ljdp"><h3>${escape(soundName)}</h3>
	<button>${`Play`}</button>
	<audio loop><source${add_attribute("src", soundFile, 0)}></audio>
	${slots.default ? slots.default({}) : ``}
</div>`;
});
const SoundTileYoutube_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".sound-tile.svelte-20ljdp{background-color:rgba(0, 0, 0, 0.2);aspect-ratio:1/1;padding:2rem;border-radius:10px;display:flex;flex-direction:column;text-align:center}",
  map: null
};
const SoundTileYoutube = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { soundName } = $$props;
  let { youTubeUrl } = $$props;
  let isPlaying = false;
  let player;
  function onYouTubeIframeAPIReady() {
    player = new window.YT.Player(
      "player",
      {
        height: "0",
        width: "0",
        videoId: getYouTubeVideoId(),
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          loop: 1,
          modestbranding: 1,
          playsinline: 1,
          showinfo: 0,
          iv_load_policy: 3,
          origin: window.location.host
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      }
    );
  }
  function onPlayerReady(event) {
    player.playVideo();
    isPlaying = true;
  }
  function onPlayerStateChange(event) {
    if (event.data === window.YT.PlayerState.PLAYING) {
      isPlaying = true;
    } else {
      isPlaying = false;
    }
  }
  function getYouTubeVideoId() {
    const videoIdMatch = youTubeUrl.match(/(?:\/|v=)([a-zA-Z0-9_-]{11}).*/);
    if (videoIdMatch) {
      return videoIdMatch[1];
    }
    throw new Error("Invalid YouTube URL");
  }
  if ($$props.soundName === void 0 && $$bindings.soundName && soundName !== void 0)
    $$bindings.soundName(soundName);
  if ($$props.youTubeUrl === void 0 && $$bindings.youTubeUrl && youTubeUrl !== void 0)
    $$bindings.youTubeUrl(youTubeUrl);
  $$result.css.add(css$1);
  {
    if (youTubeUrl && typeof window !== "undefined" && !window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    } else if (youTubeUrl && typeof window !== "undefined" && window.YT) {
      onYouTubeIframeAPIReady();
    }
  }
  return `<div class="sound-tile svelte-20ljdp"><h3>${escape(soundName)}</h3>
	${youTubeUrl ? `<div id="player"></div>` : `${slots.default ? slots.default({}) : ``}`}

	<button>${isPlaying ? `Pause` : `Play`}</button>
</div>`;
});
const SoundTile = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { soundName } = $$props;
  let { soundFile = "" } = $$props;
  let { youTubeUrl = "" } = $$props;
  if ($$props.soundName === void 0 && $$bindings.soundName && soundName !== void 0)
    $$bindings.soundName(soundName);
  if ($$props.soundFile === void 0 && $$bindings.soundFile && soundFile !== void 0)
    $$bindings.soundFile(soundFile);
  if ($$props.youTubeUrl === void 0 && $$bindings.youTubeUrl && youTubeUrl !== void 0)
    $$bindings.youTubeUrl(youTubeUrl);
  return `${soundFile !== "" ? `${validate_component(SoundTileLocalFile, "SoundTileLocalFile").$$render($$result, { soundName, soundFile }, {}, {})}` : `${youTubeUrl !== "" ? `${validate_component(SoundTileYoutube, "SoundTileYoutube").$$render($$result, { soundName, youTubeUrl }, {}, {})}` : ``}`}`;
});
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: ":root{display:flex;justify-content:center}.intro.svelte-1iwuu9i{display:flex;flex-direction:column;margin-bottom:2rem}.sound-tiles.svelte-1iwuu9i{display:flex;gap:2rem}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<div class="intro svelte-1iwuu9i"><h1>Zen-Zei</h1>
	<p class="sub-heading">Relax to the sounds of nature.</p></div>

<div class="sound-tiles svelte-1iwuu9i">${validate_component(SoundTile, "SoundTile").$$render(
    $$result,
    {
      soundName: "Thunder",
      youTubeUrl: "https://www.youtube.com/watch?v=NI0M03vCoXg"
    },
    {},
    {}
  )}
	${validate_component(SoundTile, "SoundTile").$$render(
    $$result,
    {
      soundName: "Rain",
      soundFile: "sounds/rain.wav"
    },
    {},
    {}
  )}
</div>`;
});
export {
  Page as default
};
