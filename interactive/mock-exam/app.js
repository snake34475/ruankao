/* ============ 摸底考试还原 · 交互逻辑 ============ */
(function () {
  'use strict';
  var D = window.MOCK_EXAM;
  var LS_ANSWERS = 'mock-exam-answers-v1';
  var LS_THEME = 'mock-exam-theme-v1';
  var LS_MODE = 'mock-exam-mode-v1';

  /* ---------- 状态 ---------- */
  var mode = localStorage.getItem(LS_MODE) === 'quiz' ? 'quiz' : 'review';
  var filter = 'all'; // all | bad | none | ok
  var answers = loadAnswers();

  function loadAnswers() {
    // 初值 = 截图还原的作答；本地若保存过重做记录则覆盖
    var base = {};
    D.groups.forEach(function (g) {
      g.items.forEach(function (it) { base[it.no] = it.user || null; });
    });
    try {
      var saved = JSON.parse(localStorage.getItem(LS_ANSWERS) || 'null');
      if (saved && typeof saved === 'object') {
        Object.keys(saved).forEach(function (k) { base[k] = saved[k]; });
      }
    } catch (e) { /* 损坏则用还原值 */ }
    return base;
  }
  function saveAnswers() {
    var delta = {};
    D.groups.forEach(function (g) {
      g.items.forEach(function (it) {
        if (answers[it.no] !== (it.user || null)) delta[it.no] = answers[it.no];
      });
    });
    localStorage.setItem(LS_ANSWERS, JSON.stringify(delta));
  }

  /* ---------- 工具 ---------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function fmtExp(s) { return esc(s).replace(/\n/g, '<br>'); }

  // 判定：返回 'ok' | 'bad' | 'none'
  function judge(it) {
    var a = answers[it.no];
    if (!a) return 'none';
    return a === it.key ? 'ok' : 'bad';
  }
  function allItems() {
    var out = [];
    D.groups.forEach(function (g) { g.items.forEach(function (it) { it._group = g; out.push(it); }); });
    return out;
  }

  function cardJudge(g) {
    var js = g.items.map(judge);
    if (js.indexOf('bad') >= 0) return 'bad';
    if (js.indexOf('none') >= 0) return 'none';
    return 'ok';
  }

  /* ---------- 总览 ---------- */
  function renderTiles() {
    var items = allItems();
    var ok = 0, bad = 0, none = 0;
    items.forEach(function (it) {
      var j = judge(it);
      if (j === 'ok') ok++; else if (j === 'bad') bad++; else none++;
    });
    var answered = ok + bad;
    var tiles = el('div', 'tiles');
    function tile(cls, n, l) {
      var t = el('div', 'tile ' + cls);
      t.appendChild(el('div', 'n', String(n)));
      t.appendChild(el('div', 'l', l));
      return t;
    }
    tiles.appendChild(tile('t-total', ok + bad + ' / ' + items.length, '已作答 / 共 ' + items.length + ' 题'));
    tiles.appendChild(tile('t-ok', ok, '参考对'));
    tiles.appendChild(tile('t-danger', bad, '参考错'));
    tiles.appendChild(tile('t-warn', none, '未作答'));
    tiles.appendChild(tile('t-total', ok + ' / ' + D.meta.totalScore, '预估分（75 分制，及格 ' + D.meta.passScore + '）'));
    var host = document.getElementById('tiles');
    host.innerHTML = '';
    host.appendChild(tiles);

    var w = document.getElementById('warnbox');
    var html = '<b>还原说明与提醒</b><ol>';
    D.meta.notes.forEach(function (n) { html += '<li>' + esc(n) + '</li>'; });
    html += '</ol>';
    if (ok < D.meta.passScore) {
      html += '<p style="margin:.5em 0 0"><b>摸底结论：按参考答案估 ' + ok + ' 分，距 45 分及格线差 ' +
        (D.meta.passScore - ok) + ' 分。这正是摸底的意义——用下面的考点分布找弱项，配合错题本回炉。</b></p>';
    }
    w.innerHTML = html;
  }

  /* ---------- 考点分布 ---------- */
  function renderGraph() {
    var byTopic = {};
    allItems().forEach(function (it) {
      var t = byTopic[it.topic] || (byTopic[it.topic] = { ok: 0, bad: 0, none: 0 });
      t[judge(it)]++;
    });
    var keys = Object.keys(byTopic).sort(function (a, b) {
      var ta = byTopic[a], tb = byTopic[b];
      return (tb.ok + tb.bad) - (ta.ok + ta.bad) || (tb.ok + tb.bad + tb.none) - (ta.ok + ta.bad + ta.none);
    });
    var max = 1;
    keys.forEach(function (k) { max = Math.max(max, byTopic[k].ok + byTopic[k].bad + byTopic[k].none); });
    var host = document.getElementById('graph');
    host.innerHTML = '';
    keys.forEach(function (k) {
      var t = byTopic[k];
      var row = el('div', 'grow');
      row.appendChild(el('div', 'name', D.topicLabels[k] || k));
      var track = el('div', 'track');
      var total = t.ok + t.bad + t.none;
      var pct = function (v) { return (v / max * 100).toFixed(2) + '%'; };
      var segs = [
        { cls: 'ok', v: t.ok }, { cls: 'bad', v: t.bad }, { cls: 'none', v: t.none }
      ];
      var left = 0;
      segs.forEach(function (s) {
        if (!s.v) return;
        var seg = el('span', 'seg ' + s.cls);
        seg.style.left = (left / max * 100) + '%';
        seg.style.width = pct(s.v);
        left += s.v;
        track.appendChild(seg);
      });
      row.appendChild(track);
      row.appendChild(el('div', 'nums',
        '对 <b>' + t.ok + '</b> / 错 ' + t.bad + ' / 未答 ' + t.none + '（共 ' + total + '）'));
      host.appendChild(row);
    });
  }

  /* ---------- 筛选 ---------- */
  var FILTERS = [
    { id: 'all', label: '全部' },
    { id: 'bad', label: '参考错' },
    { id: 'none', label: '未作答' },
    { id: 'ok', label: '参考对' }
  ];
  function renderFilters() {
    var host = document.getElementById('filters');
    host.innerHTML = '';
    FILTERS.forEach(function (f) {
      var b = el('button', 'chip' + (filter === f.id ? ' on' : ''), f.label);
      b.type = 'button';
      b.addEventListener('click', function () { filter = f.id; renderFilters(); applyFilter(); });
      host.appendChild(b);
    });
  }
  function applyFilter() {
    document.querySelectorAll('.card[data-judge]').forEach(function (c) {
      var show = filter === 'all' || c.dataset.judge === filter;
      c.classList.toggle('is-hidden', !show);
    });
    var any = !!document.querySelector('.card:not(.is-hidden)');
    var e = document.querySelector('.cards .empty');
    if (!any && !e) document.querySelector('.cards').appendChild(el('div', 'empty', '当前筛选下没有题目。'));
    else if (any && e) e.remove();
  }

  /* ---------- 题卡 ---------- */
  function renderCards() {
    var host = document.getElementById('cards');
    host.innerHTML = '';
    var quiz = mode === 'quiz';
    D.groups.forEach(function (g) {
      var card = el('article', 'card' + (quiz ? ' quiz' : ''));
      var head = el('div', 'card-h');
      g.items.forEach(function (it) {
        var j = judge(it);
        head.appendChild(el('span', 'qno ' + j, String(it.no)));
      });
      head.appendChild(el('span', 'qtopic', D.topicLabels[g.items[0].topic] || ''));
      card.appendChild(head);
      var body = el('div', 'card-b');
      if (g.stem) body.appendChild(el('p', 'stem', esc(g.stem)));
      if (g.items.length === 1 && g.items[0].stem) body.appendChild(el('p', 'stem', esc(g.items[0].stem)));
      var extra = (g.items.length === 1 && g.items[0].stemExtra) || g.stemExtra;
      if (extra) body.appendChild(el('pre', 'stem-extra', esc(extra)));
      if (g.figs) {
        var figs = el('div', 'figs');
        g.figs.forEach(function (src) {
          var img = el('img');
          img.src = src;
          img.alt = '题目图示（自截图裁切还原）';
          img.loading = 'lazy';
          figs.appendChild(img);
        });
        body.appendChild(figs);
      }

      g.items.forEach(function (it) {
        if (g.items.length > 1) {
          body.appendChild(el('p', 'stem', '<b style="font-family:var(--font-mono)">（' + it.no + '）</b>' +
            (it.stem ? esc(it.stem) : '')));
        }
        var opts = el('div', 'opts');
        Object.keys(it.opts).forEach(function (k) {
          var o = el('div', 'opt');
          var mine = answers[it.no] === k;
          var isKey = it.key === k;
          var marks = [];
          if (quiz) {
            if (mine) marks.push('<span class="mark">已选</span>');
          } else {
            if (mine && isKey) { o.classList.add('key'); marks.push('<span class="mark">你的作答 ✓ 参考对</span>'); }
            else if (mine) { o.classList.add('wrongpick'); marks.push('<span class="mark">你的作答 ✗</span>'); }
            else if (isKey) { o.classList.add('key'); marks.push('<span class="mark">参考答案</span>'); }
          }
          o.innerHTML = '<span class="tag">' + k + '.</span><span>' + esc(it.opts[k]) + '</span>' + marks.join('');
          if (quiz) {
            o.addEventListener('click', function () {
              answers[it.no] = (answers[it.no] === k) ? null : k;
              saveAnswers();
              renderAll();
            });
          }
          opts.appendChild(o);
        });
        body.appendChild(opts);

        if (!quiz) {
          var j = judge(it);
          var head1 = j === 'ok' ? '你的作答正确'
            : j === 'bad' ? '你选了 ' + answers[it.no] + '，参考答案是 ' + it.key
            : '未作答，参考答案是 ' + it.key;
          body.appendChild(el('div', 'exp', '<b>' + esc(head1) + '</b><br>' + fmtExp(it.exp || '')));
        }
      });
      card.appendChild(body);
      // 多空卡的筛选状态：含错算错、含未答算未答
      card.dataset.judge = cardJudge(g);
      host.appendChild(card);
    });
  }

  /* ---------- 下午案例卷 ---------- */
  function renderCases() {
    var host = document.getElementById('cases');
    host.innerHTML = '';
    var quiz = mode === 'quiz';
    D.cases.forEach(function (c) {
      var card = el('article', 'card case');
      var head = el('div', 'card-h');
      head.appendChild(el('span', 'qno case-no', c.no));
      head.appendChild(el('span', 'qtopic', c.topic || ''));
      head.appendChild(el('span', 'qstate', '共 ' + c.score + ' 分'));
      card.appendChild(head);

      var body = el('div', 'card-b');
      body.appendChild(el('p', 'stem', esc(c.stem)));
      if (c.code) body.appendChild(el('pre', 'stem-extra code', esc(c.code)));
      if (c.figs && c.figs.length) {
        var figs = el('div', 'figs');
        c.figs.forEach(function (f) {
          var fig = el('figure', 'casefig');
          var img = el('img');
          img.src = f.src; img.alt = f.cap || '案例图示'; img.loading = 'lazy';
          fig.appendChild(img);
          if (f.cap) fig.appendChild(el('figcaption', 'figcap', esc(f.cap)));
          figs.appendChild(fig);
        });
        body.appendChild(figs);
      }

      c.questions.forEach(function (q) {
        var qb = el('div', 'qblock');
        qb.appendChild(el('p', 'stem', '<b style="font-family:var(--font-mono)">【' +
          esc(q.no) + '】</b>（' + q.score + ' 分）' + esc(q.text)));
        if (!quiz) {
          qb.appendChild(el('div', 'exp', '<b>参考答案</b><br>' + fmtExp(q.answer)));
        } else {
          qb.appendChild(el('div', 'ansline', '你的作答：＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿（写在纸上，切回复盘模式对照）'));
        }
        body.appendChild(qb);
      });
      card.appendChild(body);
      host.appendChild(card);
    });
  }

  /* ---------- 模式 / 主题 ---------- */
  function applyModeBtn() {
    var b = document.getElementById('modeBtn');
    b.textContent = mode === 'quiz' ? '切到复盘模式（看答案）' : '切到作答模式（重做）';
    b.classList.toggle('primary', mode === 'quiz');
    document.title = (mode === 'quiz' ? '（作答中）' : '') + '摸底考试还原 · 上午卷 · 软考软件设计师';
  }
  function renderAll() {
    renderTiles();
    renderGraph();
    renderFilters();
    renderCards();
    renderCases();
    applyFilter();
    applyModeBtn();
  }

  document.getElementById('modeBtn').addEventListener('click', function () {
    mode = mode === 'quiz' ? 'review' : 'quiz';
    localStorage.setItem(LS_MODE, mode);
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 主题 ---------- */
  function applyTheme(t) { document.documentElement.dataset.theme = t; }
  var qTheme = new URLSearchParams(location.search).get('theme');
  var savedTheme = (qTheme === 'light' || qTheme === 'dark') ? qTheme : localStorage.getItem(LS_THEME);
  if (savedTheme !== 'light' && savedTheme !== 'dark') {
    savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  applyTheme(savedTheme);
  document.getElementById('themeBtn').addEventListener('click', function () {
    savedTheme = savedTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(LS_THEME, savedTheme);
    applyTheme(savedTheme);
  });

  renderAll();
  // 调试用：?view=cases 只显示下午案例区
  if (new URLSearchParams(location.search).get('view') === 'cases') {
    document.querySelectorAll('.page-head, .sec').forEach(function (s) {
      if (s.id !== 'cases-sec') s.style.display = 'none';
    });
    document.querySelector('.foot').style.display = 'none';
  }
})();
