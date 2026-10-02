// Draws every SVG in assets/ and turns README.tmpl.md into README.md.
// Usage: node scripts/render.mjs   (Node 18+, no dependencies)
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const p = JSON.parse(readFileSync(new URL('profile.json', root)));
mkdirSync(new URL('assets/', root), { recursive: true });
for (const f of readdirSync(new URL('assets/', root))) if (f.endsWith('.svg')) rmSync(new URL(`assets/${f}`, root));
const out = (f, s) => writeFileSync(new URL(`assets/${f}`, root), s);

// ---------- palette & helpers ----------
const C = { bg: '#0b0d12', line: '#262b36', fg: '#eef1f6', sub: '#a9b1c0', mute: '#7c8596', panel: '#131720', stroke: '#394050' };
const LAYER = Object.fromEntries(p.layers.map((l) => [l.id, l]));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const r2 = (n) => Math.round(n * 100) / 100;
const wrap = (text, max) => {
  const lines = []; let cur = '';
  for (const w of text.split(' ')) { if ((cur + ' ' + w).trim().length > max) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  return cur ? [...lines, cur] : lines;
};
const fmt = (n) => (n == null ? '—' : n >= 1e6 ? `${r2(n / 1e6)}M` : n >= 1e3 ? `${r2(n / 1e3)}k` : String(n));
const kf = (pts) => pts.map(([pct, v]) => `${r2(pct)}%{${v}}`).join('');

const FONT = `.s{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}.m{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}.fb{transform-box:fill-box;transform-origin:center}.fl{transform-box:fill-box;transform-origin:0 50%}@media (prefers-reduced-motion:reduce){*{animation:none!important}.motion{display:none}}`;
const mk = () => { const css = []; let n = 0; return { css, add(k, rule) { const id = 'a' + ++n; css.push(`@keyframes ${id}{${k}}.${id}{animation:${id} ${rule}}`); return id; } }; };
const frame = (w, h, { A, accent, glow, title, desc, body, rx = 14, defs = '' }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<style>${FONT}${A.css.join('')}</style>
<defs><radialGradient id="glow" cx="${glow[0]}" cy="${glow[1]}" r="${glow[2]}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${accent}" stop-opacity=".16"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>${defs}</defs>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="${C.bg}" stroke="${C.line}"/>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${rx}" fill="url(#glow)"/>
${body}
</svg>`;
const tag = (id, x, y, col) => `<rect x="${x}" y="${y}" width="30" height="20" rx="6" fill="${col}" fill-opacity=".12" stroke="${col}" stroke-opacity=".55"/><text class="m" x="${x + 15}" y="${y + 14}" text-anchor="middle" font-size="11" font-weight="600" fill="${col}">${id}</text>`;

// ---------- live numbers (fall back to "—" offline) ----------
const gh = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
const getJson = async (u, headers = {}) => { try { const r = await fetch(u, { headers }); return r.ok ? await r.json() : null; } catch { return null; } };
const stats = {};
for (const c of p.cards) {
  const repo = await getJson(`https://api.github.com/repos/${c.repo}`, gh);
  const dl = await Promise.all((c.npm ?? []).map((n) => getJson(`https://api.npmjs.org/downloads/point/last-month/${n}`)));
  stats[c.id] = { stars: repo?.stargazers_count ?? null, installs: dl.some(Boolean) ? dl.reduce((s, d) => s + (d?.downloads ?? 0), 0) : null };
}
const user = await getJson(`https://api.github.com/users/${p.handle}`, gh);
const sum = (k) => { const v = Object.values(stats).map((s) => s[k]).filter((x) => x != null); return v.length ? v.reduce((a, b) => a + b, 0) : null; };
// rectify's two cards share one repo: count its stars once
const stars = (() => { const seen = new Set(); let t = 0, any = false; for (const c of p.cards) { if (seen.has(c.repo)) continue; seen.add(c.repo); const s = stats[c.id].stars; if (s != null) { t += s; any = true; } } return any ? t : null; })();

// ---------- nav pills ----------
p.layers.forEach((l, i) => {
  const A = mk();
  const pulse = A.add('0%{transform:scale(1);opacity:.7}70%,100%{transform:scale(2.8);opacity:0}', '2.4s ease-out .6s infinite');
  const bob = A.add('0%,100%{transform:none}50%{transform:translateY(3px)}', '1.6s ease-in-out .6s infinite');
  out(`nav-l${i}.svg`, frame(160, 48, { A, accent: l.color, glow: [26, 24, 90], rx: 12, title: `${l.id} ${l.name}`, desc: `Jump to ${l.id}, ${l.name}.`, body:
    `<circle class="fb ${pulse}" cx="24" cy="24" r="5" fill="none" stroke="${l.color}" stroke-width="1.5" style="opacity:0"/><circle cx="24" cy="24" r="4.5" fill="${l.color}"/>` +
    `<text class="m" x="40" y="28.5" font-size="12" font-weight="600" fill="${l.color}">${l.id}</text><text class="s" x="64" y="29" font-size="14" font-weight="500" fill="${C.fg}">${esc(l.name)}</text>` +
    `<g class="${bob}"><text class="m" x="146" y="29" text-anchor="middle" font-size="13" fill="${C.mute}">↓</text></g>` }));
});

// ---------- hero ----------
{
  const A = mk(), W = 840, H = 380, n = p.name.length, nameW = Math.round(n * 27);
  const type = A.add(`from{width:0}to{width:${nameW}px}`, `.7s steps(${n},end) .3s both`);
  const blink = A.add('0%,50%{opacity:1}51%,100%{opacity:0}', '1.06s steps(1) 1s infinite');
  const up = (d) => A.add('from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}', `.7s cubic-bezier(.22,1,.36,1) ${d}s both`);
  const slide = (d) => A.add('from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}', `.7s cubic-bezier(.22,1,.36,1) ${d}s both`);
  const per = 8, step = 76, y0 = 48;
  const probe = A.add(kf([[0, 'transform:none'], [22, 'transform:none'], [25, `transform:translateY(${step}px)`], [47, `transform:translateY(${step}px)`], [50, `transform:translateY(${step * 2}px)`], [72, `transform:translateY(${step * 2}px)`], [75, `transform:translateY(${step * 3}px)`], [97, `transform:translateY(${step * 3}px)`], [100, 'transform:none']]), `${per}s ease-in-out 1.6s infinite`);
  let layers = '';
  p.layers.forEach((l, i) => {
    const s = i * 25, e = s + 25, y = y0 + i * step;
    const hi = A.add(kf(i === 0 ? [[0, 'opacity:.16'], [22, 'opacity:.16'], [25, 'opacity:0'], [100, 'opacity:0']] : [[0, 'opacity:0'], [s, 'opacity:0'], [s + 3, 'opacity:.16'], [Math.min(e - 3, 97), 'opacity:.16'], [Math.min(e, 100), i === 3 ? 'opacity:.16' : 'opacity:0'], [100, i === 3 ? 'opacity:.16' : 'opacity:0']]), `${per}s linear 1.6s infinite`);
    layers += `<g class="${slide(0.5 + i * 0.12)}"><rect x="510" y="${y}" width="290" height="62" rx="12" fill="#0f1219" stroke="${C.line}"/><rect class="${hi}" x="510" y="${y}" width="290" height="62" rx="12" fill="${l.color}" style="opacity:0"/><rect x="510" y="${y + 14}" width="3" height="34" rx="1.5" fill="${l.color}"/>` +
      `<text class="m" x="530" y="${y + 26}" font-size="12" font-weight="600" fill="${l.color}">${l.id}</text><text class="s" x="560" y="${y + 27}" font-size="16" font-weight="600" fill="${C.fg}">${esc(l.name)}</text><text class="m" x="530" y="${y + 47}" font-size="11.5" fill="${C.mute}">${esc(l.blurb)}</text></g>`;
  });
  const lines = wrap(p.subline, 40);
  out('hero.svg', frame(W, H, { A, accent: '#ffb545', glow: [700, 40, 420], rx: 16, title: `${p.name}: ${p.headline}`, desc: `${p.subline} An animated stack of four layers with a probe diving through them.`, defs: `<clipPath id="nc"><rect class="${type}" x="40" y="86" width="${nameW}" height="60"/></clipPath>`, body:
    `<text class="m ${up(0.2)}" x="40" y="70" font-size="13" fill="#ffb545">$ whoami</text>` +
    `<text class="s" x="40" y="132" font-size="46" font-weight="700" fill="${C.fg}" clip-path="url(#nc)">${esc(p.name)}</text><rect class="${blink}" x="${40 + nameW + 6}" y="98" width="3" height="40" fill="#ffb545"/>` +
    `<text class="s ${up(0.9)}" x="40" y="182" font-size="22" font-weight="600" fill="${C.fg}">${esc(p.headline)}</text>` +
    lines.map((l, i) => `<text class="s ${up(1.1 + i * 0.15)}" x="40" y="${212 + i * 24}" font-size="15" fill="${C.sub}">${esc(l)}</text>`).join('') +
    `<text class="m ${up(1.6)}" x="40" y="338" font-size="12" fill="${C.mute}">one layer below the framework ↓</text>` +
    `<line x1="486" y1="${y0 + 31}" x2="486" y2="${y0 + 31 + step * 3}" stroke="${C.stroke}" stroke-dasharray="2 4"/>` + layers +
    `<g class="motion"><g class="${probe}"><circle cx="486" cy="${y0 + 31}" r="5" fill="#ffb545"/></g></g>` }));
}

// ---------- numbers ----------
{
  const A = mk();
  const tiles = [['npm installs / month', sum('installs'), '#a98bff', 'last 30 days, all my packages'], ['github stars', stars, '#ffb545', 'on the repos below'], ['npm packages', new Set(p.cards.flatMap((c) => c.npm ?? [])).size, '#5ab0ff', 'published on the registry'], ['public repos', user?.public_repos ?? null, '#5be49b', 'and a few private ones']];
  const body = tiles.map(([k, v, col, cap], i) => {
    const x = 28 + i * 202, up = A.add('from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}', `.7s cubic-bezier(.22,1,.36,1) ${0.2 + i * 0.12}s both`);
    return `<g class="${up}">${i ? `<line x1="${x - 16}" y1="30" x2="${x - 16}" y2="130" stroke="${C.line}"/>` : ''}<text class="m" x="${x}" y="40" font-size="11" fill="${C.mute}">${k.toUpperCase()}</text><text class="m" x="${x}" y="88" font-size="40" font-weight="700" fill="${col}">${fmt(v)}</text><text class="s" x="${x}" y="116" font-size="12.5" fill="${C.sub}">${cap}</text></g>`;
  }).join('');
  out('numbers.svg', frame(840, 160, { A, accent: '#5ab0ff', glow: [420, 0, 480], title: 'By the numbers', desc: 'npm installs a month, GitHub stars, followers and public repositories.', body }));
}

// ---------- illustrations (drawn in a 130x100 box) ----------
const ill = (kind, col, A) => {
  if (kind === 'tree') {
    const N = { r: [65, 10], a: [30, 46], b: [100, 46], a1: [14, 84], a2: [46, 84], b1: [100, 84] };
    const E = [['r', 'a'], ['r', 'b'], ['a', 'a1'], ['a', 'a2'], ['b', 'b1']];
    const order = { b1: 5, b: 22, r: 39, a: 56, a1: 66, a2: 70 };
    return E.map(([f, t]) => `<line x1="${N[f][0]}" y1="${N[f][1]}" x2="${N[t][0]}" y2="${N[t][1]}" stroke="${C.stroke}"/>`).join('') +
      Object.entries(N).map(([k, [x, y]]) => { const s = order[k], a = A.add(kf([[0, 'opacity:0'], [s, 'opacity:0'], [s + 4, 'opacity:1'], [s + 14, 'opacity:0'], [100, 'opacity:0']]), '5s linear infinite'); return `<circle cx="${x}" cy="${y}" r="7" fill="${C.panel}" stroke="${C.stroke}"/><circle class="${a}" cx="${x}" cy="${y}" r="7" fill="${col}" style="opacity:0"/>`; }).join('');
  }
  if (kind === 'files') {
    return ['package.json', 'vite.config.ts', 'main.tsx', 'App.tsx'].map((f, i) => { const y = 8 + i * 24, s = 8 + i * 18, a = A.add(kf([[0, 'opacity:0'], [s, 'opacity:0'], [s + 4, 'opacity:1'], [92, 'opacity:1'], [97, 'opacity:0'], [100, 'opacity:0']]), '5s linear infinite'); return `<rect x="0" y="${y}" width="130" height="18" rx="5" fill="${C.panel}" stroke="${C.stroke}"/><text class="m" x="10" y="${y + 12.5}" font-size="10" fill="${C.sub}">${f}</text><g class="${a}" style="opacity:0"><circle cx="116" cy="${y + 9}" r="5" fill="${col}" fill-opacity=".2"/><path d="M113.5 ${y + 9} l2 2 l3.5 -4" stroke="${col}" stroke-width="1.5" fill="none"/></g>`; }).join('');
  }
  if (kind === 'stack') {
    return ['fs', 'shell', 'preview'].map((f, i) => { const y = 8 + i * 30, a = A.add('0%,100%{opacity:.25}50%{opacity:1}', `1.2s steps(2) ${i * 0.4}s infinite`); return `<rect x="0" y="${y}" width="130" height="22" rx="6" fill="${C.panel}" stroke="${C.stroke}"/><text class="m" x="12" y="${y + 15}" font-size="10" fill="${C.sub}">${f}</text><circle class="${a}" cx="116" cy="${y + 11}" r="2.5" fill="${col}"/>`; }).join('');
  }
  return '';
};

// ---------- cards ----------
const starIcon = '<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>';
const dlIcon = '<path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14ZM7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/>';
const footer = (s, y, x0 = 20) => {
  let x = x0, o = '';
  if (s.stars) { o += `<g transform="translate(${x} ${y - 10.5}) scale(.75)" fill="#e3b341">${starIcon}</g><text class="m" x="${x + 17}" y="${y}" font-size="12" fill="${C.sub}">${fmt(s.stars)}</text>`; x += 17 + String(fmt(s.stars)).length * 7.4 + 14; }
  if (s.installs) o += `<g transform="translate(${x} ${y - 10.5}) scale(.75)" fill="${C.mute}">${dlIcon}</g><text class="m" x="${x + 17}" y="${y}" font-size="12" fill="${C.sub}">${fmt(s.installs)}/mo</text>`;
  return o;
};
for (const c of p.cards.filter((c) => c.kind !== 'wide')) {
  const A = mk(), l = LAYER[c.layer], col = l.color, lines = wrap(c.desc, 30).slice(0, 5);
  out(`card-${c.id}.svg`, frame(410, 210, { A, accent: col, glow: [340, 60, 230], title: c.id, desc: c.desc, body:
    tag(l.id, 20, 20, col) + `<text class="m" x="60" y="35" font-size="14" font-weight="600" fill="${C.fg}">${esc(c.id)}</text><text class="m" x="390" y="35" text-anchor="end" font-size="13" fill="${C.mute}">↗</text>` +
    lines.map((t, i) => `<text class="s" x="20" y="${72 + i * 20}" font-size="13.5" fill="${C.sub}">${esc(t)}</text>`).join('') +
    `<g transform="translate(268 62)">${ill(c.kind, col, A)}</g>` + footer(stats[c.id], 184) }));
}

// ---------- wcvm wide card: the architecture, animated ----------
{
  const c = p.cards.find((x) => x.kind === 'wide'); if (c) {
    const A = mk(), l = LAYER[c.layer], col = l.color;
    const box = (x, y, w, t) => `<rect x="${x}" y="${y}" width="${w}" height="34" rx="8" fill="${C.panel}" stroke="${C.stroke}"/><text class="m" x="${x + w / 2}" y="${y + 21}" text-anchor="middle" font-size="11" fill="${C.sub}">${t}</text>`;
    const packet = (x1, x2, y, d) => `<g class="motion"><circle class="${A.add(`0%{opacity:0;transform:none}10%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translateX(${x2 - x1}px)}`, `1.8s linear ${d}s infinite`)}" cx="${x1}" cy="${y}" r="2.6" fill="${col}"/></g>`;
    const link = (x1, x2, y) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${C.stroke}"/>`;
    const lines = wrap(c.desc, 40).slice(0, 4);
    out('wcvm.svg', frame(840, 210, { A, accent: col, glow: [640, 40, 420], title: `${c.id}: ${c.desc}`, desc: 'Architecture: host page, kernel worker, process workers, file system worker, and a service worker relaying dev servers to a preview iframe.', body:
      tag(l.id, 20, 20, col) + `<text class="m" x="60" y="35" font-size="14" font-weight="600" fill="${C.fg}">${esc(c.id)}</text><text class="m" x="820" y="35" text-anchor="end" font-size="13" fill="${C.mute}">↗</text>` +
      lines.map((t, i) => `<text class="s" x="20" y="${72 + i * 20}" font-size="13.5" fill="${C.sub}">${esc(t)}</text>`).join('') + footer(stats[c.id], 184) +
      link(430, 460, 77) + link(570, 600, 77) + link(710, 740, 77) +
      box(330, 60, 100, 'host page') + box(460, 60, 110, 'kernel worker') + box(600, 60, 110, 'process workers') + box(740, 60, 80, 'fs worker') +
      `<line x1="655" y1="94" x2="655" y2="126" stroke="${C.stroke}"/>` + link(460, 600, 143) +
      box(600, 126, 110, 'service worker') + box(330, 126, 130, 'preview iframe') +
      packet(430, 460, 77, 0) + packet(570, 600, 77, 0.6) + packet(710, 740, 77, 1.2) + packet(600, 460, 143, 0.9).replace('translateX(','translateX(') +
      `<text class="m" x="330" y="190" font-size="10.5" fill="${C.mute}">every process is a Web Worker · sync fs over SharedArrayBuffer + Atomics</text>` }));
  }
}

// ---------- terminal replay ----------
{
  const A = mk(), cw = 7.8, y0 = 92, lh = 22;
  const script = [
    { cmd: 'whoami', out: [`${p.handle}: builds runtimes for the web`] },
    { cmd: 'layers', out: p.layers.map((l) => `${l.id}  ${l.name.padEnd(11)} ${l.blurb}`) },
    { cmd: 'sudo hire me', out: ['[sudo] password for recruiter: ********', `opening mailto:${p.email} ...`] },
  ];
  let t = 0.8, row = 0; const ev = [];
  for (const s of script) {
    const d = s.cmd.length * 0.09; ev.push({ type: 'cmd', row: row++, s, t0: t, t1: t + d }); t += d + 0.35;
    for (const o of s.out) { ev.push({ type: 'out', row: row++, text: o, t0: t }); t += 0.22; }
    t += 0.9; row += 0.5;
  }
  const P = t + 3.5, pc = (x) => (x / P) * 100, outT = P - 0.8;
  const fade = (a) => A.add(kf([[0, 'opacity:0'], [pc(a), 'opacity:0'], [pc(a + 0.12), 'opacity:1'], [pc(outT), 'opacity:1'], [pc(outT + 0.5), 'opacity:0'], [100, 'opacity:0']]), `${r2(P)}s linear infinite`);
  let body = '', defs = '';
  ev.forEach((e, i) => {
    const y = y0 + e.row * lh;
    if (e.type === 'cmd') {
      const w = r2(e.s.cmd.length * cw), clip = A.add(kf([[0, 'width:0'], [pc(e.t0), 'width:0;animation-timing-function:steps(' + e.s.cmd.length + ',end)'], [pc(e.t1), `width:${w}px`], [pc(outT), `width:${w}px`], [pc(outT + 0.5), 'width:0'], [100, 'width:0']]), `${r2(P)}s linear infinite`);
      defs += `<clipPath id="c${i}"><rect class="${clip}" x="46" y="${y - 15}" width="${w}" height="21"/></clipPath>`;
      body += `<text class="m ${fade(e.t0)}" x="28" y="${y}" font-size="13" fill="#ffb545">$</text><text class="m" x="46" y="${y}" font-size="13" fill="${C.fg}" clip-path="url(#c${i})">${esc(e.s.cmd)}</text>`;
    } else body += `<text class="m ${fade(e.t0)}" x="28" y="${y}" font-size="13" fill="${C.sub}">${esc(e.text)}</text>`;
  });
  const blink = A.add('0%,50%{opacity:1}51%,100%{opacity:0}', '1.06s steps(1) infinite');
  const last = ev.filter((e) => e.type === 'out').pop(), ly = y0 + (last.row + 1) * lh;
  body += `<text class="m ${fade(last.t0 + 0.5)}" x="28" y="${ly}" font-size="13" fill="#ffb545">$</text><rect class="${blink}" x="46" y="${ly - 12}" width="7" height="15" fill="#ffb545"/>`;
  out('terminal.svg', frame(840, 400, { A, accent: '#ffb545', glow: [700, 40, 420], rx: 16, defs, title: `${p.handle} terminal`, desc: `A replay of a terminal: whoami, layers, and sudo hire me, which opens an email to ${p.email}.`, body:
    `<path d="M.5 40V16.5a16 16 0 0 1 16-16h807a16 16 0 0 1 16 16V40z" fill="#10131a"/><line x1=".5" y1="40" x2="839.5" y2="40" stroke="${C.line}"/><circle cx="24" cy="20" r="5" fill="#ff5f57"/><circle cx="44" cy="20" r="5" fill="#febc2e"/><circle cx="64" cy="20" r="5" fill="#28c840"/><text class="m" x="420" y="24" text-anchor="middle" font-size="12" fill="${C.mute}">~/${p.handle} — zsh</text>` + body }));
}

// ---------- README from template ----------
const tmpl = readFileSync(new URL('README.tmpl.md', root), 'utf8');
const stackRows = Object.entries(p.stack).map(([k, v]) => `| ${k} | ${v.join(', ')} |`).join('\n');
writeFileSync(new URL('README.md', root), tmpl.replaceAll('{{asOf}}', new Date().toISOString().slice(0, 10)).replace('{{stack}}', stackRows));
console.log('rendered');
