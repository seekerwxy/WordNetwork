'use strict';

/**
 * WordGraph —— 力导向图引擎
 * 节点之间互相排斥（库仑力），有关系（边）的节点互相牵引（胡克弹簧力），
 * 加上朝向画布中心的引力与阻尼，迭代若干帧后自然形成"蜘蛛网"布局。
 */
class WordGraph {
  constructor() {
    this.nodes = new Map();   // word -> {word, phonetic, senses, x, y, vx, vy, r, degree, fixed}
    this.edges = [];          // {a, b, type, weight}
    this.adj = new Map();     // word -> [{word, type, weight}]（邻接表）
    this.alpha = 0;           // 模拟强度（退火系数），越小越接近静止
    this.labelsVisible = false; // 是否在节点上显示单词文本
  }

  /** 从词库对象构建图。lib = { id, name, words: [...] } */
  load(lib) {
    this.nodes.clear();
    this.edges = [];
    this.adj.clear();

    for (const w of lib.words) {
      // 多义项归一化：优先用 senses 数组，兼容旧的 pos/meaning/examples 单义项写法
      const senses = (w.senses && w.senses.length)
        ? w.senses.map(s => ({ pos: s.pos || '', meaning: s.meaning || '', examples: s.examples || [] }))
        : [{ pos: w.pos || '', meaning: w.meaning || '', examples: w.examples || [] }];
      this.nodes.set(w.word, {
        word: w.word,
        phonetic: w.phonetic || '',
        senses,
        x: 0, y: 0, vx: 0, vy: 0,
        r: 8, degree: 0,
        fixed: false
      });
      this.adj.set(w.word, []);
    }

    // 建边：按无向键去重，同一对节点只保留一条（权重取大，类型随权重更新）
    const seen = new Map();
    for (const w of lib.words) {
      for (const r of (w.relations || [])) {
        const a = w.word, b = r.target;
        if (a === b) continue;
        if (!this.nodes.has(a) || !this.nodes.has(b)) continue; // 忽略悬空引用
        const key = a < b ? a + '\u0001' + b : b + '\u0001' + a;
        const type = REL_STYLES[r.type] ? r.type : 'related';
        const weight = Math.max(0.1, Math.min(1, Number(r.weight) || 0.5));
        const existing = seen.get(key);
        if (existing) {
          if (weight > existing.weight) {
            existing.weight = weight;
            existing.type = type;
          }
        } else {
          const edge = { a, b, type, weight };
          seen.set(key, edge);
          this.edges.push(edge);
        }
      }
    }

    // 统计度数（决定节点尺寸）
    for (const e of this.edges) {
      this.nodes.get(e.a).degree++;
      this.nodes.get(e.b).degree++;
    }

    // 按“是否显示标签”计算节点半径
    this.recomputeRadii();

    // 邻接表（双向）
    for (const e of this.edges) {
      this.adj.get(e.a).push({ word: e.b, type: e.type, weight: e.weight });
      this.adj.get(e.b).push({ word: e.a, type: e.type, weight: e.weight });
    }
  }

  /**
   * 根据当前标签显隐状态重算节点半径：
   * 默认灰色小圆点（按度数微增）；开启“显示单词”时按词长放大以容纳文本。
   */
  recomputeRadii() {
    for (const n of this.nodes.values()) {
      if (this.labelsVisible) {
        n.r = Math.max(10, Math.min(30, n.word.length * 4.6 + 9));
      } else {
        n.r = Math.max(6, Math.min(15, 7 + n.degree * 1.1));
      }
    }
  }

  /** 初始位置：以原点为中心的环形随机散布 */
  seed(w, h) {
    const n = this.nodes.size;
    let i = 0;
    const radius = Math.min(w, h) * 0.22;
    for (const node of this.nodes.values()) {
      const ang = (i / Math.max(1, n)) * Math.PI * 2 + Math.random() * 0.4;
      const rad = radius * (0.35 + Math.random() * 0.65);
      node.x = Math.cos(ang) * rad;
      node.y = Math.sin(ang) * rad;
      node.vx = 0;
      node.vy = 0;
      node.fixed = false;
      i++;
    }
    this.alpha = 1;
  }

  /** 拖拽/交互时重新激活模拟 */
  wake() {
    this.alpha = Math.max(this.alpha, 0.3);
  }

  /** 一步物理模拟 */
  tick() {
    if (this.alpha < 0.005) { this.alpha = 0; return; }
    const nodes = [...this.nodes.values()];
    const alpha = this.alpha;
    const REPULSE = 18000;   // 排斥力强度
    const DAMP = 0.85;       // 阻尼
    const CENTER = 0.012;    // 中心引力

    // 1) 两两排斥（库仑力，距离下限 20px 防止爆炸）
    // 固定（拖拽中）的节点仍向其他节点施加力，只是自身不移动
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 400) d2 = 400;
        const d = Math.sqrt(d2);
        const f = REPULSE / d2 * alpha;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        if (!b.fixed) { b.vx -= fx; b.vy -= fy; }
        if (!a.fixed) { a.vx += fx; a.vy += fy; }
      }
    }

    // 2) 弹簧力：沿边互相牵引，关系越强（weight 越大）静止距离越短
    const K = 0.045;
    for (const e of this.edges) {
      const a = this.nodes.get(e.a);
      const b = this.nodes.get(e.b);
      if (a.fixed && b.fixed) continue;
      let dx = a.x - b.x;
      let dy = a.y - b.y;
      const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      const rest = 55 + (1 - e.weight) * 90;
      const f = K * (d - rest) * alpha;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      if (!a.fixed) { a.vx -= fx; a.vy -= fy; }
      if (!b.fixed) { b.vx += fx; b.vy += fy; }
    }

    // 3) 中心引力 + 积分 + 阻尼
    for (const n of nodes) {
      if (n.fixed) { n.vx = 0; n.vy = 0; continue; }
      n.vx += -n.x * CENTER * alpha;
      n.vy += -n.y * CENTER * alpha;
      const speed = Math.hypot(n.vx, n.vy);
      if (speed > 6) { n.vx *= 6 / speed; n.vy *= 6 / speed; }
      n.x += n.vx;
      n.y += n.vy;
      n.vx *= DAMP;
      n.vy *= DAMP;
    }

    this.alpha *= 0.99;
  }

  /** 布局包围盒（世界坐标） */
  bounds() {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of this.nodes.values()) {
      minX = Math.min(minX, n.x - n.r);
      minY = Math.min(minY, n.y - n.r);
      maxX = Math.max(maxX, n.x + n.r);
      maxY = Math.max(maxY, n.y + n.r);
    }
    return { minX, minY, maxX, maxY };
  }
}
