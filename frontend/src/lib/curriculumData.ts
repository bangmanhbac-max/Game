import { LearningPackage, StrokeGestureType, VocabularyItem, QuizItem } from '../types/learning_content';

const GESTURES: StrokeGestureType[] = [
  'horizontal', 'vertical', 'slash', 'backslash', 'v_shape', 'caret', 'circle', 'lightning'
];

interface RawItem {
  w: string;   // target_text
  p: string;   // phonetic (Pinyin or IPA)
  m: string;   // meaning in English
  c?: string[]; // glyph characters (for Chinese runes)
}

function buildDeck(
  id: string,
  title: string,
  category: string,
  lang: string,
  desc: string,
  rawItems: RawItem[],
  quizSampleQuestions: Array<{ q: string; opts: string[]; a: number; exp: string }>
): LearningPackage {
  const items: VocabularyItem[] = rawItems.map((item, idx) => {
    const cleanType = item.w
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '') || `word${idx + 1}`;

    return {
      id: `${id}_v_${idx + 1}`,
      target_text: item.w,
      phonetic: item.p,
      type_target: cleanType,
      meaning: item.m,
      example: `${item.w}: ${item.m}`,
      difficulty: (idx % 3) + 1,
      stroke_gesture: GESTURES[idx % GESTURES.length],
      characters: item.c || (lang === 'zh-CN' ? item.w.split('') : undefined)
    };
  });

  const quizItems: QuizItem[] = quizSampleQuestions.map((q, idx) => ({
    id: `${id}_q_${idx + 1}`,
    question: q.q,
    options: q.opts,
    correct_index: q.a,
    explanation: q.exp,
    points: 100
  }));

  return {
    package_id: id,
    title,
    source_filename: `${id}.txt`,
    created_at: new Date().toISOString(),
    vocabulary_deck: {
      id: `deck_${id}`,
      title,
      description: `${desc} • Category: ${category}`,
      target_language: lang,
      items
    },
    quiz_deck: {
      id: `quiz_${id}`,
      title: `Speed Quiz: ${title}`,
      description: `Reflex trivia challenge for ${title}`,
      items: quizItems
    }
  };
}

// ==========================================
// 🇨🇳 MANDARIN HSK 1 CURRICULUM (6 LESSONS)
// ==========================================

export const HSK1_DECK_1 = buildDeck(
  'hsk1_b1_chao_hoi',
  'HSK 1 - Lesson 1: Greetings & Personal Pronouns',
  'Mandarin HSK 1',
  'zh-CN',
  'Essential greeting phrases and common personal pronouns',
  [
    { w: '你', p: 'nǐ', m: 'You (singular, informal)' },
    { w: '我', p: 'wǒ', m: 'I / Me' },
    { w: '他', p: 'tā', m: 'He / Him' },
    { w: '她', p: 'tā', m: 'She / Her' },
    { w: '我们', p: 'wǒmen', m: 'We / Us' },
    { w: '你们', p: 'nǐmen', m: 'You (plural)' },
    { w: '他们', p: 'tāmen', m: 'They / Them' },
    { w: '您', p: 'nín', m: 'You (polite / respectful)' },
    { w: '你好', p: 'nǐ hǎo', m: 'Hello / Hi' },
    { w: '再见', p: 'zàijiàn', m: 'Goodbye / See you again' },
    { w: '谢谢', p: 'xièxie', m: 'Thank you' },
    { w: '不客气', p: 'bú kèqi', m: 'You are welcome' },
    { w: '对不起', p: 'duìbuqǐ', m: 'I am sorry / Excuse me' },
    { w: '没关系', p: 'méi guānxi', m: 'It does not matter / No problem' },
    { w: '是', p: 'shì', m: 'To be / Yes' },
    { w: '不是', p: 'bú shì', m: 'Is not / No' },
    { w: '好', p: 'hǎo', m: 'Good / Fine / Well' },
    { w: '很高兴', p: 'hěn gāoxìng', m: 'Very glad / Pleased' },
    { w: '叫', p: 'jiào', m: 'To be called / Name is' },
    { w: '名字', p: 'míngzi', m: 'Name' }
  ],
  [
    { q: "What is the meaning of '你好' (nǐ hǎo)?", opts: ['A. Goodbye', 'B. Hello', 'C. Thank you', 'D. Sorry'], a: 1, exp: "'你好' (nǐ hǎo) is the universal greeting for Hello." },
    { q: "When someone says '对不起' (duìbuqǐ), you reply:", opts: ['A. 没关系 (méi guānxi)', 'B. 谢谢 (xièxie)', 'C. 再见 (zàijiàn)', 'D. 不好 (bù hǎo)'], a: 0, exp: "'没关系' means 'No problem / It is okay'." },
    { q: "What does the plural pronoun '我们' (wǒmen) mean?", opts: ['A. You all', 'B. They / Them', 'C. We / Us', 'D. He / Him'], a: 2, exp: "'我们' refers to the first-person plural: We / Us." }
  ]
);

export const HSK1_DECK_2 = buildDeck(
  'hsk1_b2_gia_dinh',
  'HSK 1 - Lesson 2: Family & Relationships',
  'Mandarin HSK 1',
  'zh-CN',
  'Family members and familiar social relationship terms',
  [
    { w: '爸爸', p: 'bàba', m: 'Father / Dad' },
    { w: '妈妈', p: 'māma', m: 'Mother / Mom' },
    { w: '哥哥', p: 'gēge', m: 'Older brother' },
    { w: '姐姐', p: 'jiějie', m: 'Older sister' },
    { w: '弟弟', p: 'dìdi', m: 'Younger brother' },
    { w: '妹妹', p: 'mèimei', m: 'Younger sister' },
    { w: '儿子', p: 'érzi', m: 'Son' },
    { w: '女儿', p: 'nǚ\'ér', m: 'Daughter' },
    { w: '朋友', p: 'péngyou', m: 'Friend' },
    { w: '老师', p: 'lǎoshī', m: 'Teacher / Instructor' },
    { w: '学生', p: 'xuésheng', m: 'Student' },
    { w: '同学', p: 'tóngxué', m: 'Classmate' },
    { w: '家', p: 'jiā', m: 'Family / Home' },
    { w: '人', p: 'rén', m: 'Person / People' },
    { w: '爱', p: 'ài', m: 'Love / To love' },
    { w: '喜欢', p: 'xǐhuan', m: 'Like / To like' },
    { w: '认识', p: 'rènshi', m: 'To know / Recognize' },
    { w: '有', p: 'yǒu', m: 'To have' },
    { w: '没有', p: 'méiyǒu', m: 'Do not have' },
    { w: '和', p: 'hé', m: 'And / With' }
  ],
  [
    { q: "Which word means 'Mother / Mom' in Mandarin?", opts: ['A. 爸爸', 'B. 妈妈', 'C. 姐姐', 'D. 妹妹'], a: 1, exp: "'妈妈' (māma) means Mother / Mom." },
    { q: "What is the term for a teacher or instructor?", opts: ['A. 学生', 'B. 同学', 'C. 老师', 'D. 朋友'], a: 2, exp: "'老师' (lǎoshī) means Teacher." }
  ]
);

export const HSK1_DECK_3 = buildDeck(
  'hsk1_b3_so_dem_thoi_gian',
  'HSK 1 - Lesson 3: Numbers, Time & Dates',
  'Mandarin HSK 1',
  'zh-CN',
  'Basic numbers and time landmarks: days, months, and years',
  [
    { w: '一', p: 'yī', m: 'Number one (1)' },
    { w: '二', p: 'èr', m: 'Number two (2)' },
    { w: '三', p: 'sān', m: 'Number three (3)' },
    { w: '四', p: 'sì', m: 'Number four (4)' },
    { w: '五', p: 'wǔ', m: 'Number five (5)' },
    { w: '六', p: 'liù', m: 'Number six (6)' },
    { w: '七', p: 'qī', m: 'Number seven (7)' },
    { w: '八', p: 'bā', m: 'Number eight (8)' },
    { w: '九', p: 'jiǔ', m: 'Number nine (9)' },
    { w: '十', p: 'shí', m: 'Number ten (10)' },
    { w: '零', p: 'líng', m: 'Number zero (0)' },
    { w: '今天', p: 'jīntiān', m: 'Today' },
    { w: '明天', p: 'míngtiān', m: 'Tomorrow' },
    { w: '昨天', p: 'zuótiān', m: 'Yesterday' },
    { w: '年', p: 'nián', m: 'Year' },
    { w: '月', p: 'yuè', m: 'Month / Moon' },
    { w: '日', p: 'rì', m: 'Day / Sun' },
    { w: '星期', p: 'xīngqī', m: 'Week / Day of week' },
    { w: '点', p: 'diǎn', m: 'O\'clock / Hour' },
    { w: '分钟', p: 'fēnzhōng', m: 'Minute' }
  ],
  [
    { q: "What does '今天' (jīntiān) mean?", opts: ['A. Yesterday', 'B. Tomorrow', 'C. Today', 'D. Next year'], a: 2, exp: "'今天' means Today." },
    { q: "How is the number eight (8) pronounced in Mandarin?", opts: ['A. bā (八)', 'B. liù (六)', 'C. shí (十)', 'D. sì (四)'], a: 0, exp: "'八' is pronounced bā." }
  ]
);

export const HSK1_DECK_4 = buildDeck(
  'hsk1_b4_an_uong',
  'HSK 1 - Lesson 4: Food, Drinks & Fruits',
  'Mandarin HSK 1',
  'zh-CN',
  'Everyday food, beverages, and common delicious fruits',
  [
    { w: '吃', p: 'chī', m: 'To eat' },
    { w: '喝', p: 'hē', m: 'To drink' },
    { w: '水', p: 'shuǐ', m: 'Water' },
    { w: '茶', p: 'chá', m: 'Tea' },
    { w: '米饭', p: 'mǐfàn', m: 'Steamed rice' },
    { w: '面条', p: 'miàntiáo', m: 'Noodles' },
    { w: '菜', p: 'cài', m: 'Dish / Vegetable' },
    { w: '苹果', p: 'píngguǒ', m: 'Apple' },
    { w: '水果', p: 'shuǐguǒ', m: 'Fruit' },
    { w: '牛奶', p: 'niúnǎi', m: 'Fresh milk' },
    { w: '咖啡', p: 'kāfēi', m: 'Coffee' },
    { w: '面包', p: 'miànbāo', m: 'Bread' },
    { w: '鱼', p: 'yú', m: 'Fish' },
    { w: '肉', p: 'ròu', m: 'Meat' },
    { w: '蛋', p: 'dàn', m: 'Egg' },
    { w: '好吃', p: 'hǎochī', m: 'Delicious / Tasty' },
    { w: '饱', p: 'bǎo', m: 'Full (after eating)' },
    { w: '饿', p: 'è', m: 'Hungry' },
    { w: '甜', p: 'tián', m: 'Sweet' },
    { w: '多少钱', p: 'duōshao qián', m: 'How much money?' }
  ],
  [
    { q: "Which action means 'To drink water' in Mandarin?", opts: ['A. 吃水', 'B. 喝水', 'C. 喝茶', 'D. 吃米饭'], a: 1, exp: "'喝水' (hē shuǐ) translates directly to 'Drink water'." },
    { q: "What fruit does '苹果' (píngguǒ) refer to?", opts: ['A. Banana', 'B. Watermelon', 'C. Apple', 'D. Mango'], a: 2, exp: "'苹果' means Apple." }
  ]
);

export const HSK1_DECK_5 = buildDeck(
  'hsk1_b5_truong_hoc',
  'HSK 1 - Lesson 5: School & Study Supplies',
  'Mandarin HSK 1',
  'zh-CN',
  'School environments, learning activities, and smart digital devices',
  [
    { w: '学校', p: 'xuéxiào', m: 'School' },
    { w: '学习', p: 'xuéxí', m: 'To study / Learn' },
    { w: '读', p: 'dú', m: 'To read' },
    { w: '写', p: 'xiě', m: 'To write' },
    { w: '听', p: 'tīng', m: 'To listen / Hear' },
    { w: '说', p: 'shuō', m: 'To speak / Say' },
    { w: '汉字', p: 'hànzì', m: 'Chinese character' },
    { w: '汉语', p: 'hànyǔ', m: 'Mandarin Chinese language' },
    { w: '书', p: 'shū', m: 'Book' },
    { w: '本子', p: 'běnzi', m: 'Notebook' },
    { w: '桌子', p: 'zhuōzi', m: 'Table / Desk' },
    { w: '椅子', p: 'yǐzi', m: 'Chair' },
    { w: '笔', p: 'bǐ', m: 'Pen / Pencil' },
    { w: '电脑', p: 'diànnǎo', m: 'Computer' },
    { w: '手机', p: 'shǒujī', m: 'Mobile phone' },
    { w: '明白', p: 'míngbai', m: 'To understand / Clear' },
    { w: '懂', p: 'dǒng', m: 'To comprehend' },
    { w: '问', p: 'wèn', m: 'To ask' },
    { w: '问题', p: 'wèntí', m: 'Question / Problem' },
    { w: '考试', p: 'kǎoshì', m: 'Exam / Test' }
  ],
  [
    { q: "What is the meaning of '电脑' (diànnǎo)?", opts: ['A. Mobile phone', 'B. Computer', 'C. Television', 'D. Refrigerator'], a: 1, exp: "'电脑' (diànnǎo) literally means 'Electric brain' = Computer." }
  ]
);

export const HSK1_DECK_6 = buildDeck(
  'hsk1_b6_phuong_huong_dia_diem',
  'HSK 1 - Lesson 6: Directions & Locations',
  'Mandarin HSK 1',
  'zh-CN',
  'Spatial orientations, public service places, and countries',
  [
    { w: '上', p: 'shàng', m: 'Above / Up / On' },
    { w: '下', p: 'xià', m: 'Below / Down / Under' },
    { w: '前面', p: 'qiánmiàn', m: 'Front / In front of' },
    { w: '后面', p: 'hòumiàn', m: 'Behind / Back' },
    { w: '里', p: 'lǐ', m: 'Inside / In' },
    { w: '外', p: 'wài', m: 'Outside' },
    { w: '左', p: 'zuǒ', m: 'Left side' },
    { w: '右', p: 'yòu', m: 'Right side' },
    { w: '这里', p: 'zhèlǐ', m: 'Here / This place' },
    { w: '那里', p: 'nàlǐ', m: 'There / That place' },
    { w: '哪儿', p: 'nǎr', m: 'Where?' },
    { w: '去', p: 'qù', m: 'To go' },
    { w: '来', p: 'lái', m: 'To come' },
    { w: '回', p: 'huí', m: 'To return' },
    { w: '商店', p: 'shāngdiàn', m: 'Store / Shop' },
    { w: '医院', p: 'yīyuàn', m: 'Hospital' },
    { w: '饭店', p: 'fàndiàn', m: 'Restaurant / Hotel' },
    { w: '车站', p: 'chēzhàn', m: 'Bus / Train station' },
    { w: '机场', p: 'jīchǎng', m: 'Airport' },
    { w: '中国', p: 'Zhōngguó', m: 'China' }
  ],
  [
    { q: "Which place provides medical healthcare and treatment?", opts: ['A. 商店', 'B. 医院', 'C. 饭店', 'D. 车站'], a: 1, exp: "'医院' (yīyuàn) means Hospital." }
  ]
);

// ==========================================
// 🇨🇳 MANDARIN HSK 2 CURRICULUM (5 LESSONS)
// ==========================================

export const HSK2_DECK_7 = buildDeck(
  'hsk2_b7_mua_sam',
  'HSK 2 - Lesson 7: Shopping & Clothing',
  'Mandarin HSK 2',
  'zh-CN',
  'Shopping terms, colors, clothing apparel, and currency',
  [
    { w: '买', p: 'mǎi', m: 'To buy / Purchase' },
    { w: '卖', p: 'mài', m: 'To sell' },
    { w: '钱', p: 'qián', m: 'Money' },
    { w: '块', p: 'kuài', m: 'Yuan / Dollar (spoken currency unit)' },
    { w: '元', p: 'yuán', m: 'Yuan (official currency unit)' },
    { w: '便宜', p: 'piányi', m: 'Cheap / Inexpensive' },
    { w: '贵', p: 'guì', m: 'Expensive / Costly' },
    { w: '衣服', p: 'yīfu', m: 'Clothes / Clothing' },
    { w: '穿', p: 'chuān', m: 'To wear / Put on' },
    { w: '颜色', p: 'yánsè', m: 'Color' },
    { w: '红', p: 'hóng', m: 'Red' },
    { w: '白', p: 'bái', m: 'White' },
    { w: '黑', p: 'hēi', m: 'Black' },
    { w: '蓝', p: 'lán', m: 'Blue' },
    { w: '件', p: 'jiàn', m: 'Piece / Item (measure word for clothing)' },
    { w: '双', p: 'shuāng', m: 'Pair (measure word)' },
    { w: '裤子', p: 'kùzi', m: 'Trousers / Pants' },
    { w: '鞋子', p: 'xiézi', m: 'Shoes' },
    { w: '试', p: 'shì', m: 'To try on / Test' },
    { w: '超市', p: 'chāoshì', m: 'Supermarket' }
  ],
  [
    { q: "What is the antonym of '贵' (guì - Expensive)?", opts: ['A. 便宜 (piányi)', 'B. 好 (hǎo)', 'C. 买 (mǎi)', 'D. 大 (dà)'], a: 0, exp: "'便宜' (piányi) means Cheap or Inexpensive." }
  ]
);

export const HSK2_DECK_8 = buildDeck(
  'hsk2_b8_giao_thong',
  'HSK 2 - Lesson 8: Transportation & Commuting',
  'Mandarin HSK 2',
  'zh-CN',
  'Vehicles, public transit, and urban movement verbs',
  [
    { w: '出租车', p: 'chūzūchē', m: 'Taxi / Cab' },
    { w: '公共汽车', p: 'gōnggòng qìchē', m: 'Public bus' },
    { w: '火车', p: 'huǒchē', m: 'Train' },
    { w: '飞机', p: 'fēijī', m: 'Airplane' },
    { w: '地铁', p: 'dìtiě', m: 'Subway / Metro' },
    { w: '自行车', p: 'zìxíngchē', m: 'Bicycle / Bike' },
    { w: '开车', p: 'kāichē', m: 'To drive a car' },
    { w: '坐', p: 'zuò', m: 'To sit / Ride in (vehicle)' },
    { w: '走路', p: 'zǒulù', m: 'To walk on foot' },
    { w: '远', p: 'yuǎn', m: 'Far / Distant' },
    { w: '近', p: 'jìn', m: 'Near / Close' },
    { w: '离', p: 'lí', m: 'Distance from / Away from' },
    { w: '路', p: 'lù', m: 'Road / Route / Path' },
    { w: '往', p: 'wǎng', m: 'Towards / Head for' },
    { w: '拐', p: 'guǎi', m: 'To turn (direction)' },
    { w: '船', p: 'chuán', m: 'Boat / Ship' },
    { w: '慢', p: 'màn', m: 'Slow' },
    { w: '快', p: 'kuài', m: 'Fast / Quick' },
    { w: '票', p: 'piào', m: 'Ticket' },
    { w: '旅游', p: 'lǚyóu', m: 'Travel / Tour' }
  ],
  [
    { q: "Which vehicle operates in underground railway transit systems?", opts: ['A. 火车', 'B. 地铁 (dìtiě)', 'C. 出租车', 'D. 自行车'], a: 1, exp: "'地铁' (dìtiě) means Subway / Metro." }
  ]
);

export const HSK2_DECK_9 = buildDeck(
  'hsk2_b9_thoi_tiet_bon_mua',
  'HSK 2 - Lesson 9: Weather & Four Seasons',
  'Mandarin HSK 2',
  'zh-CN',
  'Climate, natural weather phenomena, and four annual seasons',
  [
    { w: '天气', p: 'tiānqì', m: 'Weather' },
    { w: '晴天', p: 'qíngtiān', m: 'Sunny day' },
    { w: '阴天', p: 'yīntiān', m: 'Overcast / Cloudy day' },
    { w: '雨', p: 'yǔ', m: 'Rain' },
    { w: '下雨', p: 'xiàyǔ', m: 'To rain' },
    { w: '雪', p: 'xuě', m: 'Snow' },
    { w: '风', p: 'fēng', m: 'Wind' },
    { w: '太阳', p: 'tàiyáng', m: 'Sun' },
    { w: '月亮', p: 'yuèliang', m: 'Moon' },
    { w: '热', p: 'rè', m: 'Hot' },
    { w: '冷', p: 'lěng', m: 'Cold' },
    { w: '暖和', p: 'nuǎnhuo', m: 'Warm' },
    { w: '凉快', p: 'liángkuai', m: 'Cool / Refreshing' },
    { w: '春天', p: 'chūntiān', m: 'Spring season' },
    { w: '夏天', p: 'xiàtiān', m: 'Summer season' },
    { w: '秋天', p: 'qiūtiān', m: 'Autumn / Fall season' },
    { w: '冬天', p: 'dōngtiān', m: 'Winter season' },
    { w: '度', p: 'dù', m: 'Degree (temperature)' },
    { w: '空气', p: 'kōngqì', m: 'Air / Atmosphere' },
    { w: '环境', p: 'huánjìng', m: 'Environment' }
  ],
  [
    { q: "What is the word for 'Summer' in Mandarin?", opts: ['A. 春天', 'B. 夏天 (xiàtiān)', 'C. 秋天', 'D. 冬天'], a: 1, exp: "'夏天' (xiàtiān) denotes the Summer season." }
  ]
);

export const HSK2_DECK_10 = buildDeck(
  'hsk2_b10_co_the_the_thao',
  'HSK 2 - Lesson 10: Body, Health & Sports',
  'Mandarin HSK 2',
  'zh-CN',
  'Human body anatomy, health symptoms, and popular sports',
  [
    { w: '身体', p: 'shēntǐ', m: 'Body / Health' },
    { w: '头', p: 'tóu', m: 'Head' },
    { w: '眼睛', p: 'yǎnjing', m: 'Eye(s)' },
    { w: '耳朵', p: 'ěrduo', m: 'Ear(s)' },
    { w: '鼻子', p: 'bízi', m: 'Nose' },
    { w: '嘴巴', p: 'zuǐba', m: 'Mouth' },
    { w: '手', p: 'shǒu', m: 'Hand' },
    { w: '腿', p: 'tuǐ', m: 'Leg' },
    { w: '生病', p: 'shēngbìng', m: 'To fall ill / Sick' },
    { w: '感冒', p: 'gǎnmào', m: 'To catch a cold' },
    { w: '发烧', p: 'fāshāo', m: 'To have a fever' },
    { w: '药', p: 'yào', m: 'Medicine / Drug' },
    { w: '疼', p: 'téng', m: 'Painful / Ache' },
    { w: '累', p: 'lèi', m: 'Tired / Exhausted' },
    { w: '休息', p: 'xiūxi', m: 'To rest / Relax' },
    { w: '跑步', p: 'pǎobù', m: 'Jogging / Running' },
    { w: '游泳', p: 'yóuyǒng', m: 'Swimming' },
    { w: '踢足球', p: 'tī zúqiú', m: 'To play soccer / football' },
    { w: '打篮球', p: 'dǎ lánqiú', m: 'To play basketball' },
    { w: '运动', p: 'yùndòng', m: 'Sports / Exercise' }
  ],
  [
    { q: "Which sport translates to 'Swimming' in Mandarin?", opts: ['A. 跑步', 'B. 游泳 (yóuyǒng)', 'C. 踢足球', 'D. 生病'], a: 1, exp: "'游泳' (yóuyǒng) means Swimming." }
  ]
);

export const HSK2_DECK_11 = buildDeck(
  'hsk2_b11_so_thich_cam_xuc',
  'HSK 2 - Lesson 11: Hobbies, Entertainment & Emotions',
  'Mandarin HSK 2',
  'zh-CN',
  'Recreational activities, leisure hobbies, and emotional states',
  [
    { w: '唱歌', p: 'chànggē', m: 'To sing songs' },
    { w: '跳舞', p: 'tiàowǔ', m: 'To dance' },
    { w: '画画', p: 'huàhuà', m: 'To paint / Draw' },
    { w: '听音乐', p: 'tīng yīnyuè', m: 'To listen to music' },
    { w: '看电影', p: 'kàn diànyǐng', m: 'To watch movies' },
    { w: '玩游戏', p: 'wán yóuxì', m: 'To play games' },
    { w: '上网', p: 'shàngwǎng', m: 'To surf the internet' },
    { w: '开心', p: 'kāixīn', m: 'Glad / Cheerful' },
    { w: '快乐', p: 'kuàilè', m: 'Happy / Joyful' },
    { w: '生气', p: 'shēngqì', m: 'Angry / Mad' },
    { w: '难过', p: 'nánguò', m: 'Sad / Sorrowful' },
    { w: '担心', p: 'dānxīn', m: 'To worry / Anxious' },
    { w: '害怕', p: 'hàipà', m: 'Afraid / Scared' },
    { w: '希望', p: 'xīwàng', m: 'Hope / To wish' },
    { w: '满意', p: 'mǎnyì', m: 'Satisfied / Content' },
    { w: '意思', p: 'yìsi', m: 'Meaning / Significance' },
    { w: '有趣', p: 'yǒuqù', m: 'Interesting / Fun' },
    { w: '觉得', p: 'juéde', m: 'To feel / Think' },
    { w: '打算', p: 'dǎsuàn', m: 'Plan / To intend' },
    { w: '准备', p: 'zhǔnbèi', m: 'Prepare / Ready' }
  ],
  [
    { q: "Which phrase means 'To play video games' in Mandarin?", opts: ['A. 玩游戏 (wán yóuxì)', 'B. 唱歌', 'C. 跳舞', 'D. 画画'], a: 0, exp: "'玩游戏' (wán yóuxì) means To play games." }
  ]
);

// ==========================================
// 🇨🇳 MANDARIN HSK 3 CURRICULUM (3 LESSONS)
// ==========================================

export const HSK3_DECK_12 = buildDeck(
  'hsk3_b12_cong_viec_van_phong',
  'HSK 3 - Lesson 12: Workplace & Career Life',
  'Mandarin HSK 3',
  'zh-CN',
  'Professional communication, corporate office life, and career growth',
  [
    { w: '工作', p: 'gōngzuò', m: 'Job / Work' },
    { w: '上班', p: 'shàngbān', m: 'To go to work / Start shift' },
    { w: '下班', p: 'xiàbān', m: 'To get off work' },
    { w: '公司', p: 'gōngsī', m: 'Company / Corporation' },
    { w: '经理', p: 'jīnglǐ', m: 'Manager / Director' },
    { w: '同事', p: 'tóngshì', m: 'Colleague / Coworker' },
    { w: '会议', p: 'huìyì', m: 'Meeting / Conference' },
    { w: '解决', p: 'jiějué', m: 'To solve / Resolve' },
    { w: '负责', p: 'fùzé', m: 'To be responsible for' },
    { w: '任务', p: 'rènwu', m: 'Task / Mission' },
    { w: '经验', p: 'jīngyàn', m: 'Experience' },
    { w: '机会', p: 'jīhuì', m: 'Opportunity / Chance' },
    { w: '成功', p: 'chénggōng', m: 'Success / To succeed' },
    { w: '努力', p: 'nǔlì', m: 'Hardworking / To strive' },
    { w: '工资', p: 'gōngzī', m: 'Salary / Wages' },
    { w: '迟到', p: 'chídào', m: 'To be late / Arrive late' },
    { w: '请假', p: 'qǐngjià', m: 'To ask for leave' },
    { w: '合作', p: 'hézuò', m: 'To cooperate / Collaborate' },
    { w: '发展', p: 'fāzhǎn', m: 'To develop / Grow' },
    { w: '成绩', p: 'chéngjì', m: 'Achievement / Grade' }
  ],
  [
    { q: "What is the corporate title for an executive or manager?", opts: ['A. 经理 (jīnglǐ)', 'B. 同事', 'C. 学生', 'D. 朋友'], a: 0, exp: "'经理' (jīnglǐ) denotes a Manager or Director." }
  ]
);

export const HSK3_DECK_13 = buildDeck(
  'hsk3_b13_do_thi_xa_hoi',
  'HSK 3 - Lesson 13: Urban Life, Services & Society',
  'Mandarin HSK 3',
  'zh-CN',
  'City landscapes, civic public services, and social environments',
  [
    { w: '城市', p: 'chéngshì', m: 'City / Metropolis' },
    { w: '街道', p: 'jiēdào', m: 'Street / Avenue' },
    { w: '邻居', p: 'línjū', m: 'Neighbor' },
    { w: '银行', p: 'yínháng', m: 'Bank' },
    { w: '邮局', p: 'yóujú', m: 'Post office' },
    { w: '宾馆', p: 'bīnguǎn', m: 'Hotel / Guesthouse' },
    { w: '图书馆', p: 'túshūguǎn', m: 'Library' },
    { w: '公园', p: 'gōngyuán', m: 'Public park' },
    { w: '警察', p: 'jǐngchá', m: 'Police officer' },
    { w: '司机', p: 'sījī', m: 'Driver / Chauffeur' },
    { w: '安全', p: 'ānquán', m: 'Safe / Secure' },
    { w: '危险', p: 'wēixiǎn', m: 'Dangerous / Hazard' },
    { w: '方便', p: 'fāngbiàn', m: 'Convenient / Handy' },
    { w: '干净', p: 'gānjìng', m: 'Clean / Spotless' },
    { w: '安静', p: 'ānjìng', m: 'Quiet / Peaceful' },
    { w: '热闹', p: 'rènao', m: 'Lively / Bustling' },
    { w: '变化', p: 'biànhuà', m: 'Change / Transformation' },
    { w: '历史', p: 'lìshǐ', m: 'History' },
    { w: '文化', p: 'wénhuà', m: 'Culture' },
    { w: '世界', p: 'shìjiè', m: 'World' }
  ],
  [
    { q: "Where can you quietly read and borrow books?", opts: ['A. 图书馆 (túshūguǎn)', 'B. 邮局', 'C. 银行', 'D. 车站'], a: 0, exp: "'图书馆' (túshūguǎn) is a Library." }
  ]
);

export const HSK3_DECK_14 = buildDeck(
  'hsk3_b14_tinh_cach_giao_tiep',
  'HSK 3 - Lesson 14: Personality & Personal Opinions',
  'Mandarin HSK 3',
  'zh-CN',
  'Adjectives describing human character, traits, and analytical views',
  [
    { w: '热情', p: 'rèqíng', m: 'Enthusiastic / Warm-hearted' },
    { w: '认真', p: 'rènzhēn', m: 'Conscientious / Earnest' },
    { w: '聪明', p: 'cōngming', m: 'Intelligent / Smart' },
    { w: '勇敢', p: 'yǒnggǎn', m: 'Brave / Courageous' },
    { w: '诚实', p: 'chéngshí', m: 'Honest / Truthful' },
    { w: '礼貌', p: 'lǐmào', m: 'Polite / Courteous' },
    { w: '严格', p: 'yángé', m: 'Strict / Rigorous' },
    { w: '耐心', p: 'nàixīn', m: 'Patient / Patience' },
    { w: '相信', p: 'xiāngxìn', m: 'To believe / Trust' },
    { w: '尊重', p: 'zūnzhòng', m: 'To respect / Honor' },
    { w: '讨论', p: 'tǎolùn', m: 'To discuss / Deliberate' },
    { w: '意见', p: 'yìjiàn', m: 'Opinion / Suggestion' },
    { w: '影响', p: 'yǐngxiǎng', m: 'Influence / Impact' },
    { w: '习惯', p: 'xíguàn', m: 'Habit / Custom' },
    { w: '选择', p: 'xuǎnzé', m: 'Choice / To select' },
    { w: '比较', p: 'bǐjiào', m: 'To compare / Relatively' },
    { w: '发现', p: 'fāxiàn', m: 'To discover / Find out' },
    { w: '检查', p: 'jiǎnchá', m: 'To inspect / Check' },
    { w: '保证', p: 'bǎozhèng', m: 'To guarantee / Assure' },
    { w: '坚持', p: 'jiānchí', m: 'To persist / Persevere' }
  ],
  [
    { q: "Which virtue describes someone who never lies or deceives?", opts: ['A. 诚实 (chéngshí)', 'B. 热情', 'C. 严格', 'D. 迟到'], a: 0, exp: "'诚实' (chéngshí) means Honest and Truthful." }
  ]
);

// ==========================================
// 🇬🇧 ENGLISH THEMATIC CURRICULUM (6 LESSONS)
// ==========================================

export const EN_DECK_15 = buildDeck(
  'en_b15_lap_trinh_it',
  'English - Lesson 15: Information Tech & Programming',
  'English for Tech',
  'en',
  'Core software engineering, data structures, and web architecture terms',
  [
    { w: 'Algorithm', p: '/ˈæl.ɡə.rɪ.ðəm/', m: 'Step-by-step computational procedure' },
    { w: 'Variable', p: '/ˈveə.ri.ə.bəl/', m: 'Named storage holding mutable data' },
    { w: 'Function', p: '/ˈfʌŋk.ʃən/', m: 'Reusable block of code instructions' },
    { w: 'Compiler', p: '/kəmˈpaɪ.lər/', m: 'Program translating code to machine language' },
    { w: 'Framework', p: '/ˈfreɪm.wɜːk/', m: 'Structural platform supporting software development' },
    { w: 'Database', p: '/ˈdeɪ.tə.beɪs/', m: 'Organized persistent data store' },
    { w: 'Debug', p: '/diːˈbʌɡ/', m: 'To identify and remove software bugs' },
    { w: 'Frontend', p: '/ˌfrʌntˈend/', m: 'Client-side user interface layer' },
    { w: 'Backend', p: '/ˌbækˈend/', m: 'Server-side logic and database layer' },
    { w: 'API', p: '/ˌeɪ.piːˈaɪ/', m: 'Application Programming Interface connecting services' },
    { w: 'Responsive', p: '/rɪˈspɒn.sɪv/', m: 'Adapts seamlessly to diverse screen dimensions' },
    { w: 'Component', p: '/kəmˈpəʊ.nənt/', m: 'Modular, reusable UI building block' },
    { w: 'Git', p: '/ɡɪt/', m: 'Distributed version control system' },
    { w: 'Repository', p: '/rɪˈpɒz.ɪ.tər.i/', m: 'Storage location housing source code and history' },
    { w: 'Deploy', p: '/dɪˈplɔɪ/', m: 'Publishing software to a live host or cloud' },
    { w: 'Cache', p: '/kæʃ/', m: 'High-speed temporary memory storage' },
    { w: 'Server', p: '/ˈsɜː.vər/', m: 'Host computer processing client network requests' },
    { w: 'Network', p: '/ˈnet.wɜːk/', m: 'Interconnected computer communication system' },
    { w: 'Protocol', p: '/ˈprəʊ.tə.kɒl/', m: 'Standard rules governing data transmission' },
    { w: 'Encryption', p: '/ɪnˈkrɪp.ʃən/', m: 'Converting plain data into secure ciphertext' }
  ],
  [
    { q: "Which term represents the interface connecting Frontend and Backend systems?", opts: ['A. API', 'B. Compiler', 'C. Cache', 'D. Git'], a: 0, exp: "API (Application Programming Interface) enables seamless communication between systems." },
    { q: "What is the process of locating and resolving source code errors called?", opts: ['A. Deploy', 'B. Debug', 'C. Server', 'D. Variable'], a: 1, exp: "Debug is the systematic process of finding and fixing software bugs." }
  ]
);

export const EN_DECK_16 = buildDeck(
  'en_b16_ai_data_science',
  'English - Lesson 16: Artificial Intelligence & Data Science',
  'English for Tech',
  'en',
  'Leading concepts in Generative AI, Machine Learning, and Deep Learning',
  [
    { w: 'Machine Learning', p: '/məˈʃiːn ˈlɜːnɪŋ/', m: 'Algorithms enabling systems to learn from data' },
    { w: 'Neural Network', p: '/ˈnjʊə.rəl ˈnet.wɜːk/', m: 'Interconnected node architecture inspired by the human brain' },
    { w: 'Deep Learning', p: '/diːp ˈlɜːnɪŋ/', m: 'Multi-layered neural architectures modeling complex abstractions' },
    { w: 'Computer Vision', p: '/kəmˈpjuːtər ˈvɪʒn/', m: 'Extracting semantic understanding from visual imagery' },
    { w: 'Natural Language Processing', p: '/ˈnætʃrəl ˈlæŋɡwɪdʒ/', m: 'Computational analysis of human text and speech' },
    { w: 'Supervised Learning', p: '/ˈsuːpəvaɪzd/', m: 'Model training guided by labeled input-output pairs' },
    { w: 'Dataset', p: '/ˈdeɪtəset/', m: 'Curated collection of training or testing samples' },
    { w: 'Feature', p: '/ˈfiːtʃər/', m: 'Measurable property or attribute used in modeling' },
    { w: 'Accuracy', p: '/ˈækjərəsi/', m: 'Ratio of correct predictions over total evaluations' },
    { w: 'Model Training', p: '/ˈtreɪnɪŋ/', m: 'Iterative optimization of model parameters' },
    { w: 'Inference', p: '/ˈɪnfərəns/', m: 'Generating predictions using an already trained model' },
    { w: 'Prompt', p: '/prɒmpt/', m: 'Natural language instruction directing an AI model' },
    { w: 'Hallucination', p: '/həˌluːsɪˈneɪʃn/', m: 'Plausible yet factually erroneous AI output' },
    { w: 'Token', p: '/ˈtəʊkən/', m: 'Basic sub-word unit parsed by neural models' },
    { w: 'Vector Database', p: '/ˈvektər ˈdeɪtəbeɪs/', m: 'Database indexing high-dimensional embeddings' },
    { w: 'LLM', p: '/ˌel.elˈem/', m: 'Large Language Model trained on extensive text datasets' },
    { w: 'VLM', p: '/ˌviː.elˈem/', m: 'Vision-Language Model reasoning over images and text' },
    { w: 'Overfitting', p: '/ˌəʊvəˈfɪtɪŋ/', m: 'Memorizing training noise instead of general patterns' },
    { w: 'Optimizer', p: '/ˈɒptɪmaɪzər/', m: 'Algorithm updating weights to minimize loss' },
    { w: 'Fine-tuning', p: '/faɪn ˈtjuːnɪŋ/', m: 'Adapting pre-trained weights to specialized task datasets' }
  ],
  [
    { q: "What phenomenon occurs when an AI outputs fabricated, incorrect statements?", opts: ['A. Hallucination', 'B. Optimizer', 'C. Token', 'D. Inference'], a: 0, exp: "Hallucination describes an AI generating convincing yet false assertions." }
  ]
);

export const EN_DECK_17 = buildDeck(
  'en_b17_tieng_anh_cong_so',
  'English - Lesson 17: Workplace & Management English',
  'English for Business',
  'en',
  'Corporate communication, project management, and executive etiquette',
  [
    { w: 'Collaboration', p: '/kəˌlæb.əˈreɪ.ʃən/', m: 'Cooperative teamwork driving shared business goals' },
    { w: 'Efficiency', p: '/ɪˈfɪʃ.ən.si/', m: 'Maximizing output while conserving resources' },
    { w: 'Productivity', p: '/ˌprɒd.ʌkˈtɪv.ə.ti/', m: 'Rate and volume of valuable output produced' },
    { w: 'Deadline', p: '/ˈded.laɪn/', m: 'Strict final cutoff date or time for deliverables' },
    { w: 'Presentation', p: '/ˌprez.ənˈteɪ.ʃən/', m: 'Visual briefing conveying structured ideas and plans' },
    { w: 'Negotiation', p: '/nəˌɡəʊ.ʃiˈeɪ.ʃən/', m: 'Discussion aimed at reaching a mutual agreement' },
    { w: 'Strategy', p: '/ˈstræt.ə.dʒi/', m: 'Long-term plan of action for competitive advantage' },
    { w: 'Objective', p: '/əbˈdʒek.tɪv/', m: 'Concrete, measurable goal targeted for accomplishment' },
    { w: 'Feedback', p: '/ˈfiːd.bæk/', m: 'Constructive evaluative guidance on performance' },
    { w: 'Performance', p: '/pəˈfɔː.məns/', m: 'Quality and effectiveness of work execution' },
    { w: 'Leadership', p: '/ˈliː.də.ʃɪp/', m: 'Guiding, inspiring, and mobilizing team members' },
    { w: 'Workflow', p: '/ˈwɜːk.fləʊ/', m: 'Progressive sequence of operational processes' },
    { w: 'Milestone', p: '/ˈmaɪl.stəʊn/', m: 'Significant checkpoint marking project advancement' },
    { w: 'Stakeholder', p: '/ˈsteɪkˌhəʊl.dər/', m: 'Individual or party with vested interest in a project' },
    { w: 'Budget', p: '/ˈbʌdʒ.ɪt/', m: 'Estimated financial plan for projected expenditures' },
    { w: 'Revenue', p: '/ˈrev.ən.juː/', m: 'Gross income generated from business operations' },
    { w: 'Contract', p: '/ˈkɒn.trækt/', m: 'Legally binding mutual agreement' },
    { w: 'Proposal', p: '/prəˈpəʊ.zəl/', m: 'Formal written offer or plan for consideration' },
    { w: 'Brainstorm', p: '/ˈbreɪn.stɔːm/', m: 'Creative group technique for generating novel solutions' },
    { w: 'Resignation', p: '/ˌrez.ɪɡˈneɪ.ʃən/', m: 'Formal notice relinquishing employment' }
  ],
  [
    { q: "What is the final deadline or target date to complete a project called?", opts: ['A. Deadline', 'B. Budget', 'C. Feedback', 'D. Workflow'], a: 0, exp: "A Deadline is the final cutoff time by which work must be delivered." }
  ]
);

export const EN_DECK_18 = buildDeck(
  'en_b18_du_lich_khach_san',
  'English - Lesson 18: Travel & Hospitality Services',
  'English for Travel',
  'en',
  'Global travel itineraries, airport procedures, and hotel hospitality',
  [
    { w: 'Destination', p: '/ˌdes.tɪˈneɪ.ʃən/', m: 'Target location of an ongoing journey' },
    { w: 'Boarding Pass', p: '/ˈbɔː.dɪŋ ˌpɑːs/', m: 'Document authorizing passenger entry onto a flight' },
    { w: 'Passport', p: '/ˈpɑːs.pɔːt/', m: 'Official government document verifying international travel citizenship' },
    { w: 'Baggage', p: '/ˈbæɡ.ɪdʒ/', m: 'Luggage and personal cases packed for travel' },
    { w: 'Departure', p: '/dɪˈpɑː.tʃər/', m: 'Scheduled time of leaving a terminal' },
    { w: 'Arrival', p: '/əˈraɪ.vəl/', m: 'Scheduled time of reaching a destination terminal' },
    { w: 'Reservation', p: '/ˌrez.əˈveɪ.ʃən/', m: 'Advance booking securing lodging, transport, or dining' },
    { w: 'Accommodation', p: '/əˌkɒm.əˈdeɪ.ʃən/', m: 'Lodging and shelter arrangements for travelers' },
    { w: 'Itinerary', p: '/aɪˈtɪn.ər.ər.i/', m: 'Detailed schedule and route of planned travel activities' },
    { w: 'Currency', p: '/ˈkʌr.ən.si/', m: 'Authorized system of money in common national use' },
    { w: 'Sightseeing', p: '/ˈsaɪtˌsiː.ɪŋ/', m: 'Visiting renowned historical landmarks and scenery' },
    { w: 'Souvenir', p: '/ˌsuː.vənˈɪər/', m: 'Mementos kept as a reminder of a place visited' },
    { w: 'Customs', p: '/ˈkʌs.təmz/', m: 'Government agency inspecting travelers and goods across borders' },
    { w: 'Reception', p: '/rɪˈsep.ʃən/', m: 'Hospitality desk welcoming and assisting arriving guests' },
    { w: 'Check-in', p: '/ˈtʃek.ɪn/', m: 'Process of registering arrival at an airport or hotel' },
    { w: 'Check-out', p: '/ˈtʃek.aʊt/', m: 'Process of settling bills and departing from lodging' },
    { w: 'Guide', p: '/ɡaɪd/', m: 'Professional leading and interpreting travel tours' },
    { w: 'Scenic', p: '/ˈsiː.nɪk/', m: 'Endowed with picturesque and charming natural beauty' },
    { w: 'Cruise', p: '/kruːz/', m: 'Sea voyage for pleasure visiting various ports' },
    { w: 'Adventure', p: '/ədˈven.tʃər/', m: 'Exciting, daring, and novel exploratory experience' }
  ],
  [
    { q: "Which essential document is required alongside a passport to board an airplane?", opts: ['A. Boarding Pass', 'B. Souvenir', 'C. Cruise', 'D. Sightseeing'], a: 0, exp: "A Boarding Pass verifies check-in clearance and grants boarding access." }
  ]
);

export const EN_DECK_19 = buildDeck(
  'en_b19_khoi_nghiep_tai_chinh',
  'English - Lesson 19: Startups, Finance & Investment',
  'English for Finance',
  'en',
  'Tech startup terminology, venture capital markets, and corporate finance',
  [
    { w: 'Entrepreneur', p: '/ˌɒn.trə.prəˈnɜːr/', m: 'Visionary founder building scalable enterprises' },
    { w: 'Venture Capital', p: '/ˈven.tʃər ˌkæp.ɪ.təl/', m: 'High-growth private capital backing startup innovation' },
    { w: 'Pitch Deck', p: '/pɪtʃ dek/', m: 'Visual presentation deck summarizing business traction to investors' },
    { w: 'Valuation', p: '/ˌvæl.juˈeɪ.ʃən/', m: 'Analytical assessment of an enterprise\'s financial worth' },
    { w: 'Equity', p: '/ˈek.wɪ.ti/', m: 'Proportional ownership stake in a company' },
    { w: 'Dividend', p: '/ˈdɪv.ɪ.dend/', m: 'Distribution of corporate earnings paid out to shareholders' },
    { w: 'Cash Flow', p: '/kæʃ fləʊ/', m: 'Total net amount of liquid funds moving into and out of a business' },
    { w: 'Asset', p: '/ˈæs.et/', m: 'Valuable economic resource expected to yield future utility' },
    { w: 'Liability', p: '/ˌlaɪ.əˈbɪl.ə.ti/', m: 'Financial debts and legally binding financial obligations' },
    { w: 'Profit', p: '/ˈprɒf.ɪt/', m: 'Net financial gain remaining after total operating costs' },
    { w: 'Deficit', p: '/ˈdef.ɪ.sɪt/', m: 'Amount by which expenditures exceed available revenue' },
    { w: 'Inflation', p: '/ɪnˈfleɪ.ʃən/', m: 'Broad macroeconomic rise in overall price levels' },
    { w: 'Portfolio', p: '/pɔːtˈfəʊ.li.əʊ/', m: 'Diversified collection of financial and business assets' },
    { w: 'Scalability', p: '/ˌskeɪ.ləˈbɪl.ə.ti/', m: 'Systemic capacity to expand revenue without proportional cost increases' },
    { w: 'Market Share', p: '/ˈmɑː.kɪt ʃeər/', m: 'Percentage of an industry\'s total sales generated by a specific company' },
    { w: 'Acquisition', p: '/ˌæk.wɪˈzɪʃ.ən/', m: 'Corporate purchase and takeover of another company' },
    { w: 'Monopoly', p: '/məˈnɒp.əl.i/', m: 'Exclusive market dominance by an individual firm' },
    { w: 'Bankruptcy', p: '/ˈbæŋ.krəpt.si/', m: 'Legal insolvency resulting from inability to meet debts' },
    { w: 'Crowdfunding', p: '/ˈkraʊdˌfʌn.dɪŋ/', m: 'Raising capital via distributed contributions from the public' },
    { w: 'Unicorn', p: '/ˈjuː.nɪ.kɔːn/', m: 'Privately held venture startup valued in excess of $1 billion' }
  ],
  [
    { q: "What is a private venture startup valued at over $1 Billion called?", opts: ['A. Unicorn', 'B. Asset', 'C. Deficit', 'D. Monopoly'], a: 0, exp: "A Unicorn is a privately held startup company with a valuation exceeding $1 Billion." }
  ]
);

export const EN_DECK_20 = buildDeck(
  'en_b20_khoa_hoc_vu_tru',
  'English - Lesson 20: Science, Astronomy & Future Universe',
  'English for Science',
  'en',
  'Astrophysics mysteries, quantum mechanics, and future space exploration',
  [
    { w: 'Cosmos', p: '/ˈkɒz.mɒs/', m: 'The boundless universe viewed as an orderly, harmonious whole' },
    { w: 'Galaxy', p: '/ˈɡæl.ək.si/', m: 'Enormous gravitationally bound system containing billions of stars' },
    { w: 'Solar System', p: '/ˌsəʊ.lə ˈsɪs.təm/', m: 'Gravitationally bound system consisting of the Sun and orbiting worlds' },
    { w: 'Orbit', p: '/ˈɔː.bɪt/', m: 'Curved gravitational trajectory of a body around a celestial mass' },
    { w: 'Gravity', p: '/ˈɡræv.ə.ti/', m: 'Fundamental universal force pulling physical masses toward one another' },
    { w: 'Satellite', p: '/ˈsæt.əl.aɪt/', m: 'Artificial or natural body orbiting around a larger celestial host' },
    { w: 'Astronaut', p: '/ˈæs.trə.nɔːt/', m: 'Professional trained to pilot, navigate, or operate in human spaceflight' },
    { w: 'Telescope', p: '/ˈtel.ɪ.skəʊp/', m: 'Optical instrument making distant astronomical objects appear closer' },
    { w: 'Black Hole', p: '/blæk həʊl/', m: 'Spacetime region of intense gravity where not even light can escape' },
    { w: 'Nebula', p: '/ˈneb.jə.lə/', m: 'Enormous interstellar cloud of cosmic dust, hydrogen, and plasma' },
    { w: 'Atmosphere', p: '/ˈæt.məs.fɪər/', m: 'Protective enveloping layer of gases surrounding a celestial world' },
    { w: 'Ecosystem', p: '/ˈiː.kəʊˌsɪs.təm/', m: 'Interacting biological community of organisms and their physical environment' },
    { w: 'Biodiversity', p: '/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/', m: 'Biological variety and variability of life on Earth' },
    { w: 'Renewable', p: '/rɪˈnjuː.ə.bəl/', m: 'Clean energy replenished naturally on a human timescale' },
    { w: 'Quantum', p: '/ˈkwɒn.təm/', m: 'Discrete minimum unit of any physical property in atomic physics' },
    { w: 'Mutation', p: '/mjuːˈteɪ.ʃən/', m: 'Permanent change in the genomic nucleotide sequence of an organism' },
    { w: 'Evolution', p: '/ˌiː.vəˈluː.ʃən/', m: 'Hereditary phenotypic change in biological populations over generations' },
    { w: 'Molecule', p: '/ˈmɒl.ɪ.kjuːl/', m: 'Electrically neutral group of atoms bound together by chemical forces' },
    { w: 'Nanotechnology', p: '/ˌnæn.əʊ.tekˈnɒl.ə.dʒi/', m: 'Engineering of functional matter at the molecular and atomic nanoscale' },
    { w: 'Exoplanet', p: '/ˈek.səʊˌplæn.ɪt/', m: 'Planet residing outside our solar system orbiting another star' }
  ],
  [
    { q: "What title is given to a human explorer operating in outer space missions?", opts: ['A. Astronaut', 'B. Satellite', 'C. Telescope', 'D. Molecule'], a: 0, exp: "An Astronaut is a professional trained for human spaceflight missions." }
  ]
);

// Complete master curriculum array (20 curated lessons = 400 vocabulary units)
export const ALL_CURRICULUM_DECKS: LearningPackage[] = [
  HSK1_DECK_1,
  HSK1_DECK_2,
  HSK1_DECK_3,
  HSK1_DECK_4,
  HSK1_DECK_5,
  HSK1_DECK_6,
  HSK2_DECK_7,
  HSK2_DECK_8,
  HSK2_DECK_9,
  HSK2_DECK_10,
  HSK2_DECK_11,
  HSK3_DECK_12,
  HSK3_DECK_13,
  HSK3_DECK_14,
  EN_DECK_15,
  EN_DECK_16,
  EN_DECK_17,
  EN_DECK_18,
  EN_DECK_19,
  EN_DECK_20
];
