# α 词网 · 英语单词关系图谱

零依赖、纯前端的英语单词学习网页：每个单词是一个节点，词与词的关系（同义 / 反义 / 词根派生 / 上下位 / 相关）是连线，通过力导向算法自动铺成"蜘蛛网"结构。**双击 `index.html` 即可使用，无需安装任何东西，完全离线。**

## 使用

| 操作 | 效果 |
| --- | --- |
| 鼠标悬停节点 | 弹出卡片：音标、词性、释义、例句、关系列表 |
| 点击节点 | 锁定高亮，该词与直接相连的词醒目，其余变暗 |
| 拖拽节点 | 手动调整布局，松手后自动重新平衡 |
| 滚轮 | 以鼠标为中心缩放 |
| 拖拽空白处 | 平移画面 |
| 双击节点 / 空白 | 聚焦该词居中 / 重新适配全图 |
| 顶部搜索框 | 输入即时高亮，回车居中定位 |
| 顶部"显示单词"开关 | 在节点上显示 / 隐藏单词文本（默认隐藏，节点为简洁灰点） |
| 顶部词库下拉框 | 自由切换词库 |
| `Esc` | 取消高亮 |

节点为统一的**灰色小圆点**（简洁风格，尺寸随连接数微增），默认不显示单词，可用顶部"显示单词"开关切换。右上角图例：**线的颜色 = 关系类型**（绿=同义词，红=反义词，蓝=词根派生，橙=上下位词，紫=相关词）。

## 词库格式

词库是 JS 文件（放在 `data/` 下），本质是一个 JSON 数组，挂到全局 `window.WORD_LIBRARIES` 上：

```js
window.WORD_LIBRARIES.push({
  "id": "my-words",                        // 唯一标识（字母数字连字符）
  "name": "我的词库",                      // 下拉框显示名
  "words": [
    {
      "word": "fast",                     // 单词（必须唯一）
      "phonetic": "/fɑːst/",               // 音标（可省略）
      "senses": [                          // 义项数组：一个单词可含多个意思
        { "pos": "adv.", "meaning": "快速地", "examples": ["He runs very fast."] },
        { "pos": "adj.", "meaning": "快的；迅速的", "examples": ["We caught a fast train."] }
      ],
      "relations": [
        { "target": "quick", "type": "synonym", "weight": 0.85 }
      ]
    }
  ]
});
```

### senses 字段

- `senses`：义项数组，每个义项含 `pos`（词性：`adj.` / `n.` / `v.` / `adv.`）、`meaning`（中文释义）、`examples`（例句，可省略）。悬停卡片会列出全部义项。
- **兼容旧写法**：不写 `senses` 时，也可直接用顶级 `pos` / `meaning` / `examples` 表示单个义项。

### relations 字段

- `target`：目标单词，必须存在于同一词库的 `words` 中，否则忽略（悬空引用自动丢弃）。
- `type`：关系类型，决定了连线的颜色与图例标签：

| type | 含义 | 颜色 |
| --- | --- | --- |
| `synonym` | 同义词 | 绿 |
| `antonym` | 反义词 | 红 |
| `derivation` | 词根派生（如 happy → happiness） | 蓝 |
| `hypernym` | 上下位词（如 apple → fruit） | 橙 |
| `related` | 相关词 | 紫 |

- `weight`：关系强度 `0 ~ 1`，越大连线越粗、两词在布局中靠得越近（默认 0.5）。

关系是**无向**的：A 定义了指向 B 的关系，B 的卡片里同样会显示。同一对词的多条关系只保留一条（权重取大）。

## 如何添加词库

两种方式任选：

1. **复制现有词库文件**（推荐）：复制 `data/waijiaoshe-8a.js` 或 `data/libraries.js` 为 `data/my-words.js`，按上面的结构填写你的单词，刷新页面即可。
2. **编辑内置文件**：直接修改 `data/libraries.js`，在 `window.WORD_LIBRARIES = [ ... ]` 数组里追加词库对象（结构同上）。

项目已内置 `data/waijiaoshe-8a.js`，词库名称为“外研社八上”，数据来源为 `8A_U1_单词表.pdf`，可直接在词库下拉框中切换。

内置词书（按需加载，切换时才读取文件，不拖慢首屏）：

| 词书 | 词数 | 说明 |
| --- | --- | --- |
| 中考核心词 | 1500 | 高频优先，含派生/形似关系连线 |
| 高考核心词 | 1500 | 高频优先，含派生/形似关系连线 |

词书由 `tools/build-wordbooks.js` 生成，数据整理自：
- [ECDICT](https://github.com/skywind3000/ECDICT)（MIT）——音标、释义、词形变化表（lemma.en.txt）、易混词表（resemble.txt）
- [Qwerty Learner](https://github.com/RealKai42/qwerty-learner) 公开词表（中考/高考词汇，各考试大纲整理）

`data/ecdict-lookup.js` 是**词典底座**：`window.ECDICT_LOOKUP` 提供 `词 → [音标, 释义, 标签, 当代词频序, bnc词频序]` 的紧凑映射。现收录 **3.2 万+ 词条**（约 5 MB），由 50+ 本主流词书合并去重而来：COCA 2 万高频词、牛津 3000/5000、四六级、考研、雅思、托福、GRE、SAT、GMAT、BEC、专四专八、PTE、朗文 3000 等。供未来的自定义词书 / 词典查询功能使用（本地离线查询，无需联网）。如需更大覆盖面，网络通畅时可下载 [ECDICT 全量](https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv)（62.9MB）后运行 `node tools/build-wordbooks.js ecdict` 升级为 76 万词全量底座。

> 注意：文件必须是 **UTF-8 无 BOM** 编码（含中文时尤其重要）。

## 项目结构

```
词网/
├── index.html          # 页面骨架 + 工具栏（词书按需加载，不在此列出）
├── css/style.css       # 样式（浅色简约风）
├── js/graph.js         # 力导向物理引擎（排斥 / 弹簧 / 退火）
├── js/render.js        # Canvas 渲染（灰色节点 / 连线 / 高亮）+ 关系配色
├── js/ui.js            # 交互：词库切换（含懒加载）、搜索、悬停卡片、拖拽缩放平移
├── data/libraries.js   # 内置示例词库（55 词）
├── data/waijiaoshe-8a.js # 外研社八上词书（来自 8A_U1_单词表.pdf）
├── data/wb-zhongkao.js # 中考核心词（1500 词，懒加载）
├── data/wb-gaokao.js   # 高考核心词（1500 词，懒加载）
├── data/ecdict-lookup.js # 词典底座（词 → 音标/释义/标签/词频，供未来自定义词书查询）
└── tools/build-wordbooks.js # 词书构建脚本：node tools/build-wordbooks.js [qwerty|ecdict]
```

## 常见问题

- **打开后是空白 / 控制台报错**：确认词库文件为 UTF-8 无 BOM，且 `relations.target` 引用的单词都存在。
- **想用 JSON 格式**：本项目为离线双击打开设计，故词库用 JS 文件内嵌（`file://` 协议下浏览器禁止 fetch 本地 JSON）。若你有本地服务器，可自行扩展 `ui.js` 用 `fetch` 加载 JSON。
