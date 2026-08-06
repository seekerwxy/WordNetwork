/* 内置词库：直接在 data/ 下新增 .js 文件（格式见 README.md）即可扩充词库。 */
window.WORD_LIBRARIES = [
  {
    "id": "core-55",
    "name": "核心词汇 55 词（示例）",
    "words": [
      {
        "word": "happy",
        "phonetic": "/ˈhæpi/",
        "pos": "adj.",
        "meaning": "高兴的，快乐的",
        "examples": ["She looks happy today.", "I'm happy to see you again."],
        "relations": [
          { "target": "joyful", "type": "synonym", "weight": 0.9 },
          { "target": "glad", "type": "synonym", "weight": 0.85 },
          { "target": "cheerful", "type": "synonym", "weight": 0.8 },
          { "target": "sad", "type": "antonym", "weight": 0.9 },
          { "target": "unhappy", "type": "antonym", "weight": 0.8 },
          { "target": "happiness", "type": "derivation", "weight": 0.9 },
          { "target": "hope", "type": "related", "weight": 0.5 }
        ]
      },
      {
        "word": "joyful",
        "phonetic": "/ˈdʒɔɪfl/",
        "pos": "adj.",
        "meaning": "充满喜悦的，快乐的",
        "examples": ["The children were joyful at the party."],
        "relations": [
          { "target": "happy", "type": "synonym", "weight": 0.9 },
          { "target": "cheerful", "type": "synonym", "weight": 0.8 }
        ]
      },
      {
        "word": "glad",
        "phonetic": "/ɡlæd/",
        "pos": "adj.",
        "meaning": "高兴的，乐意的",
        "examples": ["I'm glad you came."],
        "relations": [
          { "target": "happy", "type": "synonym", "weight": 0.85 }
        ]
      },
      {
        "word": "cheerful",
        "phonetic": "/ˈtʃɪəfl/",
        "pos": "adj.",
        "meaning": "欢快的，兴高采烈的",
        "examples": ["She always has a cheerful smile."],
        "relations": [
          { "target": "happy", "type": "synonym", "weight": 0.8 },
          { "target": "joyful", "type": "synonym", "weight": 0.75 }
        ]
      },
      {
        "word": "happiness",
        "phonetic": "/ˈhæpinəs/",
        "pos": "n.",
        "meaning": "幸福，快乐",
        "examples": ["Money cannot buy happiness."],
        "relations": [
          { "target": "happy", "type": "derivation", "weight": 0.9 },
          { "target": "sadness", "type": "antonym", "weight": 0.7 }
        ]
      },
      {
        "word": "unhappy",
        "phonetic": "/ʌnˈhæpi/",
        "pos": "adj.",
        "meaning": "不快乐的，不幸福的",
        "examples": ["He was unhappy with the result."],
        "relations": [
          { "target": "sad", "type": "synonym", "weight": 0.85 },
          { "target": "happy", "type": "antonym", "weight": 0.8 }
        ]
      },
      {
        "word": "sad",
        "phonetic": "/sæd/",
        "pos": "adj.",
        "meaning": "悲伤的，难过的",
        "examples": ["The movie has a sad ending."],
        "relations": [
          { "target": "unhappy", "type": "synonym", "weight": 0.85 },
          { "target": "happy", "type": "antonym", "weight": 0.9 },
          { "target": "sadness", "type": "derivation", "weight": 0.9 }
        ]
      },
      {
        "word": "sadness",
        "phonetic": "/ˈsædnəs/",
        "pos": "n.",
        "meaning": "悲伤，难过",
        "examples": ["She left with great sadness."],
        "relations": [
          { "target": "sad", "type": "derivation", "weight": 0.9 },
          { "target": "happiness", "type": "antonym", "weight": 0.7 }
        ]
      },
      {
        "word": "angry",
        "phonetic": "/ˈæŋɡri/",
        "pos": "adj.",
        "meaning": "生气的，愤怒的",
        "examples": ["Don't be angry with me."],
        "relations": [
          { "target": "calm", "type": "antonym", "weight": 0.85 }
        ]
      },
      {
        "word": "calm",
        "phonetic": "/kɑːm/",
        "pos": "adj.",
        "meaning": "平静的，镇定的",
        "examples": ["Stay calm and think carefully."],
        "relations": [
          { "target": "angry", "type": "antonym", "weight": 0.85 }
        ]
      },
      {
        "word": "scared",
        "phonetic": "/skeəd/",
        "pos": "adj.",
        "meaning": "害怕的，受惊的",
        "examples": ["I'm scared of the dark."],
        "relations": [
          { "target": "afraid", "type": "synonym", "weight": 0.9 }
        ]
      },
      {
        "word": "afraid",
        "phonetic": "/əˈfreɪd/",
        "pos": "adj.",
        "meaning": "害怕的，担心的",
        "examples": ["Don't be afraid to ask questions."],
        "relations": [
          { "target": "scared", "type": "synonym", "weight": 0.9 },
          { "target": "brave", "type": "antonym", "weight": 0.8 }
        ]
      },
      {
        "word": "brave",
        "phonetic": "/breɪv/",
        "pos": "adj.",
        "meaning": "勇敢的",
        "examples": ["It was brave of you to speak up."],
        "relations": [
          { "target": "afraid", "type": "antonym", "weight": 0.8 }
        ]
      },
      {
        "word": "kind",
        "phonetic": "/kaɪnd/",
        "pos": "adj.",
        "meaning": "善良的，友好的",
        "examples": ["She is kind to everyone."],
        "relations": [
          { "target": "friendly", "type": "synonym", "weight": 0.75 },
          { "target": "kindness", "type": "derivation", "weight": 0.9 },
          { "target": "helpful", "type": "related", "weight": 0.6 }
        ]
      },
      {
        "word": "kindness",
        "phonetic": "/ˈkaɪndnəs/",
        "pos": "n.",
        "meaning": "善良，仁慈",
        "examples": ["Thank you for your kindness."],
        "relations": [
          { "target": "kind", "type": "derivation", "weight": 0.9 }
        ]
      },
      {
        "word": "friendly",
        "phonetic": "/ˈfrendli/",
        "pos": "adj.",
        "meaning": "友好的，友善的",
        "examples": ["The locals are very friendly."],
        "relations": [
          { "target": "kind", "type": "synonym", "weight": 0.75 },
          { "target": "friend", "type": "derivation", "weight": 0.85 }
        ]
      },
      {
        "word": "friend",
        "phonetic": "/frend/",
        "pos": "n.",
        "meaning": "朋友",
        "examples": ["He is my best friend."],
        "relations": [
          { "target": "friendly", "type": "derivation", "weight": 0.85 },
          { "target": "friendship", "type": "derivation", "weight": 0.9 }
        ]
      },
      {
        "word": "friendship",
        "phonetic": "/ˈfrendʃɪp/",
        "pos": "n.",
        "meaning": "友谊，友情",
        "examples": ["Their friendship lasted for years."],
        "relations": [
          { "target": "friend", "type": "derivation", "weight": 0.9 }
        ]
      },
      {
        "word": "smart",
        "phonetic": "/smɑːt/",
        "pos": "adj.",
        "meaning": "聪明的，机灵的",
        "examples": ["She is smart and hardworking."],
        "relations": [
          { "target": "clever", "type": "synonym", "weight": 0.85 }
        ]
      },
      {
        "word": "clever",
        "phonetic": "/ˈklevə(r)/",
        "pos": "adj.",
        "meaning": "聪明的，巧妙的",
        "examples": ["That was a clever idea."],
        "relations": [
          { "target": "smart", "type": "synonym", "weight": 0.85 }
        ]
      },
      {
        "word": "lazy",
        "phonetic": "/ˈleɪzi/",
        "pos": "adj.",
        "meaning": "懒惰的",
        "examples": ["He is too lazy to get up early."],
        "relations": [
          { "target": "hardworking", "type": "antonym", "weight": 0.85 }
        ]
      },
      {
        "word": "hardworking",
        "phonetic": "/ˌhɑːdˈwɜːkɪŋ/",
        "pos": "adj.",
        "meaning": "勤奋的，努力工作的",
        "examples": ["She is a hardworking student."],
        "relations": [
          { "target": "lazy", "type": "antonym", "weight": 0.85 }
        ]
      },
      {
        "word": "big",
        "phonetic": "/bɪɡ/",
        "senses": [
          { "pos": "adj.", "meaning": "大的", "examples": ["They live in a big house."] },
          { "pos": "adj.", "meaning": "重大的，重要的", "examples": ["Tomorrow is a big day for us."] }
        ],
        "relations": [
          { "target": "large", "type": "synonym", "weight": 0.85 },
          { "target": "small", "type": "antonym", "weight": 0.9 },
          { "target": "great", "type": "related", "weight": 0.5 }
        ]
      },
      {
        "word": "large",
        "phonetic": "/lɑːdʒ/",
        "pos": "adj.",
        "meaning": "大的，大规模的",
        "examples": ["A large crowd gathered outside."],
        "relations": [
          { "target": "big", "type": "synonym", "weight": 0.85 }
        ]
      },
      {
        "word": "small",
        "phonetic": "/smɔːl/",
        "senses": [
          { "pos": "adj.", "meaning": "小的，少的", "examples": ["This is a small problem."] },
          { "pos": "adj.", "meaning": "不重要的，微小的", "examples": ["It was only a small mistake."] }
        ],
        "relations": [
          { "target": "big", "type": "antonym", "weight": 0.9 }
        ]
      },
      {
        "word": "beautiful",
        "phonetic": "/ˈbjuːtɪfl/",
        "pos": "adj.",
        "meaning": "美丽的，漂亮的",
        "examples": ["What a beautiful garden!"],
        "relations": [
          { "target": "pretty", "type": "synonym", "weight": 0.85 },
          { "target": "ugly", "type": "antonym", "weight": 0.85 }
        ]
      },
      {
        "word": "pretty",
        "phonetic": "/ˈprɪti/",
        "pos": "adj.",
        "meaning": "漂亮的，可爱的",
        "examples": ["The sky looks pretty at sunset."],
        "relations": [
          { "target": "beautiful", "type": "synonym", "weight": 0.85 }
        ]
      },
      {
        "word": "ugly",
        "phonetic": "/ˈʌɡli/",
        "pos": "adj.",
        "meaning": "丑陋的",
        "examples": ["The building is quite ugly."],
        "relations": [
          { "target": "beautiful", "type": "antonym", "weight": 0.85 }
        ]
      },
      {
        "word": "fast",
        "phonetic": "/fɑːst/",
        "senses": [
          { "pos": "adv.", "meaning": "快速地", "examples": ["He runs very fast."] },
          { "pos": "adj.", "meaning": "快的；迅速的", "examples": ["We caught a fast train."] }
        ],
        "relations": [
          { "target": "quick", "type": "synonym", "weight": 0.85 },
          { "target": "slow", "type": "antonym", "weight": 0.85 }
        ]
      },
      {
        "word": "quick",
        "phonetic": "/kwɪk/",
        "pos": "adj.",
        "meaning": "快的，迅速的",
        "examples": ["Let's have a quick lunch."],
        "relations": [
          { "target": "fast", "type": "synonym", "weight": 0.85 }
        ]
      },
      {
        "word": "slow",
        "phonetic": "/sləʊ/",
        "senses": [
          { "pos": "adj.", "meaning": "慢的，缓慢的", "examples": ["The train is slow today."] },
          { "pos": "v.", "meaning": "放慢，减缓", "examples": ["Slow down and take your time."] }
        ],
        "relations": [
          { "target": "fast", "type": "antonym", "weight": 0.85 }
        ]
      },
      {
        "word": "easy",
        "phonetic": "/ˈiːzi/",
        "pos": "adj.",
        "meaning": "容易的，简单的",
        "examples": ["This question is easy."],
        "relations": [
          { "target": "difficult", "type": "antonym", "weight": 0.9 }
        ]
      },
      {
        "word": "difficult",
        "phonetic": "/ˈdɪfɪkəlt/",
        "pos": "adj.",
        "meaning": "困难的，难懂的",
        "examples": ["The exam was difficult."],
        "relations": [
          { "target": "easy", "type": "antonym", "weight": 0.9 }
        ]
      },
      {
        "word": "important",
        "phonetic": "/ɪmˈpɔːtnt/",
        "pos": "adj.",
        "meaning": "重要的",
        "examples": ["Sleep is important for health."],
        "relations": [
          { "target": "essential", "type": "synonym", "weight": 0.85 }
        ]
      },
      {
        "word": "essential",
        "phonetic": "/ɪˈsenʃl/",
        "pos": "adj.",
        "meaning": "必要的，必不可少的",
        "examples": ["Water is essential for life."],
        "relations": [
          { "target": "important", "type": "synonym", "weight": 0.85 }
        ]
      },
      {
        "word": "rich",
        "phonetic": "/rɪtʃ/",
        "senses": [
          { "pos": "adj.", "meaning": "富有的", "examples": ["He became rich through hard work."] },
          { "pos": "adj.", "meaning": "丰盛的；油腻的", "examples": ["This cake is too rich for me."] }
        ],
        "relations": [
          { "target": "wealthy", "type": "synonym", "weight": 0.85 },
          { "target": "poor", "type": "antonym", "weight": 0.85 }
        ]
      },
      {
        "word": "wealthy",
        "phonetic": "/ˈwelθi/",
        "pos": "adj.",
        "meaning": "富裕的，有钱的",
        "examples": ["She comes from a wealthy family."],
        "relations": [
          { "target": "rich", "type": "synonym", "weight": 0.85 }
        ]
      },
      {
        "word": "poor",
        "phonetic": "/pɔː(r)/",
        "pos": "adj.",
        "meaning": "贫穷的，可怜的",
        "examples": ["They were too poor to buy food."],
        "relations": [
          { "target": "rich", "type": "antonym", "weight": 0.85 }
        ]
      },
      {
        "word": "food",
        "phonetic": "/fuːd/",
        "pos": "n.",
        "meaning": "食物",
        "examples": ["I need to buy some food."],
        "relations": [
          { "target": "fruit", "type": "hypernym", "weight": 0.8 }
        ]
      },
      {
        "word": "fruit",
        "phonetic": "/fruːt/",
        "senses": [
          { "pos": "n.", "meaning": "水果", "examples": ["Eating fruit is good for you."] },
          { "pos": "n.", "meaning": "成果，结果", "examples": ["The project finally bore fruit."] }
        ],
        "relations": [
          { "target": "food", "type": "hypernym", "weight": 0.8 },
          { "target": "apple", "type": "hypernym", "weight": 0.85 }
        ]
      },
      {
        "word": "apple",
        "phonetic": "/ˈæpl/",
        "pos": "n.",
        "meaning": "苹果",
        "examples": ["An apple a day keeps the doctor away."],
        "relations": [
          { "target": "fruit", "type": "hypernym", "weight": 0.85 }
        ]
      },
      {
        "word": "animal",
        "phonetic": "/ˈænɪml/",
        "pos": "n.",
        "meaning": "动物",
        "examples": ["The panda is my favorite animal."],
        "relations": [
          { "target": "dog", "type": "hypernym", "weight": 0.8 },
          { "target": "cat", "type": "hypernym", "weight": 0.8 },
          { "target": "bird", "type": "hypernym", "weight": 0.8 }
        ]
      },
      {
        "word": "dog",
        "phonetic": "/dɒɡ/",
        "pos": "n.",
        "meaning": "狗",
        "examples": ["My dog likes to play outside."],
        "relations": [
          { "target": "animal", "type": "hypernym", "weight": 0.8 },
          { "target": "cat", "type": "related", "weight": 0.6 }
        ]
      },
      {
        "word": "cat",
        "phonetic": "/kæt/",
        "pos": "n.",
        "meaning": "猫",
        "examples": ["The cat is sleeping on the sofa."],
        "relations": [
          { "target": "animal", "type": "hypernym", "weight": 0.8 },
          { "target": "dog", "type": "related", "weight": 0.6 }
        ]
      },
      {
        "word": "bird",
        "phonetic": "/bɜːd/",
        "pos": "n.",
        "meaning": "鸟",
        "examples": ["A bird is singing in the tree."],
        "relations": [
          { "target": "animal", "type": "hypernym", "weight": 0.8 }
        ]
      },
      {
        "word": "care",
        "phonetic": "/keə(r)/",
        "senses": [
          { "pos": "v.", "meaning": "关心，在乎", "examples": ["I don't care what others say."] },
          { "pos": "n.", "meaning": "照顾，照料；小心", "examples": ["The patient needs special care."] }
        ],
        "relations": [
          { "target": "careful", "type": "derivation", "weight": 0.85 }
        ]
      },
      {
        "word": "careful",
        "phonetic": "/ˈkeəfl/",
        "pos": "adj.",
        "meaning": "小心的，仔细的",
        "examples": ["Be careful when you cross the road."],
        "relations": [
          { "target": "care", "type": "derivation", "weight": 0.85 }
        ]
      },
      {
        "word": "use",
        "phonetic": "/juːz/",
        "senses": [
          { "pos": "v.", "meaning": "使用，利用", "examples": ["May I use your phone?"] },
          { "pos": "n.", "meaning": "用途，用处", "examples": ["This tool has many uses."] }
        ],
        "relations": [
          { "target": "useful", "type": "derivation", "weight": 0.85 }
        ]
      },
      {
        "word": "useful",
        "phonetic": "/ˈjuːsfl/",
        "pos": "adj.",
        "meaning": "有用的，有益的",
        "examples": ["This dictionary is very useful."],
        "relations": [
          { "target": "use", "type": "derivation", "weight": 0.85 }
        ]
      },
      {
        "word": "hope",
        "phonetic": "/həʊp/",
        "senses": [
          { "pos": "v.", "meaning": "希望，期望", "examples": ["I hope you feel better soon."] },
          { "pos": "n.", "meaning": "希望", "examples": ["There is still hope."] }
        ],
        "relations": [
          { "target": "hopeful", "type": "derivation", "weight": 0.85 },
          { "target": "happy", "type": "related", "weight": 0.5 }
        ]
      },
      {
        "word": "hopeful",
        "phonetic": "/ˈhəʊpfl/",
        "pos": "adj.",
        "meaning": "抱有希望的",
        "examples": ["She is hopeful about the future."],
        "relations": [
          { "target": "hope", "type": "derivation", "weight": 0.85 }
        ]
      },
      {
        "word": "help",
        "phonetic": "/help/",
        "senses": [
          { "pos": "v.", "meaning": "帮助", "examples": ["Can you help me with this?"] },
          { "pos": "n.", "meaning": "帮助，援助", "examples": ["Thank you for your help."] }
        ],
        "relations": [
          { "target": "helpful", "type": "derivation", "weight": 0.85 }
        ]
      },
      {
        "word": "helpful",
        "phonetic": "/ˈhelpfl/",
        "pos": "adj.",
        "meaning": "有帮助的，乐于助人的",
        "examples": ["Your advice was really helpful."],
        "relations": [
          { "target": "help", "type": "derivation", "weight": 0.85 },
          { "target": "kind", "type": "related", "weight": 0.6 }
        ]
      },
      {
        "word": "wonderful",
        "phonetic": "/ˈwʌndəfl/",
        "pos": "adj.",
        "meaning": "精彩的，绝妙的",
        "examples": ["We had a wonderful time."],
        "relations": [
          { "target": "great", "type": "synonym", "weight": 0.85 }
        ]
      },
      {
        "word": "great",
        "phonetic": "/ɡreɪt/",
        "pos": "adj.",
        "meaning": "极好的，伟大的",
        "examples": ["The weather is great today."],
        "relations": [
          { "target": "wonderful", "type": "synonym", "weight": 0.85 },
          { "target": "big", "type": "related", "weight": 0.5 }
        ]
      }
    ]
  }
];
