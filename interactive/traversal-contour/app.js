/* 绕轮廓遍历动画 · 交互逻辑（v2：行走沿二叉树边高亮，节点圆边显示前/中/后三次触碰）
 * 几何：
 *   · 树边 = 二叉树结构边（A-B / A-C / B-D / B-E / C-F），始终显示；
 *     行走到某条边时该边高亮，颜色随当前「前/中/后」阶段（金 / 青 / 红）。
 *   · 每个节点画成圆，圆周按钟面三等分（各 120°，互不重叠）：
 *       前序(金)=左段 12→8 点   中序(青)=底段 8→4 点   后序(红)=右段 4→12 点
 *     精确落在圆周上，即「节点圆的边缘在变色发光」。
 *   · walker 停在「当前节点圆边、朝向即将前往的邻居」处，沿二叉树边在节点间滑动；
 *     与讲义 §2.2 的 16 行表逐字对应。
 */
(function () {
  'use strict';
  const SVGNS = 'http://www.w3.org/2000/svg';

  // 16 步：严格对应讲义「绕树动作」表。
  //   node = 该步主体，pass = 前/中/后，to = 下一步前往的邻居（walker 朝向它、边高亮它所在边）
  //   edges = 该步高亮的树边；lights = 该步要点亮的灯（默认由 node+pass 推导，第 16 步同点 F/C/A 后序灯）
  const STEPS = [
    { node: 'A', pass: 'pre',  to: 'B', edges: ['A-B'],                 act: '从 A 出发往左下' },
    { node: 'B', pass: 'pre',  to: 'D', edges: ['B-D'],                 act: '到 B，往左下' },
    { node: 'D', pass: 'pre',  to: 'B', edges: ['B-D'],                 act: '到 D，左下没有孩子' },
    { node: 'D', pass: 'in',   to: 'B', edges: ['B-D'],                 act: '绕过 D 的下方' },
    { node: 'D', pass: 'post', to: 'B', edges: ['B-D'],                 act: '从 D 右侧离开 D，回到 B' },
    { node: 'B', pass: 'in',   to: 'E', edges: ['B-E'],                 act: '绕过 B 的下方' },
    { node: 'E', pass: 'pre',  to: 'B', edges: ['B-E'],                 act: '到 E，左下没有孩子' },
    { node: 'E', pass: 'in',   to: 'B', edges: ['B-E'],                 act: '绕过 E 的下方' },
    { node: 'E', pass: 'post', to: 'B', edges: ['B-E'],                 act: '从 E 右侧离开 E' },
    { node: 'B', pass: 'post', to: 'A', edges: ['A-B'],                 act: '从 B 右侧离开 B，回到 A' },
    { node: 'A', pass: 'in',   to: 'C', edges: ['A-C'],                 act: '绕过 A 的下方' },
    { node: 'C', pass: 'pre',  to: 'F', edges: ['C-F'],                 act: '到 C，左下没有孩子' },
    { node: 'C', pass: 'in',   to: 'F', edges: ['C-F'],                 act: '绕过 C 的下方' },
    { node: 'F', pass: 'pre',  to: 'C', edges: ['C-F'],                 act: '到 F，左下没有孩子' },
    { node: 'F', pass: 'in',   to: 'C', edges: ['C-F'],                 act: '绕过 F 的下方' },
    { node: 'F', pass: 'post', to: 'C', edges: ['C-F', 'A-C'],          act: '离开 F、C、A，回到根，结束',
      lights: [['F', 'post'], ['C', 'post'], ['A', 'post']] },
  ];
  STEPS.forEach((s, i) => {
    if (!s.lights) s.lights = [[s.node, s.pass]];
    s.idx = i;
  });

  const NODES = {
    A: { cx: 340, cy: 80,  r: 32 },
    B: { cx: 200, cy: 200, r: 32 },
    C: { cx: 480, cy: 200, r: 32 },
    D: { cx: 110, cy: 320, r: 28 },
    E: { cx: 270, cy: 320, r: 28 },
    F: { cx: 480, cy: 320, r: 28 },
  };
  const NODE_ORDER = ['A', 'B', 'C', 'D', 'E', 'F'];

  // 节点圆边三段弧（钟面三等分，精确落在圆周上，互不重叠）
  //   前序(金)=左段 12→8 点   中序(青)=底段 8→4 点   后序(红)=右段 4→12 点
  function arcD(node, pass) {
    const { cx, cy, r } = NODES[node];
    const RANGE = { pre: [12, 8], in: [8, 4], post: [4, 12] };
    const [h0, h1] = RANGE[pass];
    const P = (h) => {
      const rad = (h * 30 - 90) * Math.PI / 180; // 钟面小时 → SVG 弧度
      return `${(cx + r * Math.cos(rad)).toFixed(2)},${(cy + r * Math.sin(rad)).toFixed(2)}`;
    };
    return `M${P(h0)} A${r},${r} 0 0 0 ${P(h1)}`;
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) document.documentElement.classList.add('reduce');

  const svg = document.getElementById('tree');
  const walkerG = document.getElementById('walkerG');
  const tbody = document.querySelector('#stepTable tbody');
  const stepNow = document.getElementById('stepNow');

  // 树边元素（按 data-edge 索引）
  const edgeEls = {};
  svg.querySelectorAll('line.edge').forEach((l) => { edgeEls[l.dataset.edge] = l; });

  // 节点圆边三段高亮弧：画在节点之上、walker 之下，即「节点圆的边缘在变色发光」
  const arcEls = {};
  NODE_ORDER.forEach((node) => {
    arcEls[node] = {};
    ['pre', 'in', 'post'].forEach((pass) => {
      const p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', arcD(node, pass));
      p.setAttribute('class', 'edge-arc ' + pass);
      p.dataset.node = node;
      p.dataset.pass = pass;
      svg.insertBefore(p, walkerG);
      arcEls[node][pass] = p;
    });
  });

  // walker 停靠点：停在「当前节点圆边、朝向即将前往的邻居」处（恰落在二叉树上，滑动即沿边）
  function nodeBoundary(node, toNode) {
    if (!toNode) return { x: NODES[node].cx, y: NODES[node].cy - NODES[node].r };
    const a = NODES[node], b = NODES[toNode];
    const dx = b.cx - a.cx, dy = b.cy - a.cy, len = Math.hypot(dx, dy) || 1;
    return { x: a.cx + a.r * dx / len, y: a.cy + a.r * dy / len };
  }

  // 步骤表（单一数据源）
  STEPS.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.dataset.idx = i;
    const dot = (k) => (s.pass === k ? '●' : '');
    tr.innerHTML =
      `<td>${i + 1}</td><td>${s.act}</td>` +
      `<td class="seq">${dot('pre')}</td>` +
      `<td class="seq">${dot('in')}</td>` +
      `<td class="seq">${dot('post')}</td>`;
    tr.addEventListener('click', () => { pause(); goToStep(i + 1); });
    tbody.appendChild(tr);
  });

  const lampOf = (node, pass) =>
    document.querySelector(`.lamp-card[data-node="${node}"] .lamp.${pass}`);
  const cardOf = (node) =>
    document.querySelector(`.lamp-card[data-node="${node}"]`);

  let current = 0;

  function goToStep(k) {
    k = Math.max(0, Math.min(STEPS.length, k));
    current = k;

    // 1) walker：停在「当前节点圆边、朝向 to」；k=0 藏起
    if (k === 0) {
      walkerG.style.opacity = 0;
    } else {
      walkerG.style.opacity = 1;
      const pt = nodeBoundary(STEPS[k - 1].node, STEPS[k - 1].to);
      walkerG.setAttribute('transform', `translate(${pt.x},${pt.y})`);
      walkerG.classList.remove('pre', 'in', 'post');
      walkerG.classList.add(STEPS[k - 1].pass);
    }

    // 2) 树边高亮：仅当前步涉及的边，颜色随当前「前/中/后」阶段
    Object.values(edgeEls).forEach((l) => l.classList.remove('active', 'pre', 'in', 'post'));
    if (k > 0) {
      const pass = STEPS[k - 1].pass;
      STEPS[k - 1].edges.forEach((e) => {
        const l = edgeEls[e];
        if (l) l.classList.add('active', pass);
      });
    }

    // 3) 灯 + 节点卡：先全清，再按 1..k 累加点亮
    document.querySelectorAll('.lamp.on').forEach((l) => l.classList.remove('on'));
    document.querySelectorAll('.lamp-card.cur').forEach((c) => c.classList.remove('cur'));
    for (let s = 1; s <= k; s++) {
      STEPS[s - 1].lights.forEach(([node, pass]) => {
        const lamp = lampOf(node, pass);
        if (lamp) lamp.classList.add('on');
        const card = cardOf(node);
        if (card) card.classList.add('cur');
      });
    }

    // 3.5) 节点圆边弧：1..k 累加点亮；当前步的弧额外加 .cur 发光
    const litSet = new Set();
    for (let s = 1; s <= k; s++) STEPS[s - 1].lights.forEach(([n, p]) => litSet.add(n + ':' + p));
    const curLights = k > 0 ? STEPS[k - 1].lights : [];
    NODE_ORDER.forEach((node) => {
      ['pre', 'in', 'post'].forEach((pass) => {
        const p = arcEls[node][pass];
        p.classList.toggle('on', litSet.has(node + ':' + pass));
        p.classList.toggle('cur', curLights.some(([n, pp]) => n === node && pp === pass));
      });
    });

    // 4) 表格：当前行高亮 + 当前列（前/中/后）着色
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((tr, idx) => {
      tr.classList.toggle('is-active', idx === k - 1);
      const cellOf = { pre: 2, in: 3, post: 4 };
      ['pre', 'in', 'post'].forEach((pp) => {
        const cell = tr.children[cellOf[pp]];
        cell.classList.remove('on-pre', 'on-in', 'on-post');
        if (idx === k - 1 && STEPS[idx].pass === pp) cell.classList.add('on-' + pp);
      });
    });

    stepNow.textContent = k;
  }

  // ---- 播放控制 ----
  let timer = null;
  const speedSel = document.getElementById('speedSel');
  const intervalMs = () => parseInt(speedSel.value, 10) || 750;

  function play() {
    if (timer) return;
    if (current >= STEPS.length) goToStep(0);
    timer = setInterval(() => {
      if (current >= STEPS.length) { pause(); return; }
      goToStep(current + 1);
    }, intervalMs());
    document.getElementById('playBtn').textContent = '▶ 播放中…';
  }
  function pause() {
    if (timer) { clearInterval(timer); timer = null; }
    document.getElementById('playBtn').textContent = '▶ 播放';
  }
  function reset() { pause(); goToStep(0); }

  document.getElementById('playBtn').addEventListener('click', play);
  document.getElementById('pauseBtn').addEventListener('click', pause);
  document.getElementById('resetBtn').addEventListener('click', reset);
  speedSel.addEventListener('change', () => { if (timer) { pause(); play(); } });

  // ---- 节点反查：点节点 → 高亮它的三次所在行 ----
  let lastPeer = null;
  function togglePeer(node) {
    const rows = tbody.querySelectorAll('tr');
    const cards = document.querySelectorAll('.lamp-card');
    const nodes = svg.querySelectorAll('.node');
    const clearPeer = () => {
      rows.forEach((r) => r.classList.remove('peer'));
      cards.forEach((c) => c.classList.remove('peer'));
      nodes.forEach((n) => n.classList.remove('peer'));
    };
    if (lastPeer === node) { lastPeer = null; clearPeer(); return; }
    clearPeer();
    lastPeer = node;
    rows.forEach((tr, idx) => {
      const s = STEPS[idx];
      const hit = s.node === node || (s.lights && s.lights.some((l) => l[0] === node));
      if (hit) tr.classList.add('peer');
    });
    cardOf(node)?.classList.add('peer');
    nodes.forEach((n) => { if (n.dataset.node === node) n.classList.add('peer'); });
  }
  svg.querySelectorAll('.node').forEach((g) =>
    g.addEventListener('click', () => togglePeer(g.dataset.node)));
  document.querySelectorAll('.lamp-card').forEach((c) =>
    c.addEventListener('click', () => togglePeer(c.dataset.node)));

  // ---- 主题切换（与讲义一致，localStorage 记忆） ----
  const root = document.documentElement;
  const saved = (function () { try { return localStorage.getItem('traversal-theme'); } catch { return null; } })();
  if (saved) root.setAttribute('data-theme', saved);
  document.getElementById('themeBtn').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('traversal-theme', next); } catch {}
  });

  // 初始：第 0 步（全空，等待播放 / 点击）
  goToStep(0);
})();
