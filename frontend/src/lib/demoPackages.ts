import { LearningPackage } from '../types/learning_content';

export interface PredefinedDemoData {
  filename: string;
  rawText: string;
  package: LearningPackage;
}

export const DEMO_CHINESE_DATA: PredefinedDemoData = {
  filename: 'mandarin_hsk1_communication_demo.txt',
  rawText: `1. 你好 (nǐ hǎo) : Hello - The most fundamental daily greeting.
2. 谢谢 (xièxie) : Thank you - Expressing gratitude when receiving assistance.
3. 不客气 (bú kèqi) : You're welcome - Polite response to thanks.
4. 对不起 (duìbuqǐ) : Sorry - Used when apologizing or needing to excuse oneself.
5. 没关系 (méi guānxi) : No problem / It's okay - Response when someone apologizes.
6. 再见 (zàijiàn) : Goodbye - See you again next time.
7. 老师 (lǎoshī) : Teacher - Educator who guides and shares knowledge.
8. 朋友 (péngyou) : Friend - Close companion or classmate.
9. 学习 (xuéxí) : Study / Learn - Acquiring and practicing new knowledge.
10. 开心 (kāixīn) : Happy - Joyful and cheerful state of mind.
11. 苹果 (píngguǒ) : Apple - Sweet and popular fruit.
12. 电脑 (diànnǎo) : Computer - Intelligent digital computing device.`,
  package: {
    package_id: 'pkg_demo_chinese_hsk1',
    title: 'Mandarin Conversation HSK 1 (Offline Demo)',
    source_filename: 'mandarin_hsk1_communication_demo.txt',
    created_at: new Date().toISOString(),
    vocabulary_deck: {
      id: 'deck_demo_zh_1',
      title: 'Mandarin Vocabulary HSK 1 Core',
      description: 'Auto-normalized: Hanzi, Pinyin, stroke gestures, and keyboard typing',
      target_language: 'zh-CN',
      items: [
        { id: 'zh-1', target_text: '你好', phonetic: 'nǐ hǎo', type_target: 'nihao', meaning: 'Hello', example: '你好！很高兴认识你。', difficulty: 1, stroke_gesture: 'horizontal', characters: ['你', '好'] },
        { id: 'zh-2', target_text: '谢谢', phonetic: 'xièxie', type_target: 'xiexie', meaning: 'Thank you', example: '太谢谢你了！', difficulty: 1, stroke_gesture: 'vertical', characters: ['谢', '谢'] },
        { id: 'zh-3', target_text: '不客气', phonetic: 'bú kèqi', type_target: 'bukeqi', meaning: "You're welcome", example: '不用谢，不客气！', difficulty: 1, stroke_gesture: 'slash', characters: ['不', '客', '气'] },
        { id: 'zh-4', target_text: '对不起', phonetic: 'duìbuqǐ', type_target: 'duibuqi', meaning: 'Sorry', example: '对不起，我来晚了。', difficulty: 2, stroke_gesture: 'v_shape', characters: ['对', '不', '起'] },
        { id: 'zh-5', target_text: '没关系', phonetic: 'méi guānxi', type_target: 'meiguanxi', meaning: 'No problem / It is okay', example: '没关系，别客气。', difficulty: 2, stroke_gesture: 'backslash', characters: ['没', '关', '系'] },
        { id: 'zh-6', target_text: '再见', phonetic: 'zàijiàn', type_target: 'zaijian', meaning: 'Goodbye', example: '明天见，再见！', difficulty: 1, stroke_gesture: 'caret', characters: ['再', '见'] },
        { id: 'zh-7', target_text: '老师', phonetic: 'lǎoshī', type_target: 'laoshi', meaning: 'Teacher', example: '李老师好！', difficulty: 2, stroke_gesture: 'circle', characters: ['老', '师'] },
        { id: 'zh-8', target_text: '朋友', phonetic: 'péngyou', type_target: 'pengyou', meaning: 'Friend', example: '他们是我的好朋友。', difficulty: 2, stroke_gesture: 'lightning', characters: ['朋', '友'] },
        { id: 'zh-9', target_text: '学习', phonetic: 'xuéxí', type_target: 'xuexi', meaning: 'Study / Learn', example: '努力学习汉语。', difficulty: 2, stroke_gesture: 'horizontal', characters: ['学', '习'] },
        { id: 'zh-10', target_text: '开心', phonetic: 'kāixīn', type_target: 'kaixin', meaning: 'Happy', example: '今天我很开心！', difficulty: 1, stroke_gesture: 'vertical', characters: ['开', '心'] },
        { id: 'zh-11', target_text: '苹果', phonetic: 'píngguǒ', type_target: 'pingguo', meaning: 'Apple', example: '这个苹果很甜。', difficulty: 2, stroke_gesture: 'circle', characters: ['苹', '果'] },
        { id: 'zh-12', target_text: '电脑', phonetic: 'diànnǎo', type_target: 'diannao', meaning: 'Computer', example: '我用电脑学习。', difficulty: 2, stroke_gesture: 'lightning', characters: ['电', '脑'] },
      ]
    },
    quiz_deck: {
      id: 'quiz_demo_zh_1',
      title: 'Mandarin HSK 1 Speed Quiz',
      description: 'Reflex questions on Hanzi meanings and Pinyin',
      items: [
        {
          id: 'q-zh-1',
          question: "What does '你好' (nǐ hǎo) mean in conversation?",
          options: ['A. Goodbye', 'B. Hello', 'C. Thank you', 'D. You are welcome'],
          correct_index: 1,
          explanation: "'你好' (nǐ hǎo) is the most standard greeting in Mandarin, meaning Hello.",
          points: 100
        },
        {
          id: 'q-zh-2',
          question: "What is the correct Pinyin for '谢谢' (Thank you)?",
          options: ['A. zàijiàn', 'B. bù kèqi', 'C. xièxie', 'D. duìbuqǐ'],
          correct_index: 2,
          explanation: "'谢谢' is pronounced xièxie (4th tone + neutral tone), meaning thank you.",
          points: 100
        },
        {
          id: 'q-zh-3',
          question: "When someone says '对不起' (Sorry), how should you reply?",
          options: ['A. 没关系 (méi guānxi)', 'B. 再见 (zàijiàn)', 'C. 老师 (lǎoshī)', 'D. 学习 (xuéxí)'],
          correct_index: 0,
          explanation: "'没关系' (méi guānxi) means 'No problem / That is okay', used in response to apologies.",
          points: 100
        },
        {
          id: 'q-zh-4',
          question: "Which fruit does '苹果' (píngguǒ) refer to?",
          options: ['A. Banana', 'B. Watermelon', 'C. Apple', 'D. Mango'],
          correct_index: 2,
          explanation: "'苹果' (píngguǒ) translates to Apple.",
          points: 100
        },
        {
          id: 'q-zh-5',
          question: "Which term refers to an educator/teacher in Mandarin?",
          options: ['A. 朋友 (péngyou)', 'B. 老师 (lǎoshī)', 'C. 苹果 (píngguǒ)', 'D. 电脑 (diànnǎo)'],
          correct_index: 1,
          explanation: "'老师' (lǎoshī) means Teacher or Instructor.",
          points: 100
        }
      ]
    }
  }
};

export const DEMO_MESSY_DATA: PredefinedDemoData = {
  filename: 'ocr_dense_merged_text_sample.txt',
  rawText: `=== UNSTRUCTURED SCAN DOCUMENT (VLM TEST) ===
1.你好(nǐhǎo):Hello-Dailygreeting.
2.谢谢(xièxie):Thankyou-Expressinggratitude.
3.不客气(búkèqi):Yourewelcome-Politeresponse.
4.对不起(duìbuqǐ):Sorry-Apology.
5.没关系(méiguānxi):Noproblem-Acceptingapology.
6.再见(zàijiàn):Goodbye-Farewell.
7.老师(lǎoshī):Teacher-Educator.
8.电脑(diànnǎo):Computer-Smartdevice.
9.手机(shǒujī):Smartphone-Mobilecommunication.
10.开心(kāixīn):Happy-Joyfulmood.
Algorithm(/ˈæl.ɡə.rɪ.ðəm/):Stepbystepcomputationalprocedure
Database(/ˈdeɪ.tə.beɪs/):Structuredinformationstorage`,
  package: {
    package_id: 'pkg_demo_messy_disentangled',
    title: 'VLM OCR Disentanglement (Offline Demo)',
    source_filename: 'ocr_dense_merged_text_sample.txt',
    created_at: new Date().toISOString(),
    vocabulary_deck: {
      id: 'deck_demo_messy_1',
      title: 'Disentangled & Denoised Vocabulary Deck',
      description: 'VLM model automatically recognized merged tokens, separated words, and assigned gestures',
      target_language: 'multilingual',
      items: [
        { id: 'm-1', target_text: '你好', phonetic: 'nǐ hǎo', type_target: 'nihao', meaning: 'Hello', difficulty: 1, stroke_gesture: 'horizontal', characters: ['你', '好'] },
        { id: 'm-2', target_text: '谢谢', phonetic: 'xièxie', type_target: 'xiexie', meaning: 'Thank you', difficulty: 1, stroke_gesture: 'vertical', characters: ['谢', '谢'] },
        { id: 'm-3', target_text: '不客气', phonetic: 'bú kèqi', type_target: 'bukeqi', meaning: "You're welcome", difficulty: 1, stroke_gesture: 'slash', characters: ['不', '客', '气'] },
        { id: 'm-4', target_text: '对不起', phonetic: 'duìbuqǐ', type_target: 'duibuqi', meaning: 'Sorry', difficulty: 2, stroke_gesture: 'v_shape', characters: ['对', '不', '起'] },
        { id: 'm-5', target_text: '没关系', phonetic: 'méi guānxi', type_target: 'meiguanxi', meaning: 'No problem / It is okay', difficulty: 2, stroke_gesture: 'backslash', characters: ['没', '关', '系'] },
        { id: 'm-6', target_text: '再见', phonetic: 'zàijiàn', type_target: 'zaijian', meaning: 'Goodbye', difficulty: 1, stroke_gesture: 'caret', characters: ['再', '见'] },
        { id: 'm-7', target_text: '老师', phonetic: 'lǎoshī', type_target: 'laoshi', meaning: 'Teacher', difficulty: 2, stroke_gesture: 'circle', characters: ['老', '师'] },
        { id: 'm-8', target_text: '电脑', phonetic: 'diànnǎo', type_target: 'diannao', meaning: 'Computer', difficulty: 2, stroke_gesture: 'lightning', characters: ['电', '脑'] },
        { id: 'm-9', target_text: 'Algorithm', phonetic: '/ˈæl.ɡə.rɪ.ðəm/', type_target: 'algorithm', meaning: 'Computational algorithm procedure', difficulty: 2, stroke_gesture: 'horizontal' },
        { id: 'm-10', target_text: 'Database', phonetic: '/ˈdeɪ.tə.beɪs/', type_target: 'database', meaning: 'Structured database system', difficulty: 2, stroke_gesture: 'vertical' },
      ]
    },
    quiz_deck: {
      id: 'quiz_demo_messy_1',
      title: 'OCR Disentanglement Speed Quiz',
      description: 'Reflex questions testing comprehension after decoding merged text',
      items: [
        {
          id: 'q-m-1',
          question: "Which vocabulary pair was extracted from merged string '1.你好(nǐhǎo):Hello'?",
          options: ['A. 你好 (nǐ hǎo) - Hello', 'B. 谢谢 (xièxie) - Thank you', 'C. 电脑 (diànnǎo) - Computer', 'D. 再见 (zàijiàn) - Goodbye'],
          correct_index: 0,
          explanation: "VLM accurately separated '你好' and its meaning 'Hello'.",
          points: 100
        },
        {
          id: 'q-m-2',
          question: "What is the meaning of the technical term 'Algorithm' after denoising?",
          options: ['A. Electronic calculator', 'B. Computational problem-solving procedure', 'C. Neural network architecture', 'D. Internet network protocol'],
          correct_index: 1,
          explanation: "'Algorithm' refers to a finite sequence of rigorous instructions to solve a problem.",
          points: 100
        }
      ]
    }
  }
};

export const DEMO_ENGLISH_DATA: PredefinedDemoData = {
  filename: 'ai_tech_english_vocabulary.txt',
  rawText: `1. Algorithm (/ˈæl.ɡə.rɪ.ðəm/) : Algorithm - Step-by-step instructions to solve a computational problem.
2. Machine Learning (/məˈʃiːn ˈlɜːnɪŋ/) : Machine Learning - Ability of computers to learn patterns from data.
3. Neural Network (/ˈnjʊə.rəl ˈnet.wɜːk/) : Neural Network - Computational architecture inspired by human brain.
4. Database (/ˈdeɪ.tə.beɪs/) : Database - Structured data collection and retrieval system.
5. Encryption (/ɪnˈkrɪp.ʃən/) : Encryption - Mathematical protection against unauthorized access.
6. Cloud Computing (/klaʊd kəmˈpjuːtɪŋ/) : Cloud Computing - On-demand server resources delivered over the Internet.
7. Computer Vision (/kəmˈpjuːtər ˈvɪʒn/) : Computer Vision - AI capability to interpret and process visual imagery.
8. Latency (/ˈleɪ.tən.si/) : Latency - Network packet transit delay.
9. Cache (/kæʃ/) : Cache - High-speed temporary memory for frequent access.
10. Framework (/ˈfreɪm.wɜːk/) : Framework - Foundational platform for software development.`,
  package: {
    package_id: 'pkg_demo_english_ai',
    title: 'English for AI & Technology (Offline Demo)',
    source_filename: 'ai_tech_english_vocabulary.txt',
    created_at: new Date().toISOString(),
    vocabulary_deck: {
      id: 'deck_demo_en_1',
      title: 'AI & Technology Vocabulary Deck',
      description: 'Core computer science and artificial intelligence terminology',
      target_language: 'en',
      items: [
        { id: 'en-1', target_text: 'Algorithm', phonetic: '/ˈæl.ɡə.rɪ.ðəm/', type_target: 'algorithm', meaning: 'Algorithm procedure', example: 'Binary search is an efficient algorithm.', difficulty: 1, stroke_gesture: 'horizontal' },
        { id: 'en-2', target_text: 'Machine Learning', phonetic: '/məˈʃiːn ˈlɜːnɪŋ/', type_target: 'machinelearning', meaning: 'Machine Learning', example: 'Machine Learning powers recommendation engines.', difficulty: 2, stroke_gesture: 'vertical' },
        { id: 'en-3', target_text: 'Neural Network', phonetic: '/ˈnjʊə.rəl ˈnet.wɜːk/', type_target: 'neuralnetwork', meaning: 'Neural Network model', example: 'Deep neural networks excel at image recognition.', difficulty: 2, stroke_gesture: 'v_shape' },
        { id: 'en-4', target_text: 'Database', phonetic: '/ˈdeɪ.tə.beɪs/', type_target: 'database', meaning: 'Structured Database', example: 'PostgreSQL is an open-source database.', difficulty: 1, stroke_gesture: 'slash' },
        { id: 'en-5', target_text: 'Encryption', phonetic: '/ɪnˈkrɪp.ʃən/', type_target: 'encryption', meaning: 'Security Encryption', example: 'End-to-end encryption protects user privacy.', difficulty: 2, stroke_gesture: 'backslash' },
        { id: 'en-6', target_text: 'Cloud Computing', phonetic: '/klaʊd kəmˈpjuːtɪŋ/', type_target: 'cloudcomputing', meaning: 'Cloud Computing', example: 'Deploying servers using cloud computing.', difficulty: 2, stroke_gesture: 'caret' },
        { id: 'en-7', target_text: 'Computer Vision', phonetic: '/kəmˈpjuːtər ˈvɪʒn/', type_target: 'computervision', meaning: 'Computer Vision', example: 'Autonomous vehicles rely heavily on computer vision.', difficulty: 2, stroke_gesture: 'circle' },
        { id: 'en-8', target_text: 'Latency', phonetic: '/ˈleɪ.tən.si/', type_target: 'latency', meaning: 'Network Latency', example: 'Low latency is crucial for real-time multiplayer games.', difficulty: 1, stroke_gesture: 'lightning' },
        { id: 'en-9', target_text: 'Cache', phonetic: '/kæʃ/', type_target: 'cache', meaning: 'High-speed Cache', example: 'Redis is widely used as an in-memory cache.', difficulty: 1, stroke_gesture: 'horizontal' },
        { id: 'en-10', target_text: 'Framework', phonetic: '/ˈfreɪm.wɜːk/', type_target: 'framework', meaning: 'Software Framework', example: 'React is a popular UI framework.', difficulty: 2, stroke_gesture: 'vertical' },
      ]
    },
    quiz_deck: {
      id: 'quiz_demo_en_1',
      title: 'AI & Technology Speed Quiz',
      description: 'Fast-reflex questions on technical terminology',
      items: [
        {
          id: 'q-en-1',
          question: "Which term refers to 'A step-by-step set of instructions to solve a problem'?",
          options: ['A. Algorithm', 'B. Database', 'C. Cache', 'D. Latency'],
          correct_index: 0,
          explanation: "'Algorithm' is a logical sequence of steps designed to solve a specific problem.",
          points: 100
        },
        {
          id: 'q-en-2',
          question: "Which field allows computers to interpret and understand digital visual inputs?",
          options: ['A. Encryption', 'B. Computer Vision', 'C. Database', 'D. Framework'],
          correct_index: 1,
          explanation: "'Computer Vision' is the AI domain focused on processing images and videos.",
          points: 100
        },
        {
          id: 'q-en-3',
          question: "What is a high-speed temporary storage layer used for rapid data retrieval?",
          options: ['A. Latency', 'B. Algorithm', 'C. Cache', 'D. Neural Network'],
          correct_index: 2,
          explanation: "'Cache' temporarily stores frequently accessed data for near-instant retrieval.",
          points: 100
        }
      ]
    }
  }
};
