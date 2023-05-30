import{S as H,i as L,s as Z,D as X,k as T,q as V,a as F,l as N,m as P,r as R,h as y,c as S,E as z,n as Y,b as E,F as g,K as J,u as Q,G as W,H as $,I as x,g as I,d as U,v as ee,f as te,C as D,e as G,y as C,z as O,A as j,B}from"../chunks/index.b1f1455e.js";const le=!0,we=Object.freeze(Object.defineProperty({__proto__:null,prerender:le},Symbol.toStringTag,{value:"Module"}));function ne(u){let e;return{c(){e=V("Play")},l(t){e=R(t,"Play")},m(t,l){E(t,e,l)},d(t){t&&y(e)}}}function oe(u){let e;return{c(){e=V("Pause")},l(t){e=R(t,"Pause")},m(t,l){E(t,e,l)},d(t){t&&y(e)}}}function se(u){let e,t,l,o,n,i,f,s,_,m,h,w,c;function d(r,b){return r[2]?oe:ne}let k=d(u),p=k(u);const v=u[5].default,a=X(v,u,u[4],null);return{c(){e=T("div"),t=T("h3"),l=V(u[0]),o=F(),n=T("button"),p.c(),i=F(),f=T("audio"),s=T("source"),m=F(),a&&a.c(),this.h()},l(r){e=N(r,"DIV",{class:!0});var b=P(e);t=N(b,"H3",{});var A=P(t);l=R(A,u[0]),A.forEach(y),o=S(b),n=N(b,"BUTTON",{});var M=P(n);p.l(M),M.forEach(y),i=S(b),f=N(b,"AUDIO",{});var q=P(f);s=N(q,"SOURCE",{src:!0}),q.forEach(y),m=S(b),a&&a.l(b),b.forEach(y),this.h()},h(){z(s.src,_=u[1])||Y(s,"src",_),f.loop=!0,Y(e,"class","sound-tile svelte-20ljdp")},m(r,b){E(r,e,b),g(e,t),g(t,l),g(e,o),g(e,n),p.m(n,null),g(e,i),g(e,f),g(f,s),g(e,m),a&&a.m(e,null),h=!0,w||(c=J(n,"click",u[3]),w=!0)},p(r,[b]){(!h||b&1)&&Q(l,r[0]),k!==(k=d(r))&&(p.d(1),p=k(r),p&&(p.c(),p.m(n,null))),(!h||b&2&&!z(s.src,_=r[1]))&&Y(s,"src",_),a&&a.p&&(!h||b&16)&&W(a,v,r,r[4],h?x(v,r[4],b,null):$(r[4]),null)},i(r){h||(I(a,r),h=!0)},o(r){U(a,r),h=!1},d(r){r&&y(e),p.d(),a&&a.d(r),w=!1,c()}}}function ue(u,e,t){let{$$slots:l={},$$scope:o}=e,{soundName:n}=e,{soundFile:i}=e,f=!1;function s(m){const h=m.target.nextElementSibling;h instanceof HTMLAudioElement&&_(h)}function _(m){m.paused?(m.play(),t(2,f=!0)):(m.pause(),t(2,f=!1))}return u.$$set=m=>{"soundName"in m&&t(0,n=m.soundName),"soundFile"in m&&t(1,i=m.soundFile),"$$scope"in m&&t(4,o=m.$$scope)},[n,i,f,s,o,l]}class ie extends H{constructor(e){super(),L(this,e,ue,se,Z,{soundName:0,soundFile:1})}}function re(u){let e;const t=u[5].default,l=X(t,u,u[4],null);return{c(){l&&l.c()},l(o){l&&l.l(o)},m(o,n){l&&l.m(o,n),e=!0},p(o,n){l&&l.p&&(!e||n&16)&&W(l,t,o,o[4],e?x(t,o[4],n,null):$(o[4]),null)},i(o){e||(I(l,o),e=!0)},o(o){U(l,o),e=!1},d(o){l&&l.d(o)}}}function ae(u){let e;return{c(){e=T("div"),this.h()},l(t){e=N(t,"DIV",{id:!0}),P(e).forEach(y),this.h()},h(){Y(e,"id","player")},m(t,l){E(t,e,l)},p:D,i:D,o:D,d(t){t&&y(e)}}}function fe(u){let e;return{c(){e=V("Play")},l(t){e=R(t,"Play")},m(t,l){E(t,e,l)},d(t){t&&y(e)}}}function ce(u){let e;return{c(){e=V("Pause")},l(t){e=R(t,"Pause")},m(t,l){E(t,e,l)},d(t){t&&y(e)}}}function de(u){let e,t,l,o,n,i,f,s,_,m,h;const w=[ae,re],c=[];function d(a,r){return a[1]?0:1}n=d(u),i=c[n]=w[n](u);function k(a,r){return a[2]?ce:fe}let p=k(u),v=p(u);return{c(){e=T("div"),t=T("h3"),l=V(u[0]),o=F(),i.c(),f=F(),s=T("button"),v.c(),this.h()},l(a){e=N(a,"DIV",{class:!0});var r=P(e);t=N(r,"H3",{});var b=P(t);l=R(b,u[0]),b.forEach(y),o=S(r),i.l(r),f=S(r),s=N(r,"BUTTON",{});var A=P(s);v.l(A),A.forEach(y),r.forEach(y),this.h()},h(){Y(e,"class","sound-tile svelte-20ljdp")},m(a,r){E(a,e,r),g(e,t),g(t,l),g(e,o),c[n].m(e,null),g(e,f),g(e,s),v.m(s,null),_=!0,m||(h=J(s,"click",u[3]),m=!0)},p(a,[r]){(!_||r&1)&&Q(l,a[0]);let b=n;n=d(a),n===b?c[n].p(a,r):(ee(),U(c[b],1,1,()=>{c[b]=null}),te(),i=c[n],i?i.p(a,r):(i=c[n]=w[n](a),i.c()),I(i,1),i.m(e,f)),p!==(p=k(a))&&(v.d(1),v=p(a),v&&(v.c(),v.m(s,null)))},i(a){_||(I(i),_=!0)},o(a){U(i),_=!1},d(a){a&&y(e),c[n].d(),v.d(),m=!1,h()}}}function _e(u,e,t){let{$$slots:l={},$$scope:o}=e,{soundName:n}=e,{youTubeUrl:i}=e,f=!1,s;function _(){s=new window.YT.Player("player",{height:"0",width:"0",videoId:w(),host:"https://www.youtube-nocookie.com",playerVars:{autoplay:0,controls:0,disablekb:1,enablejsapi:1,loop:1,modestbranding:1,playsinline:1,showinfo:0,iv_load_policy:3,origin:window.location.host},events:{onReady:m,onStateChange:h}})}function m(d){s.playVideo(),t(2,f=!0)}function h(d){d.data===window.YT.PlayerState.PLAYING?t(2,f=!0):t(2,f=!1)}function w(){const d=i.match(/(?:\/|v=)([a-zA-Z0-9_-]{11}).*/);if(d)return d[1];throw new Error("Invalid YouTube URL")}function c(d){f?s.pauseVideo():s.playVideo(),t(2,f=!f)}return u.$$set=d=>{"soundName"in d&&t(0,n=d.soundName),"youTubeUrl"in d&&t(1,i=d.youTubeUrl),"$$scope"in d&&t(4,o=d.$$scope)},u.$$.update=()=>{var d;if(u.$$.dirty&2)if(i&&typeof window<"u"&&!window.YT){const k=document.createElement("script");k.src="https://www.youtube.com/iframe_api";const p=document.getElementsByTagName("script")[0];(d=p==null?void 0:p.parentNode)==null||d.insertBefore(k,p),window.onYouTubeIframeAPIReady=_}else i&&typeof window<"u"&&window.YT&&_()},[n,i,f,c,o,l]}class me extends H{constructor(e){super(),L(this,e,_e,de,Z,{soundName:0,youTubeUrl:1})}}function he(u){let e,t;return e=new me({props:{soundName:u[0],youTubeUrl:u[2]}}),{c(){C(e.$$.fragment)},l(l){O(e.$$.fragment,l)},m(l,o){j(e,l,o),t=!0},p(l,o){const n={};o&1&&(n.soundName=l[0]),o&4&&(n.youTubeUrl=l[2]),e.$set(n)},i(l){t||(I(e.$$.fragment,l),t=!0)},o(l){U(e.$$.fragment,l),t=!1},d(l){B(e,l)}}}function be(u){let e,t;return e=new ie({props:{soundName:u[0],soundFile:u[1]}}),{c(){C(e.$$.fragment)},l(l){O(e.$$.fragment,l)},m(l,o){j(e,l,o),t=!0},p(l,o){const n={};o&1&&(n.soundName=l[0]),o&2&&(n.soundFile=l[1]),e.$set(n)},i(l){t||(I(e.$$.fragment,l),t=!0)},o(l){U(e.$$.fragment,l),t=!1},d(l){B(e,l)}}}function ye(u){let e,t,l,o;const n=[be,he],i=[];function f(s,_){return s[1]!==""?0:s[2]!==""?1:-1}return~(e=f(u))&&(t=i[e]=n[e](u)),{c(){t&&t.c(),l=G()},l(s){t&&t.l(s),l=G()},m(s,_){~e&&i[e].m(s,_),E(s,l,_),o=!0},p(s,[_]){let m=e;e=f(s),e===m?~e&&i[e].p(s,_):(t&&(ee(),U(i[m],1,1,()=>{i[m]=null}),te()),~e?(t=i[e],t?t.p(s,_):(t=i[e]=n[e](s),t.c()),I(t,1),t.m(l.parentNode,l)):t=null)},i(s){o||(I(t),o=!0)},o(s){U(t),o=!1},d(s){~e&&i[e].d(s),s&&y(l)}}}function pe(u,e,t){let{soundName:l}=e,{soundFile:o=""}=e,{youTubeUrl:n=""}=e;return u.$$set=i=>{"soundName"in i&&t(0,l=i.soundName),"soundFile"in i&&t(1,o=i.soundFile),"youTubeUrl"in i&&t(2,n=i.youTubeUrl)},[l,o,n]}class K extends H{constructor(e){super(),L(this,e,pe,ye,Z,{soundName:0,soundFile:1,youTubeUrl:2})}}function ge(u){let e,t,l,o,n,i,f,s,_,m,h,w;return _=new K({props:{soundName:"Thunder",youTubeUrl:"https://www.youtube.com/watch?v=NI0M03vCoXg"}}),h=new K({props:{soundName:"Rain",soundFile:"sounds/rain.wav"}}),{c(){e=T("div"),t=T("h1"),l=V("Zen-Zei"),o=F(),n=T("p"),i=V("Relax to the sounds of nature."),f=F(),s=T("div"),C(_.$$.fragment),m=F(),C(h.$$.fragment),this.h()},l(c){e=N(c,"DIV",{class:!0});var d=P(e);t=N(d,"H1",{});var k=P(t);l=R(k,"Zen-Zei"),k.forEach(y),o=S(d),n=N(d,"P",{class:!0});var p=P(n);i=R(p,"Relax to the sounds of nature."),p.forEach(y),d.forEach(y),f=S(c),s=N(c,"DIV",{class:!0});var v=P(s);O(_.$$.fragment,v),m=S(v),O(h.$$.fragment,v),v.forEach(y),this.h()},h(){Y(n,"class","sub-heading"),Y(e,"class","intro svelte-1iwuu9i"),Y(s,"class","sound-tiles svelte-1iwuu9i")},m(c,d){E(c,e,d),g(e,t),g(t,l),g(e,o),g(e,n),g(n,i),E(c,f,d),E(c,s,d),j(_,s,null),g(s,m),j(h,s,null),w=!0},p:D,i(c){w||(I(_.$$.fragment,c),I(h.$$.fragment,c),w=!0)},o(c){U(_.$$.fragment,c),U(h.$$.fragment,c),w=!1},d(c){c&&y(e),c&&y(f),c&&y(s),B(_),B(h)}}}class ke extends H{constructor(e){super(),L(this,e,null,ge,Z,{})}}export{ke as component,we as universal};
