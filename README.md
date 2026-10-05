<!-- Source of truth for the profile README. scripts/render.mjs turns this into README.md and draws everything in assets/. Edit here and in profile.json, not in README.md. -->

<img src="./assets/hero.svg" width="100%" alt="Duc Dang: I build runtimes for the web. A React-compatible UI library, and Node.js that runs inside a browser tab.">

<p align="center">
  <a href="#l0--surface"><img src="./assets/nav-l0.svg" width="160" alt="L0 Surface"></a>
  <a href="#l1--now"><img src="./assets/nav-l1.svg" width="160" alt="L1 Now"></a>
  <a href="#l2--ui-runtime"><img src="./assets/nav-l2.svg" width="160" alt="L2 UI runtime"></a>
  <a href="#l3--sandbox"><img src="./assets/nav-l3.svg" width="160" alt="L3 Sandbox"></a>
</p>

<p align="center">
  <a href="https://wcvmjs.com">wcvm</a> ·
  <a href="https://rectify-teams.github.io/rectify">Rectify</a> ·
  <a href="https://www.linkedin.com/in/duyduc-dev/">LinkedIn</a> ·
  <a href="https://calendly.com/dangduyducdangduyduc/30-minute-meeting">Book a chat</a> ·
  <a href="mailto:ducdangduy1908@gmail.com">Email</a>
</p>

## L0 · Surface

I like going one layer below the framework. Rectify reimplements the UI runtime (fiber reconciler, hooks, Suspense, router) in about 10 KB, and wcvm boots a real Node.js sandbox, with `npm install` and dev servers, entirely in the browser with no backend.

<img src="./assets/numbers.svg" width="100%" alt="By the numbers: npm installs a month, GitHub stars, followers and public repositories.">

<sub>As of 2026-10-05, from the public GitHub and npm APIs. <a href="#l1--now">↓ One layer down: L1 · Now</a></sub>

## L1 · Now

Hardening wcvm's Node compatibility (Vite, Next.js, SvelteKit, NestJS and more) and growing the Rectify ecosystem: router, Vite plugin and project scaffolding.

<details>
<summary>The toolbox I reach for</summary>

<br>

| Area | Tools |
| --- | --- |
| Frontend | React, Next.js, Tailwind, Material UI |
| Backend | Node, NestJS, Spring Boot, Laravel |
| Data | PostgreSQL, MongoDB, Redis |
| DevOps | Docker, Nginx, GitHub Actions |

</details>

<sub><a href="#l2--ui-runtime">↓ One layer down: L2 · UI runtime</a></sub>

## L2 · UI runtime

If you know React, you already know Rectify: the component model, hooks and JSX transform are intentionally compatible, with zero React dependencies. [Docs](https://rectify-teams.github.io/rectify).

<p align="center">
  <a href="https://github.com/Rectify-Teams/rectify"><img src="./assets/card-rectify.svg" width="410" alt="rectify: a React-compatible UI library from scratch."></a>
  <a href="https://github.com/Rectify-Teams/rectify/tree/main/packages/create-rectify-app"><img src="./assets/card-create-rectify-app.svg" width="410" alt="create-rectify-app: one command scaffolds a Rectify app."></a>
</p>

<details>
<summary>The rest of the family</summary>

<br>

| Package | What it does |
| --- | --- |
| `@rectify-dev/core` | Runtime, JSX transform, hooks, class components, memo, lazy, Suspense, context. |
| `@rectify-dev/router` | Client-side router: BrowserRouter, HashRouter, nested routes and a full hook set. |
| `@rectify-dev/vite-plugin` | Vite plugin that wires up the JSX transform automatically. |
| `@rectify-dev/babel-transform-rectify-jsx` | Babel plugin for non-Vite environments. |

</details>

<sub><a href="#l3--sandbox">↓ One layer down: L3 · Sandbox</a></sub>

## L3 · Sandbox

Below the framework there is a runtime, and below the runtime there are syscalls and workers. Boot the first one at [wcvmjs.com](https://wcvmjs.com).

<a href="https://github.com/duyduc-dev/wcvm"><img src="./assets/wcvm.svg" width="100%" alt="wcvm: Node.js in your browser tab, with no backend."></a>

<p align="center">
  <a href="https://github.com/duyduc-dev/webcontainer"><img src="./assets/card-duckwc.svg" width="410" alt="duckwc: an earlier WebContainer-style sandbox."></a>
</p>

## Say hello

Working on browser runtimes, UI frameworks, or something that has to run without a server? [Email me](mailto:ducdangduy1908@gmail.com) or find me on [LinkedIn](https://www.linkedin.com/in/duyduc-dev/).

<details>
<summary><code>$ sudo hire me</code></summary>

<br>

<img src="./assets/terminal.svg" width="100%" alt="A replay of a terminal: whoami, layers, and sudo hire me, which opens an email to ducdangduy1908@gmail.com.">

</details>

<details>
<summary>Watch a snake eat my contribution graph</summary>

<br>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/duyduc-dev/duyduc-dev/output/snake-dark.svg">
    <img src="https://raw.githubusercontent.com/duyduc-dev/duyduc-dev/output/snake.svg" alt="">
  </picture>
</div>

</details>

<details>
<summary>How this page is made</summary>

<br>

Every image here is an SVG drawn by [`scripts/render.mjs`](scripts/render.mjs): no GIFs, no JavaScript, no image service. Motion is CSS keyframes, and with reduced motion turned on everything rests on its final frame.

The numbers come from the public GitHub and npm APIs. A scheduled workflow re-renders the images and this README from `README.tmpl.md` and `profile.json`, and commits the result.

</details>

<p align="center">
  <sub><a href="#l0--surface">↑ Back to the surface</a></sub>
</p>
