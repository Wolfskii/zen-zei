import{S as H,i as R,s as S,k as c,l as d,m as h,h as n,b as m,n as E,D as G,z as k,a as I,A as x,c as O,p as y,E as L,B as z,F as b,G as M,H as N,I as T,g as C,d as F,C as B}from"../chunks/index.67a2fb7e.js";import"../chunks/paths.8edf8508.js";function U(i){let e;return{c(){e=c("header")},l(s){e=d(s,"HEADER",{});var a=h(e);a.forEach(n)},m(s,a){m(s,e,a)},p:E,i:E,o:E,d(s){s&&n(e)}}}class j extends H{constructor(e){super(),R(this,e,null,U,S,{})}}function J(i){let e;return{c(){e=c("footer")},l(s){e=d(s,"FOOTER",{});var a=h(e);a.forEach(n)},m(s,a){m(s,e,a)},p:E,i:E,o:E,d(s){s&&n(e)}}}class K extends H{constructor(e){super(),R(this,e,null,J,S,{})}}function P(i){let e,s,a,u,_,f,g,p,D,l,$,V,v;s=new j({});const A=i[1].default,o=G(A,i,i[0],null);return f=new K({}),{c(){e=c("div"),k(s.$$.fragment),a=I(),u=c("main"),o&&o.c(),_=I(),k(f.$$.fragment),g=I(),p=c("div"),D=I(),l=c("video"),$=c("source"),this.h()},l(t){e=d(t,"DIV",{id:!0});var r=h(e);x(s.$$.fragment,r),a=O(r),u=d(r,"MAIN",{});var q=h(u);o&&o.l(q),q.forEach(n),_=O(r),x(f.$$.fragment,r),r.forEach(n),g=O(t),p=d(t,"DIV",{id:!0}),h(p).forEach(n),D=O(t),l=d(t,"VIDEO",{id:!0});var w=h(l);$=d(w,"SOURCE",{src:!0,type:!0}),w.forEach(n),this.h()},h(){y(e,"id","app"),y(p,"id","overlay"),L($.src,V="videos/rain.mp4")||y($,"src",V),y($,"type","video/mp4"),l.autoplay=!0,l.muted=!0,l.loop=!0,y(l,"id","bg-video")},m(t,r){m(t,e,r),z(s,e,null),b(e,a),b(e,u),o&&o.m(u,null),b(e,_),z(f,e,null),m(t,g,r),m(t,p,r),m(t,D,r),m(t,l,r),b(l,$),v=!0},p(t,[r]){o&&o.p&&(!v||r&1)&&M(o,A,t,t[0],v?T(A,t[0],r,null):N(t[0]),null)},i(t){v||(C(s.$$.fragment,t),C(o,t),C(f.$$.fragment,t),v=!0)},o(t){F(s.$$.fragment,t),F(o,t),F(f.$$.fragment,t),v=!1},d(t){t&&n(e),B(s),o&&o.d(t),B(f),t&&n(g),t&&n(p),t&&n(D),t&&n(l)}}}function Q(i,e,s){let{$$slots:a={},$$scope:u}=e;return i.$$set=_=>{"$$scope"in _&&s(0,u=_.$$scope)},[u,a]}class Y extends H{constructor(e){super(),R(this,e,Q,P,S,{})}}export{Y as default};