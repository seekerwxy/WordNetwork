'use strict';

/* 关系类型 → 颜色 / 中文标签（浅色简约风配色） */
const REL_STYLES = {
  synonym:    { color: '#2E9E6B', label: '同义词' },
  antonym:    { color: '#D64A45', label: '反义词' },
  derivation: { color: '#3E7CB1', label: '词根派生' },
  hypernym:   { color: '#D99A2B', label: '上下位词' },
  related:    { color: '#9B6BCA', label: '相关词' }
};

/* 节点配色：灰色系简洁风 */
const NODE_FILL = '#AEB4BB';      // 常态节点填充
const FOCUS_COLOR = '#343A40';    // 高亮（悬停/选中）节点填充
const NODE_TEXT_COLOR = '#FFFFFF'; // 节点上的单词文字
const DIM_ALPHA = 0.10;           // 非邻居在聚焦时的透明度

/**
 * 在 Canvas 上绘制整张图。
 * @param {CanvasRenderingContext2D} ctx
 * @param {WordGraph} graph
 * @param {{offsetX:number, offsetY:number, scale:number}} view 视口变换（世界→屏幕）
 * @param {{hovered:string|null, selected:string|null}} state 高亮状态（词名）
 */
function renderGraph(ctx, graph, view, state) {
  const { scale } = view;
  const focus = state.selected || state.hovered || null;
  const neighbors = focus ? new Set(graph.adj.get(focus).map(r => r.word)) : null;
  if (neighbors) neighbors.add(focus);

  ctx.save();
  ctx.translate(view.offsetX, view.offsetY);
  ctx.scale(scale, scale);

  // ---- 连线 ----
  for (const e of graph.edges) {
    const a = graph.nodes.get(e.a);
    const b = graph.nodes.get(e.b);
    const style = REL_STYLES[e.type] || REL_STYLES.related;
    let alpha = 0.5;
    if (neighbors) {
      alpha = (neighbors.has(e.a) && neighbors.has(e.b)) ? 0.85 : 0.05;
    }
    ctx.strokeStyle = style.color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = (0.8 + e.weight * 1.2) / scale;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  // ---- 节点 ----
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const n of graph.nodes.values()) {
    const isFocus = focus === n.word;
    const isNeighbor = neighbors ? neighbors.has(n.word) : true;
    if (neighbors && !isNeighbor) ctx.globalAlpha = DIM_ALPHA;
    else ctx.globalAlpha = 1;

    // 高亮节点加一圈淡色光晕
    if (isFocus) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
      ctx.fillStyle = FOCUS_COLOR;
      ctx.globalAlpha = ctx.globalAlpha * 0.18;
      ctx.fill();
      ctx.globalAlpha = isNeighbor ? 1 : DIM_ALPHA;
    }

    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = isFocus ? FOCUS_COLOR : NODE_FILL;
    ctx.fill();

    if (isFocus) {
      ctx.lineWidth = 2 / scale;
      ctx.strokeStyle = '#212529';
      ctx.stroke();
    } else {
      ctx.lineWidth = 1 / scale;
      ctx.strokeStyle = 'rgba(52,58,64,0.28)';
      ctx.stroke();
    }

    // 单词标签：默认隐藏，开启“显示单词”后绘制；缩放过小时同样隐藏避免重叠
    if (graph.labelsVisible && scale >= 0.55) {
      ctx.fillStyle = NODE_TEXT_COLOR;
      ctx.font = '600 10px "Segoe UI", "PingFang SC", system-ui, sans-serif';
      ctx.fillText(n.word, n.x, n.y);
    }
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}
