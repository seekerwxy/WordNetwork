'use strict';

/**
 * ui.js —— 交互主控：词库选择、搜索定位、悬停卡片、点击高亮、拖拽 / 缩放 / 平移。
 */
(function () {
  const canvas = document.getElementById('graphCanvas');
  const ctx = canvas.getContext('2d');
  const tooltip = document.getElementById('tooltip');
  const librarySelect = document.getElementById('librarySelect');
  const searchInput = document.getElementById('searchInput');
  const statInfo = document.getElementById('statInfo');
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  const graph = new WordGraph();
  const view = { offsetX: 0, offsetY: 0, scale: 1 };
  const state = {
    hovered: null,       // 当前悬停的词名
    selected: null,      // 点击选中的词名
    draggingNode: null,  // 正在拖拽的节点
    panning: false,      // 正在平移视口
    lastX: 0, lastY: 0,  // 上一次鼠标位置（相对画布）
    mouseX: 0, mouseY: 0
  };

  let running = false;
  let rafId = null;
  let lastStat = '';

  /* ---------------- 渲染循环 ---------------- */

  function render() {
    const w = canvas.width / devicePixelRatio;
    const h = canvas.height / devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, w, h);
    renderGraph(ctx, graph, view, state);
  }

  function loop() {
    graph.tick();
    render();
    if (state.selected) {
      const n = graph.nodes.get(state.selected);
      if (n) positionTooltip(n);
    }
    if (state.draggingNode || state.panning || graph.alpha > 0.03) {
      rafId = requestAnimationFrame(loop);
    } else {
      running = false;
      rafId = null;
    }
  }

  function wake() {
    if (!running) {
      running = true;
      rafId = requestAnimationFrame(loop);
    }
  }

  /* ---------------- 坐标与命中 ---------------- */

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
  }

  function toWorld(sx, sy) {
    return {
      x: (sx - view.offsetX) / view.scale,
      y: (sy - view.offsetY) / view.scale
    };
  }

  function nodeAt(sx, sy) {
    const p = toWorld(sx, sy);
    let best = null, bestD = Infinity;
    for (const n of graph.nodes.values()) {
      const dx = n.x - p.x, dy = n.y - p.y;
      const d = dx * dx + dy * dy;
      const hitR = (n.r + 4) * (n.r + 4);
      if (d <= hitR && d < bestD) { best = n; bestD = d; }
    }
    return best;
  }

  function fitView() {
    const b = graph.bounds();
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!isFinite(b.maxX) || b.maxX <= b.minX) {
      view.scale = 1;
      view.offsetX = w / 2;
      view.offsetY = h / 2;
      return;
    }
    const pad = 70;
    const bw = Math.max(1, b.maxX - b.minX + pad * 2);
    const bh = Math.max(1, b.maxY - b.minY + pad * 2);
    view.scale = Math.max(0.25, Math.min(w / bw, h / bh, 1.3));
    view.offsetX = w / 2 - (b.minX + b.maxX) / 2 * view.scale;
    view.offsetY = h / 2 - (b.minY + b.maxY) / 2 * view.scale;
  }

  /* ---------------- 词库加载 ---------------- */

  function updateStat(lib) {
    lastStat = lib.name + ' · ' + graph.nodes.size + ' 词 · ' + graph.edges.length + ' 条关系';
    statInfo.textContent = lastStat;
    statInfo.classList.remove('warn');
  }

  function loadLibrary(id) {
    const lib = WORD_LIBRARIES.find(l => l.id === id) || WORD_LIBRARIES[0];
    graph.load(lib);
    graph.seed(canvas.clientWidth || 800, canvas.clientHeight || 600);
    state.hovered = null;
    state.selected = null;
    state.draggingNode = null;
    state.panning = false;
    hideTooltip();
    fitView();
    updateStat(lib);
    render();
    wake();
  }

  function buildLegend() {
    const el = document.getElementById('legend');
    const rels = Object.entries(REL_STYLES)
      .map(([, s]) => `<div class="legend-item"><span class="legend-line" style="background:${s.color}"></span>${s.label}</div>`)
      .join('');
    el.innerHTML = '<div class="legend-title">关系类型</div>' + rels;
  }

  /* ---------------- 悬停卡片 ---------------- */

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function buildTooltipHTML(node) {
    const rels = (graph.adj.get(node.word) || []).map(r => {
      const style = REL_STYLES[r.type] || REL_STYLES.related;
      return `<li><span class="tt-dot" style="background:${style.color}"></span>${escapeHtml(r.word)}<em>${style.label}</em></li>`;
    }).join('');
    // 多义项：每个义项显示 词性 + 释义 + 例句
    const senses = (node.senses || []).map(s => {
      const ex = s.examples.slice(0, 2)
        .map(x => `<div class="tt-example">“${escapeHtml(x)}”</div>`)
        .join('');
      return `<div class="tt-sense"><span class="tt-pos">${escapeHtml(s.pos || '')}</span> ${escapeHtml(s.meaning)}</div>${ex}`;
    }).join('');
    return (
      `<div class="tt-head"><span class="tt-word">${escapeHtml(node.word)}</span>` +
      (node.phonetic ? `<span class="tt-phone">${escapeHtml(node.phonetic)}</span>` : '') + '</div>' +
      senses +
      (rels ? `<div class="tt-rel-title">关系</div><ul class="tt-rels">${rels}</ul>` : '')
    );
  }

  function updateTooltip() {
    const node = state.hovered ? graph.nodes.get(state.hovered)
      : (state.selected ? graph.nodes.get(state.selected) : null);
    if (!node) { hideTooltip(); return; }
    tooltip.innerHTML = buildTooltipHTML(node);
    tooltip.classList.remove('hidden');
    positionTooltip(node);
  }

  function positionTooltip(node) {
    let sx, sy;
    if (state.hovered === node.word) {
      sx = state.mouseX;
      sy = state.mouseY;
    } else {
      sx = node.x * view.scale + view.offsetX;
      sy = node.y * view.scale + view.offsetY;
    }
    const wrap = document.getElementById('canvasWrap');
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    let left = sx + 16;
    let top = sy - th / 2;
    if (left + tw > wrap.clientWidth - 8) left = sx - tw - 16;
    if (left < 8) left = 8;
    if (top + th > wrap.clientHeight - 8) top = wrap.clientHeight - th - 8;
    if (top < 8) top = 8;
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  function hideTooltip() {
    tooltip.classList.add('hidden');
  }

  /* ---------------- 搜索 ---------------- */

  function findWord() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return null;
    if (graph.nodes.has(q)) return q;
    for (const w of graph.nodes.keys()) {
      if (w.startsWith(q)) return w;
    }
    return null;
  }

  function focusNode(word) {
    const n = graph.nodes.get(word);
    if (!n) return;
    state.selected = word;
    state.hovered = null;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    view.offsetX = w / 2 - n.x * view.scale;
    view.offsetY = h / 2 - n.y * view.scale;
    updateTooltip();
    render();
    wake();
  }

  function showSearchHint(msg) {
    statInfo.textContent = msg;
    statInfo.classList.add('warn');
    clearTimeout(showSearchHint._t);
    showSearchHint._t = setTimeout(() => {
      statInfo.textContent = lastStat;
      statInfo.classList.remove('warn');
    }, 1800);
  }

  /* ---------------- 事件绑定 ---------------- */

  function bindEvents() {
    // 侧边抽屉导航：默认收起，点 ☰ 展开，点遮罩或按 Esc 收起
    function setSidebar(open) {
      sidebar.classList.toggle('open', open);
      overlay.classList.toggle('show', open);
    }
    menuBtn.addEventListener('click', () => {
      setSidebar(!sidebar.classList.contains('open'));
    });
    overlay.addEventListener('click', () => setSidebar(false));

    // 显示单词开关：切换后重算节点半径并重新布局
    const labelToggle = document.getElementById('labelToggle');
    labelToggle.addEventListener('change', () => {
      graph.labelsVisible = labelToggle.checked;
      graph.recomputeRadii();
      graph.seed(canvas.clientWidth || 800, canvas.clientHeight || 600);
      state.hovered = null;
      state.selected = null;
      hideTooltip();
      fitView();
      render();
      wake();
    });

    // 词库切换
    librarySelect.addEventListener('change', () => {
      searchInput.value = '';
      loadLibrary(librarySelect.value);
      setSidebar(false); // 切换后自动收起侧边栏
    });

    // 搜索：输入时即时高亮，回车定位居中
    searchInput.addEventListener('input', () => {
      const word = findWord();
      if (word) {
        state.selected = word;
        state.hovered = null;
        updateTooltip();
        render();
      }
    });
    searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const word = findWord();
        if (word) {
          focusNode(word);
          setSidebar(false); // 定位后自动收起侧边栏
        }
        else if (searchInput.value.trim()) showSearchHint('未找到“' + searchInput.value.trim() + '”');
      }
    });

    // 鼠标拖拽节点 / 平移 / 悬停
    canvas.addEventListener('mousedown', e => {
      const pos = getPos(e);
      state.lastX = pos.sx;
      state.lastY = pos.sy;
      const node = nodeAt(pos.sx, pos.sy);
      if (node) {
        state.draggingNode = node;
        state.selected = node.word;
        state.hovered = null;
        node.fixed = true;
        hideTooltip();
        graph.wake();
        canvas.classList.add('dragging');
        wake();
      } else {
        state.panning = true;
        state.selected = null;
        state.hovered = null;
        hideTooltip();
        canvas.classList.add('dragging');
        render();
      }
    });

    canvas.addEventListener('mousemove', e => {
      const pos = getPos(e);
      if (state.draggingNode) {
        const w = toWorld(pos.sx, pos.sy);
        state.draggingNode.x = w.x;
        state.draggingNode.y = w.y;
        graph.wake();
        wake();
      } else if (state.panning) {
        view.offsetX += pos.sx - state.lastX;
        view.offsetY += pos.sy - state.lastY;
        render();
      } else {
        const node = nodeAt(pos.sx, pos.sy);
        const hoverWord = node ? node.word : null;
        if (hoverWord !== state.hovered) {
          state.hovered = hoverWord;
          updateTooltip();
          render();
        }
      }
      state.mouseX = pos.sx;
      state.mouseY = pos.sy;
      state.lastX = pos.sx;
      state.lastY = pos.sy;
    });

    window.addEventListener('mouseup', () => {
      if (state.draggingNode) {
        state.draggingNode.fixed = false;
        state.draggingNode = null;
        graph.wake();
        wake();
        if (state.selected) updateTooltip();
      }
      state.panning = false;
      canvas.classList.remove('dragging');
    });

    canvas.addEventListener('mouseleave', () => {
      if (!state.draggingNode && !state.panning && state.hovered) {
        state.hovered = null;
        // 有选中的词时，卡片改为跟随该节点显示；否则隐藏
        if (state.selected) updateTooltip();
        else hideTooltip();
        render();
      }
    });

    // 滚轮缩放（以鼠标为中心）
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const pos = getPos(e);
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const ns = Math.max(0.25, Math.min(3, view.scale * factor));
      const k = ns / view.scale;
      view.offsetX = pos.sx - (pos.sx - view.offsetX) * k;
      view.offsetY = pos.sy - (pos.sy - view.offsetY) * k;
      view.scale = ns;
      render();
    }, { passive: false });

    // 双击：节点 → 聚焦居中；空白 → 重新适配
    canvas.addEventListener('dblclick', e => {
      const pos = getPos(e);
      const node = nodeAt(pos.sx, pos.sy);
      if (node) focusNode(node.word);
      else { fitView(); render(); }
    });

    // Esc 取消高亮并收起侧边栏
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        state.selected = null;
        state.hovered = null;
        hideTooltip();
        setSidebar(false);
        render();
      }
    });

    window.addEventListener('resize', () => { resize(); render(); });
  }

  /* ---------------- 初始化 ---------------- */

  function resize() {
    const wrap = document.getElementById('canvasWrap');
    canvas.width = Math.max(1, wrap.clientWidth) * devicePixelRatio;
    canvas.height = Math.max(1, wrap.clientHeight) * devicePixelRatio;
    canvas.style.width = wrap.clientWidth + 'px';
    canvas.style.height = wrap.clientHeight + 'px';
  }

  function init() {
    WORD_LIBRARIES.forEach(lib => {
      const o = document.createElement('option');
      o.value = lib.id;
      o.textContent = lib.name;
      librarySelect.appendChild(o);
    });
    buildLegend();
    bindEvents();
    resize();
    loadLibrary(WORD_LIBRARIES[0].id);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
