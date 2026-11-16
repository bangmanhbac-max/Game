import { LearningPackage } from '../types/learning_content';

export interface PredefinedDemoData {
  filename: string;
  rawText: string;
  package: LearningPackage;
}

export const DEMO_CHINESE_DATA: PredefinedDemoData = {
  filename: 'tieng_trung_hsk1_giao_tiep_demo.txt',
  rawText: `1. 你好 (nǐ hǎo) : Xin chào - Lời chào hỏi cơ bản nhất hàng ngày.
2. 谢谢 (xièxie) : Cảm ơn - Thể hiện sự biết ơn khi nhận được sự giúp đỡ.
3. 不客气 (bú kèqi) : Đừng khách sáo / Không có chi - Đáp lại lời cảm ơn.
4. 对不起 (duìbuqǐ) : Xin lỗi - Dùng khi mắc lỗi hoặc cần làm phiền ai đó.
5. 没关系 (méi guānxi) : Không sao đâu - Lời đáp khi người khác xin lỗi mình.
6. 再见 (zàijiàn) : Tạm biệt - Hẹn gặp lại lần sau.
7. 老师 (lǎoshī) : Thầy cô giáo - Người giảng dạy và truyền đạt kiến thức.
8. 朋友 (péngyou) : Bạn bè - Những người bạn thân thiết cùng lớp.
9. 学习 (xuéxí) : Học tập - Trau dồi kiến thức mới mỗi ngày.
10. 开心 (kāixīn) : Vui vẻ - Cảm giác hạnh phúc, yêu đời.
11. 苹果 (píngguǒ) : Quả táo - Loại hoa quả thơm ngọt quen thuộc.
12. 电脑 (diànnǎo) : Máy vi tính - Thiết bị công nghệ thông minh.`,
  package: {
    package_id: 'pkg_demo_chinese_hsk1',
    title: 'Tiếng Trung Giao Tiếp HSK 1 (Mẫu Tự Tạo Không Cần API)',
    source_filename: 'tieng_trung_hsk1_giao_tiep_demo.txt',
    created_at: new Date().toISOString(),
    vocabulary_deck: {
      id: 'deck_demo_zh_1',
      title: 'Từ Vựng Tiếng Trung HSK 1 Căn Bản',
      description: 'Được chuẩn hóa tự động: Đầy đủ chữ Hán, Pinyin, cử chỉ nét vẽ và gõ phím',
      target_language: 'zh-CN',
      items: [
        { id: 'zh-1', target_text: '你好', phonetic: 'nǐ hǎo', type_target: 'nihao', meaning: 'Xin chào', example: '你好！很高兴认识你。', difficulty: 1, stroke_gesture: 'horizontal', characters: ['你', '好'] },
        { id: 'zh-2', target_text: '谢谢', phonetic: 'xièxie', type_target: 'xiexie', meaning: 'Cảm ơn', example: '太谢谢你了！', difficulty: 1, stroke_gesture: 'vertical', characters: ['谢', '谢'] },
        { id: 'zh-3', target_text: '不客气', phonetic: 'bú kèqi', type_target: 'bukeqi', meaning: 'Đừng khách sáo / Không có chi', example: '不用谢，不客气！', difficulty: 1, stroke_gesture: 'slash', characters: ['不', '客', '气'] },
        { id: 'zh-4', target_text: '对不起', phonetic: 'duìbuqǐ', type_target: 'duibuqi', meaning: 'Xin lỗi', example: '对不起，我来晚了。', difficulty: 2, stroke_gesture: 'v_shape', characters: ['对', '不', '起'] },
        { id: 'zh-5', target_text: '没关系', phonetic: 'méi guānxi', type_target: 'meiguanxi', meaning: 'Không sao đâu', example: '没关系，别客气。', difficulty: 2, stroke_gesture: 'backslash', characters: ['没', '关', '系'] },
        { id: 'zh-6', target_text: '再见', phonetic: 'zàijiàn', type_target: 'zaijian', meaning: 'Tạm biệt', example: '明天见，再见！', difficulty: 1, stroke_gesture: 'caret', characters: ['再', '见'] },
        { id: 'zh-7', target_text: '老师', phonetic: 'lǎoshī', type_target: 'laoshi', meaning: 'Thầy cô giáo', example: '李老师好！', difficulty: 2, stroke_gesture: 'circle', characters: ['老', '师'] },
        { id: 'zh-8', target_text: '朋友', phonetic: 'péngyou', type_target: 'pengyou', meaning: 'Bạn bè', example: '他们是我的好朋友。', difficulty: 2, stroke_gesture: 'lightning', characters: ['朋', '友'] },
        { id: 'zh-9', target_text: '学习', phonetic: 'xuéxí', type_target: 'xuexi', meaning: 'Học tập', example: '努力学习汉语。', difficulty: 2, stroke_gesture: 'horizontal', characters: ['学', '习'] },
        { id: 'zh-10', target_text: '开心', phonetic: 'kāixīn', type_target: 'kaixin', meaning: 'Vui vẻ', example: '今天我很开心！', difficulty: 1, stroke_gesture: 'vertical', characters: ['开', '心'] },
        { id: 'zh-11', target_text: '苹果', phonetic: 'píngguǒ', type_target: 'pingguo', meaning: 'Quả táo', example: '这个苹果很甜。', difficulty: 2, stroke_gesture: 'circle', characters: ['苹', '果'] },
        { id: 'zh-12', target_text: '电脑', phonetic: 'diànnǎo', type_target: 'diannao', meaning: 'Máy vi tính', example: '我用电脑学习。', difficulty: 2, stroke_gesture: 'lightning', characters: ['电', '脑'] },
      ]
    },
    quiz_deck: {
      id: 'quiz_demo_zh_1',
      title: 'Đấu Trường Quiz Tiếng Trung HSK 1',
      description: 'Bộ câu hỏi trắc nghiệm phản xạ nghĩa chữ Hán và Pinyin',
      items: [
        {
          id: 'q-zh-1',
          question: "Từ '你好' (nǐ hǎo) có ý nghĩa giao tiếp là gì?",
          options: ['A. Tạm biệt', 'B. Xin chào', 'C. Cảm ơn', 'D. Không có chi'],
          correct_index: 1,
          explanation: "'你好' (nǐ hǎo) là câu chào hỏi phổ biến nhất trong tiếng Trung, có nghĩa là Xin chào.",
          points: 100
        },
        {
          id: 'q-zh-2',
          question: "Pinyin chuẩn xác của từ '谢谢' (Cảm ơn) là gì?",
          options: ['A. zàijiàn', 'B. bù kèqi', 'C. xièxie', 'D. duìbuqǐ'],
          correct_index: 2,
          explanation: "'谢谢' phát âm là xièxie (thanh 4 + thanh nhẹ), có nghĩa là cảm ơn.",
          points: 100
        },
        {
          id: 'q-zh-3',
          question: "Khi đối phương nói '对不起' (Xin lỗi), bạn nên đáp lại như thế nào?",
          options: ['A. 没关系 (méi guānxi)', 'B. 再见 (zàijiàn)', 'C. 老师 (lǎoshī)', 'D. 学习 (xuéxí)'],
          correct_index: 0,
          explanation: "'没关系' (méi guānxi) có nghĩa là 'Không sao đâu', dùng để đáp lại lời xin lỗi.",
          points: 100
        },
        {
          id: 'q-zh-4',
          question: "Từ '苹果' (píngguǒ) chỉ loại quả nào?",
          options: ['A. Quả chuối', 'B. Quả dưa hấu', 'C. Quả táo', 'D. Quả xoài'],
          correct_index: 2,
          explanation: "'苹果' (píngguǒ) có nghĩa là Quả táo.",
          points: 100
        },
        {
          id: 'q-zh-5',
          question: "Người truyền thụ tri thức cho học sinh là ai trong tiếng Trung?",
          options: ['A. 朋友 (péngyou)', 'B. 老师 (lǎoshī)', 'C. 苹果 (píngguǒ)', 'D. 电脑 (diànnǎo)'],
          correct_index: 1,
          explanation: "'老师' (lǎoshī) có nghĩa là Thầy giáo / Cô giáo.",
          points: 100
        }
      ]
    }
  }
};

export const DEMO_MESSY_DATA: PredefinedDemoData = {
  filename: 'file_dinh_chu_lon_xon_mau.txt',
  rawText: `=== TÀI LIỆU SCAN DÍNH CHÙM LỘN XỘN (TEST VLM) ===
1.你好(nǐhǎo):Xinchào-Lờichàohỏicơbảnhàngngày.
2.谢谢(xièxie):Cảmơn-Biếtơnkhiđượcngườikhácgiúpđỡ.
3.不客气(búkèqi):Đừngkháchsáo-Khôngcóchi-Đápnhẹnhàng.
4.对不起(duìbuqǐ):Xinlỗi-Thànhthậtkhibảnthânmắclỗi.
5.没关系(méiguānxi):Khôngsaocả-Đápkhingườikhácxinlỗi.
6.再见(zàijiàn):Tạmbiệt-Hẹngặplạilầnsau.
7.老师(lǎoshī):Thầycôgiáo-Ngườitruyềnthụtrivàkiếnthức.
8.电脑(diànnǎo):Máyvitính-Thiếtbịcôngnghệthôngminh.
9.手机(shǒujī):Điệnthoạidiđộng-Phươngtiệnliênlạctiệndụng.
10.开心(kāixīn):Vuivẻ-Tâmtrạnghạnhphúcyêuđời.
Algorithm(/ˈæl.ɡə.rɪ.ðəm/):Thuậttoángiảiquyếtbàitoán
Database(/ˈdeɪ.tə.beɪs/):Cơsởdữliệulưutrữhệthống`,
  package: {
    package_id: 'pkg_demo_messy_disentangled',
    title: 'VLM Phân Tách Dính Chữ (Mẫu Tự Tạo Không Cần API)',
    source_filename: 'file_dinh_chu_lon_xon_mau.txt',
    created_at: new Date().toISOString(),
    vocabulary_deck: {
      id: 'deck_demo_messy_1',
      title: 'Bộ Từ Vựng Đã Khử Nhiễu & Tách Dính Chữ',
      description: 'Mô hình VLM tự động nhận diện từ vựng ghép, tách dính chữ và gán cử chỉ',
      target_language: 'multilingual',
      items: [
        { id: 'm-1', target_text: '你好', phonetic: 'nǐ hǎo', type_target: 'nihao', meaning: 'Xin chào', difficulty: 1, stroke_gesture: 'horizontal', characters: ['你', '好'] },
        { id: 'm-2', target_text: '谢谢', phonetic: 'xièxie', type_target: 'xiexie', meaning: 'Cảm ơn', difficulty: 1, stroke_gesture: 'vertical', characters: ['谢', '谢'] },
        { id: 'm-3', target_text: '不客气', phonetic: 'bú kèqi', type_target: 'bukeqi', meaning: 'Đừng khách sáo / Không có chi', difficulty: 1, stroke_gesture: 'slash', characters: ['不', '客', '气'] },
        { id: 'm-4', target_text: '对不起', phonetic: 'duìbuqǐ', type_target: 'duibuqi', meaning: 'Xin lỗi', difficulty: 2, stroke_gesture: 'v_shape', characters: ['对', '不', '起'] },
        { id: 'm-5', target_text: '没关系', phonetic: 'méi guānxi', type_target: 'meiguanxi', meaning: 'Không sao cả', difficulty: 2, stroke_gesture: 'backslash', characters: ['没', '关', '系'] },
        { id: 'm-6', target_text: '再见', phonetic: 'zàijiàn', type_target: 'zaijian', meaning: 'Tạm biệt', difficulty: 1, stroke_gesture: 'caret', characters: ['再', '见'] },
        { id: 'm-7', target_text: '老师', phonetic: 'lǎoshī', type_target: 'laoshi', meaning: 'Thầy cô giáo', difficulty: 2, stroke_gesture: 'circle', characters: ['老', '师'] },
        { id: 'm-8', target_text: '电脑', phonetic: 'diànnǎo', type_target: 'diannao', meaning: 'Máy vi tính', difficulty: 2, stroke_gesture: 'lightning', characters: ['电', '脑'] },
        { id: 'm-9', target_text: 'Algorithm', phonetic: '/ˈæl.ɡə.rɪ.ðəm/', type_target: 'algorithm', meaning: 'Thuật toán giải quyết bài toán', difficulty: 2, stroke_gesture: 'horizontal' },
        { id: 'm-10', target_text: 'Database', phonetic: '/ˈdeɪ.tə.beɪs/', type_target: 'database', meaning: 'Cơ sở dữ liệu lưu trữ hệ thống', difficulty: 2, stroke_gesture: 'vertical' },
      ]
    },
    quiz_deck: {
      id: 'quiz_demo_messy_1',
      title: 'Đấu Trường Quiz Khử Nhiễu Văn Bản',
      description: 'Câu hỏi trắc nghiệm kiểm tra độ hiểu sau khi giải mã dính chữ',
      items: [
        {
          id: 'q-m-1',
          question: "Đoạn văn dính chữ '1.你好(nǐhǎo):Xinchào' đã được tách ra từ vựng nào?",
          options: ['A. 你好 (nǐ hǎo) - Xin chào', 'B. 谢谢 (xièxie) - Cảm ơn', 'C. 电脑 (diànnǎo) - Máy tính', 'D. 再见 (zàijiàn) - Tạm biệt'],
          correct_index: 0,
          explanation: "VLM đã phân tách chính xác từ '你好' và nghĩa 'Xin chào'.",
          points: 100
        },
        {
          id: 'q-m-2',
          question: "Ý nghĩa của thuật ngữ 'Algorithm' sau khi khử nhiễu là gì?",
          options: ['A. Máy tính điện tử', 'B. Thuật toán giải quyết bài toán', 'C. Mạng nơ-ron học máy', 'D. Giao thức mạng'],
          correct_index: 1,
          explanation: "'Algorithm' có nghĩa là Thuật toán giải quyết bài toán.",
          points: 100
        }
      ]
    }
  }
};

export const DEMO_ENGLISH_DATA: PredefinedDemoData = {
  filename: 'tu_vung_tieng_anh_ai_tech.txt',
  rawText: `1. Algorithm (/ˈæl.ɡə.rɪ.ðəm/) : Thuật toán - Tập hợp chỉ dẫn từng bước giải quyết bài toán.
2. Machine Learning (/məˈʃiːn ˈlɜːnɪŋ/) : Học máy - Khả năng máy tính tự học từ dữ liệu.
3. Neural Network (/ˈnjʊə.rəl ˈnet.wɜːk/) : Mạng nơ-ron - Mô hình phỏng sinh học não bộ.
4. Database (/ˈdeɪ.tə.beɪs/) : Cơ sở dữ liệu - Hệ thống lưu trữ và truy xuất dữ liệu có cấu trúc.
5. Encryption (/ɪnˈkrɪp.ʃən/) : Mã hóa - Kỹ thuật bảo mật dữ liệu khỏi truy cập trái phép.
6. Cloud Computing (/klaʊd kəmˈpjuːtɪŋ/) : Điện toán đám mây - Cung cấp tài nguyên máy chủ qua Internet.
7. Computer Vision (/kəmˈpjuːtər ˈvɪʒn/) : Thị giác máy tính - AI nhận diện và xử lý hình ảnh.
8. Latency (/ˈleɪ.tən.si/) : Độ trễ - Khoảng thời gian truyền tải gói tin qua mạng.
9. Cache (/kæʃ/) : Bộ nhớ đệm - Vùng lưu trữ tốc độ cao cho dữ liệu truy cập thường xuyên.
10. Framework (/ˈfreɪm.wɜːk/) : Khung phần mềm - Cấu trúc nền tảng phát triển ứng dụng.`,
  package: {
    package_id: 'pkg_demo_english_ai',
    title: 'English for AI & Technology (Mẫu Tự Tạo Không Cần API)',
    source_filename: 'tu_vung_tieng_anh_ai_tech.txt',
    created_at: new Date().toISOString(),
    vocabulary_deck: {
      id: 'deck_demo_en_1',
      title: 'Từ Vựng Tiếng Anh AI & Công Nghệ',
      description: 'Thuật ngữ cốt lõi ngành Khoa học Máy tính và Trí tuệ Nhân tạo',
      target_language: 'en',
      items: [
        { id: 'en-1', target_text: 'Algorithm', phonetic: '/ˈæl.ɡə.rɪ.ðəm/', type_target: 'algorithm', meaning: 'Thuật toán', example: 'Binary search is an efficient algorithm.', difficulty: 1, stroke_gesture: 'horizontal' },
        { id: 'en-2', target_text: 'Machine Learning', phonetic: '/məˈʃiːn ˈlɜːnɪŋ/', type_target: 'machinelearning', meaning: 'Học máy', example: 'Machine Learning powers recommendation engines.', difficulty: 2, stroke_gesture: 'vertical' },
        { id: 'en-3', target_text: 'Neural Network', phonetic: '/ˈnjʊə.rəl ˈnet.wɜːk/', type_target: 'neuralnetwork', meaning: 'Mạng nơ-ron', example: 'Deep neural networks excel at image recognition.', difficulty: 2, stroke_gesture: 'v_shape' },
        { id: 'en-4', target_text: 'Database', phonetic: '/ˈdeɪ.tə.beɪs/', type_target: 'database', meaning: 'Cơ sở dữ liệu', example: 'PostgreSQL is an open-source database.', difficulty: 1, stroke_gesture: 'slash' },
        { id: 'en-5', target_text: 'Encryption', phonetic: '/ɪnˈkrɪp.ʃən/', type_target: 'encryption', meaning: 'Mã hóa bảo mật', example: 'End-to-end encryption protects user privacy.', difficulty: 2, stroke_gesture: 'backslash' },
        { id: 'en-6', target_text: 'Cloud Computing', phonetic: '/klaʊd kəmˈpjuːtɪŋ/', type_target: 'cloudcomputing', meaning: 'Điện toán đám mây', example: 'Deploying servers using cloud computing.', difficulty: 2, stroke_gesture: 'caret' },
        { id: 'en-7', target_text: 'Computer Vision', phonetic: '/kəmˈpjuːtər ˈvɪʒn/', type_target: 'computervision', meaning: 'Thị giác máy tính', example: 'Autonomous vehicles rely heavily on computer vision.', difficulty: 2, stroke_gesture: 'circle' },
        { id: 'en-8', target_text: 'Latency', phonetic: '/ˈleɪ.tən.si/', type_target: 'latency', meaning: 'Độ trễ mạng', example: 'Low latency is crucial for real-time multiplayer games.', difficulty: 1, stroke_gesture: 'lightning' },
        { id: 'en-9', target_text: 'Cache', phonetic: '/kæʃ/', type_target: 'cache', meaning: 'Bộ nhớ đệm', example: 'Redis is widely used as an in-memory cache.', difficulty: 1, stroke_gesture: 'horizontal' },
        { id: 'en-10', target_text: 'Framework', phonetic: '/ˈfreɪm.wɜːk/', type_target: 'framework', meaning: 'Khung phần mềm', example: 'React is a popular UI framework.', difficulty: 2, stroke_gesture: 'vertical' },
      ]
    },
    quiz_deck: {
      id: 'quiz_demo_en_1',
      title: 'Đấu Trường Quiz Công Nghệ & AI',
      description: 'Thử thách trắc nghiệm phản xạ thuật ngữ công nghệ',
      items: [
        {
          id: 'q-en-1',
          question: "Thuật ngữ nào chỉ 'Tập hợp các chỉ dẫn từng bước để giải quyết bài toán'?",
          options: ['A. Algorithm', 'B. Database', 'C. Cache', 'D. Latency'],
          correct_index: 0,
          explanation: "'Algorithm' (Thuật toán) là chuỗi các bước có logic rõ ràng để giải quyết vấn đề.",
          points: 100
        },
        {
          id: 'q-en-2',
          question: "Công nghệ nào cho phép máy tính 'nhìn và hiểu' các bức ảnh kỹ thuật số?",
          options: ['A. Encryption', 'B. Computer Vision', 'C. Database', 'D. Framework'],
          correct_index: 1,
          explanation: "'Computer Vision' (Thị giác máy tính) là nhánh AI nghiên cứu cách nhận diện hình ảnh/video.",
          points: 100
        },
        {
          id: 'q-en-3',
          question: "Bộ phận lưu trữ dữ liệu tạm thời với tốc độ cao gọi là gì?",
          options: ['A. Latency', 'B. Algorithm', 'C. Cache', 'D. Neural Network'],
          correct_index: 2,
          explanation: "'Cache' (Bộ nhớ đệm) lưu tạm dữ liệu để truy xuất tức thì mà không cần đọc lại đĩa cứng.",
          points: 100
        }
      ]
    }
  }
};
