'use strict';
/**
 * tools/build-wordbooks.js —— 生成词书与词典底座
 *
 * 两种数据源模式（node tools/build-wordbooks.js [qwerty|ecdict]）：
 *
 * 1) qwerty（默认，推荐，几分钟内可跑完）
 *    词书本体：Qwerty Learner (GPL-3.0, https://github.com/RealKai42/qwerty-learner)
 *              已按考试/教材分好词书，含中英音标与中文释义。
 *    派生关系：ECDICT lemma.en.txt（MIT）——BNC 语料词形变化表，生成 derivation 蓝边。
 *    形似关系：ECDICT resemble.txt（MIT）——易混词辨析组，生成 related 紫边。
 *
 * 2) ecdict
 *    需要先下载 .tmp-ecdict/ecdict.csv（62.9MB, MIT）：
 *      用浏览器/工具从 https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv 下载
 *    按 tag（zk 中考 / gk 高考 / cet4 ...）筛选词条 + exchange 派生边，生成更干净的词书
 *    与 76 万词全量词典底座。
 *
 * 依赖文件（放 .tmp-ecdict/ 下）：
 *   qwerty 模式：zkheixin.json, gk3500.json, lemma.en.txt, resemble.txt
 *   ecdict 模式：ecdict.csv, resemble.txt
 *
 * 输出（data/ 下，UTF-8 无 BOM）：
 *   wb-zhongkao.js / wb-gaokao.js ...  词书（兼容项目词库格式）
 *   ecdict-lookup.js                   词典底座 word → [音标, 释义, tag, 当代词频序, bnc词频序]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TMP = path.join(ROOT, '.tmp-ecdict');
const DATA = path.join(ROOT, 'data');

const MODE = (process.argv[2] || 'qwerty').toLowerCase();

/* ---------------- 词书配置 ---------------- */
const WORDBOOKS = {
  qwerty: [
    { id: 'wb-zhongkao', name: '中考核心词', file: 'wb-zhongkao.js', source: 'zkheixin.json', tag: 'zk', max: 1500 },
    { id: 'wb-gaokao',   name: '高考核心词', file: 'wb-gaokao.js',   source: 'gk3500.json',  tag: 'gk', max: 1500 },
  ],
  ecdict: [
    { id: 'wb-zhongkao', name: '中考核心词', file: 'wb-zhongkao.js', tags: ['zk'], max: 1500 },
    { id: 'wb-gaokao',   name: '高考核心词', file: 'wb-gaokao.js',   tags: ['gk'], max: 1500 },
  ]
}[MODE];

/* 词典底座来源（qwerty 模式）：合并这些词书得到几万词的 词→释义 映射。
   顺序即优先级：靠前的词书先收录（同词去重保留先见者）。 */
const LOOKUP_BOOKS = [
  { file: 'coca20000.json',   tag: 'coca' },
  { file: 'oxford5000.json',  tag: 'oxford' },
  { file: 'oxford3000.json',  tag: 'oxford' },
  { file: 'longman3000.json', tag: 'longman' },
  { file: 'ess4000.json',     tag: 'ess4000' },
  { file: 'cet4.json',        tag: 'cet4' },
  { file: 'cet6.json',        tag: 'cet6' },
  { file: 'kaoyan.json',      tag: 'kaoyan' },
  { file: 'kaoyan2024.json',  tag: 'kaoyan' },
  { file: 'ielts.json',       tag: 'ielts' },
  { file: 'ielts7000.json',   tag: 'ielts' },
  { file: 'toefl.json',       tag: 'toefl' },
  { file: 'toeflzhy.json',    tag: 'toefl' },
  { file: 'gre.json',         tag: 'gre' },
  { file: 'gre3000.json',     tag: 'gre' },
  { file: 'sat.json',         tag: 'sat' },
  { file: 'gmat.json',        tag: 'gmat' },
  { file: 'bec2.json',        tag: 'bec' },
  { file: 'bec3.json',        tag: 'bec' },
  { file: 'toeic.json',       tag: 'toeic' },
  { file: 'pets3.json',       tag: 'pets' },
  { file: 'zhuanzhuan.json',  tag: 'zhuanzhuan' },
  { file: 'gk3500.json',      tag: 'gk' },
  { file: 'zkheixin.json',    tag: 'zk' },
  { file: 'verb1000.json',    tag: 'top' },
  { file: 'noun1500.json',    tag: 'top' },
  { file: 'adj500.json',      tag: 'top' },
  { file: 'adv250.json',      tag: 'top' },
  { file: 'macmillan7000.json', tag: 'macmillan' },
  { file: 'razall.json',      tag: 'raz' },
  { file: 'nce1.json',        tag: 'nce' },
  { file: 'nce2.json',        tag: 'nce' },
  { file: 'nce3.json',        tag: 'nce' },
  { file: 'nce4.json',        tag: 'nce' },
  { file: 'ess4000s.json',    tag: 'ess4000' },
  { file: 'duoB1.json',       tag: 'duolingo' },
  { file: 'duoB2.json',       tag: 'duolingo' },
  { file: 'duoC1.json',       tag: 'duolingo' },
  { file: 'zhuan8.json',      tag: 'zhuan8' },
  { file: 'ieltsdis.json',    tag: 'ielts' },
  { file: 'ptesenior.json',   tag: 'pte' },
  { file: 'ptejunior.json',   tag: 'pte' },
  { file: 'rogers.json',      tag: 'rogers' },
  { file: 'ieltswang11.json', tag: 'ielts' },
  { file: 'ieltswang3.json',  tag: 'ielts' },
  { file: 'gre1500.json',     tag: 'gre' },
  { file: 'zaiyaoGRE.json',   tag: 'gre' },
  { file: 'merriam.json',     tag: 'merriam' },
  { file: 'voa.json',         tag: 'voa' },
  { file: 'freq1.json',       tag: 'freq' },
  { file: 'freq2.json',       tag: 'freq' },
  { file: 'freq3.json',       tag: 'freq' },
  { file: 'wordroots.json',   tag: 'wordroots' },
  { file: 'cambridge.json',   tag: 'cambridge' },
  { file: 'english2.json',    tag: 'english2' },
  { file: 'pets2023.json',    tag: 'pets' },
  { file: 'kaoyan2023.json',  tag: 'kaoyan' },
  { file: 'xinghuo6.json',    tag: 'xinghuo' },
  { file: 'danci2.json',      tag: 'danci' },
  { file: 'saten.json',       tag: 'sat' },
  { file: 'ielts9988.json',   tag: 'ielts' },
  { file: 'ieltslcj.json',    tag: 'ielts' },
  { file: 'english_ii_2.json', tag: 'selfstudy' },
];

/* ---------------- RFC4180 CSV 解析 ---------------- */
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/* ---------------- 词性归一 ---------------- */
const POS_ORDER = ['vt', 'vi', 'adj', 'adv', 'prep', 'conj', 'pron', 'num', 'art', 'int', 'aux', 'abbr', 'modal', 'suffix', 'prefix', 'n', 'v', 'a', 'ad', 'pl', 'suf', 'pre'];
const POS_MAP = {
  n: 'n.', v: 'v.', vt: 'vt.', vi: 'vi.',
  a: 'adj.', adj: 'adj.', ad: 'adv.', adv: 'adv.',
  prep: 'prep.', conj: 'conj.', pron: 'pron.', num: 'num.', art: 'art.', int: 'int.',
  aux: 'aux.', abbr: 'abbr.', modal: 'modal.', pl: 'n.',
  suffix: 'suffix.', prefix: 'prefix.', suf: 'suffix.', pre: 'prefix.'
};

function splitPosMeaning(line) {
  const s = line.trim();
  if (!s) return null;
  let m = s.match(/^(\[[^\]\n]+\])\s*(.*)$/);
  if (m) return { pos: m[1], meaning: m[2] };
  for (const p of POS_ORDER) {
    const re = new RegExp('^' + p + '\\.(\\s|$)', 'i');
    if (re.test(s)) {
      const rest = s.replace(new RegExp('^' + p + '\\.', 'i'), '').trim();
      return { pos: POS_MAP[p], meaning: rest };
    }
  }
  return { pos: '', meaning: s };
}

function parsePosField(posField) {
  if (!posField) return [];
  const out = [];
  for (const part of String(posField).split('/')) {
    const type = part.split(':')[0].trim().replace(/[.]/g, '').toLowerCase();
    if (type && !out.includes(type)) out.push(type);
  }
  return out;
}

/* ---------------- 义项 → senses ---------------- */
function sensesFromLines(lines, posFallback) {
  const senses = [];
  for (const line of lines) {
    const s = splitPosMeaning(line);
    if (!s || !s.meaning) continue;
    let pos = s.pos;
    if (!pos && posFallback.length) pos = posFallback[0];
    senses.push({ pos: pos || '', meaning: s.meaning });
  }
  return senses;
}

function parseSenses(translation, posField) {
  const posFallback = parsePosField(posField).map(p => POS_MAP[p] || (p + '.'));
  return sensesFromLines(String(translation || '').split('\n'), posFallback);
}

/* ---------------- lemma.en.txt：词形变化 → 派生边 ---------------- */
function loadLemma(file) {
  // "take/172773 -> took,taken,taking,takes"；变形（小写）→ 原型（小写）
  const variantToProto = new Map();   // 变形词 → 原型
  const protoToVariants = new Map();  // 原型 → [变形词]
  const protoFreq = new Map();        // 原型 → BNC 词频计数（越大越常见）
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line || line.startsWith(';')) continue;
    const arrow = line.indexOf('->');
    if (arrow < 0) continue;
    const head = line.slice(0, arrow).trim();
    const freq = parseInt(head.split('/')[1], 10) || 0;
    const proto = head.split('/')[0].trim().toLowerCase();
    const variants = line.slice(arrow + 2).split(',').map(v => v.trim().toLowerCase()).filter(Boolean);
    if (!proto) continue;
    if (freq > 0 && !protoFreq.has(proto)) protoFreq.set(proto, freq);
    if (!protoToVariants.has(proto)) protoToVariants.set(proto, []);
    for (const v of variants) {
      if (v === proto) continue;
      protoToVariants.get(proto).push(v);
      if (!variantToProto.has(v)) variantToProto.set(v, proto);
    }
  }
  return { variantToProto, protoToVariants, protoFreq };
}

/** 词条按 BNC 词频降序排序（同频保持原序），供截取前 N 词 */
function sortByFreq(words, lemma) {
  const freqOf = w => {
    const lw = String(w.name || w.word || '').toLowerCase();
    const proto = lemma.variantToProto.get(lw) || lw;
    return lemma.protoFreq.get(proto) || 0;
  };
  return words
    .map((w, i) => ({ w, f: freqOf(w), i }))
    .sort((a, b) => b.f - a.f || a.i - b.i)
    .map(x => x.w);
}

/**
 * 拆分 qwerty 高考词表的"时态组合"词条：
 * "take took taken"（第 2 个词是第 1 个词的变形）→ 只取原形 "take"；
 * "according to" / "swimming pool" / "human being"（不是时态组合）→ 保留整体短语。
 */
function splitWordName(name, lemma) {
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return [name.trim()];
  const first = parts[0].toLowerCase();
  const second = parts[1].toLowerCase();
  // 第二词是第一词的变形，或两者同属一个原型的变形组（如 good-better-best 共用比较级体系）
  const firstVariants = lemma.protoToVariants.get(first) || [];
  if (lemma.variantToProto.get(second) === first || firstVariants.includes(second)) return [parts[0]];
  return [name.trim()];
}

/** 派生边：lemma 变化表内、两端都在词集里的词对 */
function derivationPairs(wordSet, lemma) {
  const pairs = new Set(); // "a\u0001b"
  for (const w of wordSet) {
    // 1) w 是某个原型的变形 → 连原型
    const proto = lemma.variantToProto.get(w);
    if (proto && proto !== w && wordSet.has(proto)) {
      pairs.add([w, proto].sort().join('\u0001'));
    }
    // 2) w 是原型 → 连变形
    for (const v of (lemma.protoToVariants.get(w) || [])) {
      if (wordSet.has(v)) pairs.add([w, v].sort().join('\u0001'));
    }
  }
  return [...pairs].map(pair => pair.split('\u0001'));
}

/* ---------------- resemble.txt：易混词组 → related 边 ---------------- */
function parseResemble(text) {
  const groups = [];
  let cur = null;
  for (const line of text.split('\n')) {
    const s = line.trim();
    if (s.startsWith('%')) {
      cur = s.slice(1).split(',').map(w => w.trim().toLowerCase()).filter(Boolean);
      if (cur.length >= 2) groups.push(cur);
      else cur = null;
    }
  }
  return groups;
}

/* ---------------- 词书序列化 ---------------- */
function writeWordbook(wb, outWords) {
  const filePath = path.join(DATA, wb.file);
  const js = '/* ' + wb.name + ' · 数据整理自 ECDICT (MIT, github.com/skywind3000/ECDICT) 与 Qwerty Learner 公开词表 */\n'
    + 'window.WORD_LIBRARIES.push(' + JSON.stringify({ id: wb.id, name: wb.name, words: outWords }, null, 1) + ');\n';
  fs.writeFileSync(filePath, js);
  const edgeCount = outWords.reduce((n, w) => n + (w.relations ? w.relations.length : 0), 0) / 2;
  console.log('词书 ' + wb.name + ': 词数 ' + outWords.length + ' | 关系边 ' + Math.round(edgeCount)
    + ' | ' + (fs.statSync(filePath).size / 1024).toFixed(0) + ' KB');
}

/** 组内互连 related 边（仅两端都在词书内） */
function addResembleEdges(outWords, resembleGroups) {
  const idx = new Map(outWords.map((w, i) => [w.word.toLowerCase(), i]));
  let added = 0;
  for (const g of resembleGroups) {
    for (let i = 0; i < g.length; i++) {
      for (let j = i + 1; j < g.length; j++) {
        const a = idx.get(g[i]), b = idx.get(g[j]);
        if (a === undefined || b === undefined) continue;
        const A = outWords[a], B = outWords[b];
        (A.relations = A.relations || []).push({ target: B.word, type: 'related', weight: 0.55 });
        (B.relations = B.relations || []).push({ target: A.word, type: 'related', weight: 0.55 });
        added++;
      }
    }
  }
  return added;
}

/* ================= 模式 1：qwerty 词书 ================= */
function buildFromQwerty() {
  const lemma = loadLemma(path.join(TMP, 'lemma.en.txt'));
  const resembleGroups = fs.existsSync(path.join(TMP, 'resemble.txt'))
    ? parseResemble(fs.readFileSync(path.join(TMP, 'resemble.txt'), 'utf8')) : [];

  const lookup = {}; // 词典底座（qwerty 模式 = 合并全部 LOOKUP_BOOKS 词书）
  for (const wb of WORDBOOKS) {
    const raw = JSON.parse(fs.readFileSync(path.join(TMP, wb.source), 'utf8'));
    // 先拆分时态组合词条（"take took taken" → "take"），再按 BNC 词频排序 → 小写去重 → 截取前 N
    const expanded = [];
    for (const w of raw) {
      for (const name of splitWordName(w.name, lemma)) expanded.push({ ...w, name });
    }
    const picked = [];
    const seenKey = new Set();
    for (const w of sortByFreq(expanded, lemma)) {
      const key = w.name.toLowerCase();
      if (seenKey.has(key)) continue;
      seenKey.add(key);
      picked.push(w);
      if (picked.length >= wb.max) break;
    }
    const wordSet = new Set(picked.map(w => w.name.toLowerCase()));
    const outWords = picked.map(w => {
      const senses = sensesFromLines(w.trans || [], []);
      const node = {
        word: w.name.trim(),
        senses: senses.length ? senses : [{ pos: '', meaning: '' }]
      };
      const phone = w.ukphone || w.usphone || '';
      if (phone) node.phonetic = phone;
      return node;
    });

    // 派生边（lemma 表）
    for (const [a, b] of derivationPairs(wordSet, lemma)) {
      const ia = outWords.findIndex(w => w.word.toLowerCase() === a);
      const ib = outWords.findIndex(w => w.word.toLowerCase() === b);
      if (ia < 0 || ib < 0) continue;
      (outWords[ia].relations = outWords[ia].relations || []).push({ target: outWords[ib].word, type: 'derivation', weight: 0.7 });
      (outWords[ib].relations = outWords[ib].relations || []).push({ target: outWords[ia].word, type: 'derivation', weight: 0.7 });
    }
    const related = addResembleEdges(outWords, resembleGroups);
    console.log('[' + wb.name + '] lemma 派生边 + resemble 相关边: ' + related);
    writeWordbook(wb, outWords);
  }

  // 词典底座：合并全部 LOOKUP_BOOKS 词书（去重保先见者；组合词条取原形；清洗编号/空释义）
  for (const src of LOOKUP_BOOKS) {
    const file = path.join(TMP, src.file);
    if (!fs.existsSync(file)) { console.warn('跳过缺失词书:', src.file); continue; }
    const book = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(book)) { console.warn('跳过非词书数组:', src.file); continue; }
    for (const w of book) {
      // 清洗：牛津类词条 name 偶带编号（"bid 1" → "bid"）
      const rawName = String(w.name || '').trim().replace(/\s+\d+$/, '');
      if (!rawName) continue;
      const name = splitWordName(rawName, lemma)[0];
      const key = name.toLowerCase();
      if (lookup[key]) continue;
      // trans 兼容数组 / 字符串 / null
      const trans = Array.isArray(w.trans) ? w.trans : (w.trans ? [String(w.trans)] : []);
      const meaning = trans.join('\n').trim();
      if (!meaning) continue; // 无释义的词条不进底座
      lookup[key] = [w.ukphone || w.usphone || '', meaning, src.tag, 0, 0];
    }
  }
  const lookupPath = path.join(DATA, 'ecdict-lookup.js');
  const js = '/* 词典底座 · 数据整理自 Qwerty Learner 公开词表 + ECDICT */\n'
    + '/* 词 → [音标, 释义(\\n分隔), 来源tag, 当代词频序, bnc词频序]；词频 0 表示未收录。供自定义词书/词典查询功能使用。 */\n'
    + 'window.ECDICT_LOOKUP = ' + JSON.stringify(lookup) + ';\n';
  fs.writeFileSync(lookupPath, js);
  console.log('词典底座:', Object.keys(lookup).length, '词,', (fs.statSync(lookupPath).size / 1024).toFixed(0), 'KB');
}

/* ================= 模式 2：ECDICT 全量 ================= */
function buildFromEcdict() {
  const csvPath = path.join(TMP, 'ecdict.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('缺少 ' + csvPath + '，请先下载（qwerty 模式不需要它）。');
    process.exit(1);
  }
  console.log('读取', csvPath, (fs.statSync(csvPath).size / 1048576).toFixed(1), 'MB ...');
  const rows = parseCSV(fs.readFileSync(csvPath, 'utf8'));
  const header = rows[0].map(h => h.trim().toLowerCase());
  const entries = [];
  for (let i = 1; i < rows.length; i++) {
    const e = {};
    header.forEach((h, j) => { e[h] = (rows[i][j] !== undefined ? rows[i][j] : ''); });
    e._key = e.word.trim().toLowerCase();
    entries.push(e);
  }
  console.log('词条总数:', entries.length);

  const tagCount = new Map();
  for (const e of entries) {
    for (const t of String(e.tag || '').trim().split(/\s+/).filter(Boolean))
      tagCount.set(t, (tagCount.get(t) || 0) + 1);
  }
  console.log('== tag 分布 ==');
  [...tagCount.entries()].sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log('  ' + t + ': ' + c));

  function freqScore(e) {
    const f = parseInt(e.frq, 10), b = parseInt(e.bnc, 10);
    if (f > 0) return f;
    if (b > 0) return b;
    return 1e9;
  }

  const resembleGroups = fs.existsSync(path.join(TMP, 'resemble.txt'))
    ? parseResemble(fs.readFileSync(path.join(TMP, 'resemble.txt'), 'utf8')) : [];
  const lemma = loadLemma(path.join(TMP, 'lemma.en.txt'));

  // 词典底座：tag 非空全部词
  const lookup = {};
  for (const e of entries) {
    if (!String(e.tag || '').trim()) continue;
    const key = e._key;
    if (lookup[key]) continue;
    lookup[key] = [e.phonetic || '', String(e.translation || ''), String(e.tag || ''), freqScore(e) >= 1e9 ? 0 : freqScore(e), parseInt(e.bnc, 10) || 0];
  }
  const lookupPath = path.join(DATA, 'ecdict-lookup.js');
  fs.writeFileSync(lookupPath,
    '/* 词典底座 · 数据来源：ECDICT (MIT, https://github.com/skywind3000/ECDICT) */\n'
    + '/* 词 → [音标, 释义(\\n分隔), tag, 当代词频序, bnc词频序]；词频 0 表示未收录。 */\n'
    + 'window.ECDICT_LOOKUP = ' + JSON.stringify(lookup) + ';\n');
  console.log('词典底座:', Object.keys(lookup).length, '词,', (fs.statSync(lookupPath).size / 1048576).toFixed(2), 'MB');

  for (const wb of WORDBOOKS) {
    const picked = entries
      .filter(e => {
        const tags = String(e.tag || '').split(/\s+/);
        return wb.tags.every(t => tags.includes(t));
      })
      .sort((a, b) => freqScore(a) - freqScore(b))
      .slice(0, wb.max);

    const seen = new Set();
    const words = [];
    for (const e of picked) {
      if (seen.has(e._key)) continue;
      seen.add(e._key);
      words.push(e);
    }
    const wordSet = new Set(words.map(w => w._key));

    const outWords = words.map(w => {
      const senses = parseSenses(w.translation, w.pos);
      const node = { word: w.word.trim(), senses: senses.length ? senses : [{ pos: '', meaning: String(w.translation || '').trim() }] };
      if (w.phonetic) node.phonetic = w.phonetic;
      return node;
    });
    for (const [a, b] of derivationPairs(wordSet, lemma)) {
      const ia = outWords.findIndex(w => w.word.toLowerCase() === a);
      const ib = outWords.findIndex(w => w.word.toLowerCase() === b);
      if (ia < 0 || ib < 0) continue;
      (outWords[ia].relations = outWords[ia].relations || []).push({ target: outWords[ib].word, type: 'derivation', weight: 0.7 });
      (outWords[ib].relations = outWords[ib].relations || []).push({ target: outWords[ia].word, type: 'derivation', weight: 0.7 });
    }
    addResembleEdges(outWords, resembleGroups);
    writeWordbook(wb, outWords);
  }
}

/* ================= 入口 ================= */
if (MODE === 'qwerty') buildFromQwerty();
else if (MODE === 'ecdict') buildFromEcdict();
else { console.error('未知模式: ' + MODE + '（可用 qwerty | ecdict）'); process.exit(1); }
console.log('完成。');
