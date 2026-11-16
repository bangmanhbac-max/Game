import { LearningPackage, StrokeGestureType, VocabularyItem, QuizItem } from '../types/learning_content';

const GESTURES: StrokeGestureType[] = [
  'horizontal', 'vertical', 'slash', 'backslash', 'v_shape', 'caret', 'circle', 'lightning'
];

interface RawItem {
  w: string;   // target_text
  p: string;   // phonetic (Pinyin hoặc IPA)
  m: string;   // meaning
  c?: string[]; // characters (cho chữ Hán)
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
      description: `${desc} • Chủ đề: ${category}`,
      target_language: lang,
      items
    },
    quiz_deck: {
      id: `quiz_${id}`,
      title: `Đấu Trường Quiz: ${title}`,
      description: `Thử thách trắc nghiệm phản xạ bộ từ ${title}`,
      items: quizItems
    }
  };
}

// ==========================================
// 🇨🇳 LỘ TRÌNH TIẾNG TRUNG HSK 1 (6 BÀI)
// ==========================================

export const HSK1_DECK_1 = buildDeck(
  'hsk1_b1_chao_hoi',
  'HSK 1 - Bài 1: Chào Hỏi & Đại Từ Nhân Xưng',
  'Tiếng Trung HSK 1',
  'zh-CN',
  'Các từ vựng chào hỏi căn bản và đại từ xưng hô thông dụng nhất',
  [
    { w: '你', p: 'nǐ', m: 'Bạn, anh, chị (ngôi thứ 2)' },
    { w: '我', p: 'wǒ', m: 'Tôi, mình, em (ngôi thứ 1)' },
    { w: '他', p: 'tā', m: 'Anh ấy, cậu ấy (ngôi thứ 3 nam)' },
    { w: '她', p: 'tā', m: 'Cô ấy, chị ấy (ngôi thứ 3 nữ)' },
    { w: '我们', p: 'wǒmen', m: 'Chúng tôi, chúng ta' },
    { w: '你们', p: 'nǐmen', m: 'Các bạn, các anh chị' },
    { w: '他们', p: 'tāmen', m: 'Họ, bọn họ' },
    { w: '您', p: 'nín', m: 'Ngài, bác (xưng hô tôn kính)' },
    { w: '你好', p: 'nǐ hǎo', m: 'Xin chào' },
    { w: '再见', p: 'zàijiàn', m: 'Tạm biệt, hẹn gặp lại' },
    { w: '谢谢', p: 'xièxie', m: 'Cảm ơn' },
    { w: '不客气', p: 'bú kèqi', m: 'Đừng khách sáo, không có chi' },
    { w: '对不起', p: 'duìbuqǐ', m: 'Xin lỗi' },
    { w: '没关系', p: 'méi guānxi', m: 'Không sao đâu' },
    { w: '是', p: 'shì', m: 'Là, đúng' },
    { w: '不是', p: 'bú shì', m: 'Không phải' },
    { w: '好', p: 'hǎo', m: 'Tốt, đẹp, hay' },
    { w: '很高兴', p: 'hěn gāoxìng', m: 'Rất vui mừng' },
    { w: '叫', p: 'jiào', m: 'Kêu, gọi là, tên là' },
    { w: '名字', p: 'míngzi', m: 'Tên gọi' }
  ],
  [
    { q: "Từ '你好' (nǐ hǎo) có nghĩa là gì?", opts: ['A. Tạm biệt', 'B. Xin chào', 'C. Cảm ơn', 'D. Xin lỗi'], a: 1, exp: "'你好' là lời chào hỏi cơ bản nhất." },
    { q: "Khi người khác nói '对不起' (duìbuqǐ), bạn đáp lại là:", opts: ['A. 没关系 (méi guānxi)', 'B. 谢谢 (xièxie)', 'C. 再见 (zàijiàn)', 'D. 不好 (bù hǎo)'], a: 0, exp: "'没关系' nghĩa là Không sao đâu." },
    { q: "Đại từ nhân xưng '我们' (wǒmen) nghĩa là gì?", opts: ['A. Các bạn', 'B. Bọn họ', 'C. Chúng tôi / Chúng ta', 'D. Anh ấy'], a: 2, exp: "'我们' chỉ ngôi thứ nhất số nhiều." }
  ]
);

export const HSK1_DECK_2 = buildDeck(
  'hsk1_b2_gia_dinh',
  'HSK 1 - Bài 2: Gia Đình & Mối Quan Hệ',
  'Tiếng Trung HSK 1',
  'zh-CN',
  'Từ vựng các thành viên gia đình và các mối quan hệ xã hội quen thuộc',
  [
    { w: '爸爸', p: 'bàba', m: 'Bố, cha' },
    { w: '妈妈', p: 'māma', m: 'Mẹ, má' },
    { w: '哥哥', p: 'gēge', m: 'Anh trai' },
    { w: '姐姐', p: 'jiějie', m: 'Chị gái' },
    { w: '弟弟', p: 'dìdi', m: 'Em trai' },
    { w: '妹妹', p: 'mèimei', m: 'Em gái' },
    { w: '儿子', p: 'érzi', m: 'Con trai' },
    { w: '女儿', p: 'nǚ\'ér', m: 'Con gái' },
    { w: '朋友', p: 'péngyou', m: 'Bạn bè' },
    { w: '老师', p: 'lǎoshī', m: 'Thầy giáo, cô giáo' },
    { w: '学生', p: 'xuésheng', m: 'Học sinh, sinh viên' },
    { w: '同学', p: 'tóngxué', m: 'Bạn học cùng lớp' },
    { w: '家', p: 'jiā', m: 'Nhà, gia đình' },
    { w: '人', p: 'rén', m: 'Người' },
    { w: '爱', p: 'ài', m: 'Yêu thương' },
    { w: '喜欢', p: 'xǐhuan', m: 'Thích, yêu thích' },
    { w: '认识', p: 'rènshi', m: 'Quen biết, nhận biết' },
    { w: '有', p: 'yǒu', m: 'Có' },
    { w: '没有', p: 'méiyǒu', m: 'Không có' },
    { w: '和', p: 'hé', m: 'Và, cùng với' }
  ],
  [
    { q: "Từ nào chỉ 'Mẹ' trong tiếng Trung?", opts: ['A. 爸爸', 'B. 妈妈', 'C. 姐姐', 'D. 妹妹'], a: 1, exp: "'妈妈' (māma) là Mẹ." },
    { q: "Người dạy học trong lớp gọi là gì?", opts: ['A. 学生', 'B. 同学', 'C. 老师', 'D. 朋友'], a: 2, exp: "'老师' (lǎoshī) là Thầy cô giáo." }
  ]
);

export const HSK1_DECK_3 = buildDeck(
  'hsk1_b3_so_dem_thoi_gian',
  'HSK 1 - Bài 3: Số Đếm, Thời Gian & Ngày Tháng',
  'Tiếng Trung HSK 1',
  'zh-CN',
  'Bảng số đếm cơ bản và các mốc thời gian ngày, tháng, năm',
  [
    { w: '一', p: 'yī', m: 'Số một (1)' },
    { w: '二', p: 'èr', m: 'Số hai (2)' },
    { w: '三', p: 'sān', m: 'Số ba (3)' },
    { w: '四', p: 'sì', m: 'Số bốn (4)' },
    { w: '五', p: 'wǔ', m: 'Số năm (5)' },
    { w: '六', p: 'liù', m: 'Số sáu (6)' },
    { w: '七', p: 'qī', m: 'Số bảy (7)' },
    { w: '八', p: 'bā', m: 'Số tám (8)' },
    { w: '九', p: 'jiǔ', m: 'Số chín (9)' },
    { w: '十', p: 'shí', m: 'Số mười (10)' },
    { w: '零', p: 'líng', m: 'Số không (0)' },
    { w: '今天', p: 'jīntiān', m: 'Hôm nay' },
    { w: '明天', p: 'míngtiān', m: 'Ngày mai' },
    { w: '昨天', p: 'zuótiān', m: 'Hôm qua' },
    { w: '年', p: 'nián', m: 'Năm' },
    { w: '月', p: 'yuè', m: 'Tháng, mặt trăng' },
    { w: '日', p: 'rì', m: 'Ngày, mặt trời' },
    { w: '星期', p: 'xīngqī', m: 'Thứ, tuần lễ' },
    { w: '点', p: 'diǎn', m: 'Giờ (thời gian)' },
    { w: '分钟', p: 'fēnzhōng', m: 'Phút' }
  ],
  [
    { q: "Từ '今天' (jīntiān) có nghĩa là gì?", opts: ['A. Hôm qua', 'B. Ngày mai', 'C. Hôm nay', 'D. Năm sau'], a: 2, exp: "'今天' là Hôm nay." },
    { q: "Số tám (8) trong tiếng Trung phát âm là:", opts: ['A. bā (八)', 'B. liù (六)', 'C. shí (十)', 'D. sì (四)'], a: 0, exp: "'八' phát âm là bā." }
  ]
);

export const HSK1_DECK_4 = buildDeck(
  'hsk1_b4_an_uong',
  'HSK 1 - Bài 4: Ẩm Thực, Ăn Uống & Hoa Quả',
  'Tiếng Trung HSK 1',
  'zh-CN',
  'Các đồ ăn, thức uống và hoa quả thường gặp hàng ngày',
  [
    { w: '吃', p: 'chī', m: 'Ăn' },
    { w: '喝', p: 'hē', m: 'Uống' },
    { w: '水', p: 'shuǐ', m: 'Nước lọc' },
    { w: '茶', p: 'chá', m: 'Trà, chè' },
    { w: '米饭', p: 'mǐfàn', m: 'Cơm trắng' },
    { w: '面条', p: 'miàntiáo', m: 'Mì sợi' },
    { w: '菜', p: 'cài', m: 'Món ăn, rau củ' },
    { w: '苹果', p: 'píngguǒ', m: 'Quả táo' },
    { w: '水果', p: 'shuǐguǒ', m: 'Trái cây, hoa quả' },
    { w: '牛奶', p: 'niúnǎi', m: 'Sữa bò tươi' },
    { w: '咖啡', p: 'kāfēi', m: 'Cà phê' },
    { w: '面包', p: 'miànbāo', m: 'Bánh mì' },
    { w: '鱼', p: 'yú', m: 'Con cá' },
    { w: '肉', p: 'ròu', m: 'Thịt' },
    { w: '蛋', p: 'dàn', m: 'Quả trứng' },
    { w: '好吃', p: 'hǎochī', m: 'Ngon miệng' },
    { w: '饱', p: 'bǎo', m: 'No bụng' },
    { w: '饿', p: 'è', m: 'Đói bụng' },
    { w: '甜', p: 'tián', m: 'Vị ngọt ngào' },
    { w: '多少钱', p: 'duōshao qián', m: 'Bao nhiêu tiền?' }
  ],
  [
    { q: "Hành động 'Uống nước' trong tiếng Trung là:", opts: ['A. 吃水', 'B. 喝水', 'C. 喝茶', 'D. 吃米饭'], a: 1, exp: "'喝水' (hē shuǐ) nghĩa là Uống nước." },
    { q: "'苹果' (píngguǒ) là loại quả nào?", opts: ['A. Quả chuối', 'B. Quả dưa hấu', 'C. Quả táo', 'D. Quả xoài'], a: 2, exp: "'苹果' là quả táo." }
  ]
);

export const HSK1_DECK_5 = buildDeck(
  'hsk1_b5_truong_hoc',
  'HSK 1 - Bài 5: Trường Học & Đồ Dùng Học Tập',
  'Tiếng Trung HSK 1',
  'zh-CN',
  'Không gian trường học, thao tác học tập và thiết bị thông minh',
  [
    { w: '学校', p: 'xuéxiào', m: 'Trường học' },
    { w: '学习', p: 'xuéxí', m: 'Học tập' },
    { w: '读', p: 'dú', m: 'Đọc' },
    { w: '写', p: 'xiě', m: 'Viết' },
    { w: '听', p: 'tīng', m: 'Nghe' },
    { w: '说', p: 'shuō', m: 'Nói' },
    { w: '汉字', p: 'hànzì', m: 'Chữ Hán' },
    { w: '汉语', p: 'hànyǔ', m: 'Tiếng Hán, tiếng Trung' },
    { w: '书', p: 'shū', m: 'Cuốn sách' },
    { w: '本子', p: 'běnzi', m: 'Quyển vở ghi chép' },
    { w: '桌子', p: 'zhuōzi', m: 'Cái bàn' },
    { w: '椅子', p: 'yǐzi', m: 'Cái ghế ngồi' },
    { w: '笔', p: 'bǐ', m: 'Cây bút viết' },
    { w: '电脑', p: 'diànnǎo', m: 'Máy vi tính' },
    { w: '手机', p: 'shǒujī', m: 'Điện thoại di động' },
    { w: '明白', p: 'míngbai', m: 'Hiểu rõ, rõ ràng' },
    { w: '懂', p: 'dǒng', m: 'Hiểu được' },
    { w: '问', p: 'wèn', m: 'Hỏi' },
    { w: '问题', p: 'wèntí', m: 'Vấn đề, câu hỏi' },
    { w: '考试', p: 'kǎoshì', m: 'Thi cử, bài kiểm tra' }
  ],
  [
    { q: "Từ '电脑' (diànnǎo) có nghĩa là gì?", opts: ['A. Điện thoại', 'B. Máy tính', 'C. Ti vi', 'D. Tủ lạnh'], a: 1, exp: "'电脑' là Máy vi tính." }
  ]
);

export const HSK1_DECK_6 = buildDeck(
  'hsk1_b6_phuong_huong_dia_diem',
  'HSK 1 - Bài 6: Phương Hướng & Địa Điểm',
  'Tiếng Trung HSK 1',
  'zh-CN',
  'Vị trí không gian, các địa điểm dịch vụ công cộng và quốc gia',
  [
    { w: '上', p: 'shàng', m: 'Phía trên, lên trên' },
    { w: '下', p: 'xià', m: 'Phía dưới, xuống dưới' },
    { w: '前面', p: 'qiánmiàn', m: 'Phía trước mặt' },
    { w: '后面', p: 'hòumiàn', m: 'Phía sau lưng' },
    { w: '里', p: 'lǐ', m: 'Bên trong' },
    { w: '外', p: 'wài', m: 'Bên ngoài' },
    { w: '左', p: 'zuǒ', m: 'Bên trái' },
    { w: '右', p: 'yòu', m: 'Bên phải' },
    { w: '这里', p: 'zhèlǐ', m: 'Ở đây, chỗ này' },
    { w: '那里', p: 'nàlǐ', m: 'Ở kia, chỗ đó' },
    { w: '哪儿', p: 'nǎr', m: 'Ở đâu?' },
    { w: '去', p: 'qù', m: 'Đi đến' },
    { w: '来', p: 'lái', m: 'Đến, tới đây' },
    { w: '回', p: 'huí', m: 'Trở về' },
    { w: '商店', p: 'shāngdiàn', m: 'Cửa hàng, tiệm buôn' },
    { w: '医院', p: 'yīyuàn', m: 'Bệnh viện' },
    { w: '饭店', p: 'fàndiàn', m: 'Nhà hàng, khách sạn' },
    { w: '车站', p: 'chēzhàn', m: 'Bến xe, nhà ga' },
    { w: '机场', p: 'jīchǎng', m: 'Sân bay phi trường' },
    { w: '中国', p: 'Zhōngguó', m: 'Đất nước Trung Quốc' }
  ],
  [
    { q: "Nơi khám chữa bệnh gọi là gì?", opts: ['A. 商店', 'B. 医院', 'C. 饭店', 'D. 车站'], a: 1, exp: "'医院' (yīyuàn) là Bệnh viện." }
  ]
);

// ==========================================
// 🇨🇳 LỘ TRÌNH TIẾNG TRUNG HSK 2 (5 BÀI)
// ==========================================

export const HSK2_DECK_7 = buildDeck(
  'hsk2_b7_mua_sam',
  'HSK 2 - Bài 7: Mua Sắm & Trang Phục',
  'Tiếng Trung HSK 2',
  'zh-CN',
  'Từ vựng mua sắm hàng hóa, màu sắc, trang phục và tiền tệ',
  [
    { w: '买', p: 'mǎi', m: 'Mua sắm' },
    { w: '卖', p: 'mài', m: 'Bán hàng' },
    { w: '钱', p: 'qián', m: 'Tiền bạc' },
    { w: '块', p: 'kuài', m: 'Đồng (đơn vị tiền tệ)' },
    { w: '元', p: 'yuán', m: 'Nhân dân tệ (chính thức)' },
    { w: '便宜', p: 'piányi', m: 'Rẻ, giá cả phải chăng' },
    { w: '贵', p: 'guì', m: 'Đắt đỏ, giá cao' },
    { w: '衣服', p: 'yīfu', m: 'Quần áo' },
    { w: '穿', p: 'chuān', m: 'Mặc, xỏ quần áo' },
    { w: '颜色', p: 'yánsè', m: 'Màu sắc' },
    { w: '红', p: 'hóng', m: 'Màu đỏ' },
    { w: '白', p: 'bái', m: 'Màu trắng' },
    { w: '黑', p: 'hēi', m: 'Màu đen' },
    { w: '蓝', p: 'lán', m: 'Màu xanh lam' },
    { w: '件', p: 'jiàn', m: 'Chiếc, cái (lượng từ quần áo)' },
    { w: '双', p: 'shuāng', m: 'Đôi, cặp' },
    { w: '裤子', p: 'kùzi', m: 'Cái quần' },
    { w: '鞋子', p: 'xiézi', m: 'Đôi giày' },
    { w: '试', p: 'shì', m: 'Thử đồ, kiểm tra' },
    { w: '超市', p: 'chāoshì', m: 'Siêu thị' }
  ],
  [
    { q: "Từ trái nghĩa với '贵' (guì - Đắt) là gì?", opts: ['A. 便宜 (piányi)', 'B. 好 (hǎo)', 'C. 买 (mǎi)', 'D. 大 (dà)'], a: 0, exp: "'便宜' (piányi) có nghĩa là Rẻ." }
  ]
);

export const HSK2_DECK_8 = buildDeck(
  'hsk2_b8_giao_thong',
  'HSK 2 - Bài 8: Giao Thông & Phương Tiện Đi Lại',
  'Tiếng Trung HSK 2',
  'zh-CN',
  'Các loại phương tiện giao thông và các động từ di chuyển trong đô thị',
  [
    { w: '出租车', p: 'chūzūchē', m: 'Xe taxi' },
    { w: '公共汽车', p: 'gōnggòng qìchē', m: 'Xe buýt công cộng' },
    { w: '火车', p: 'huǒchē', m: 'Tàu hỏa xe lửa' },
    { w: '飞机', p: 'fēijī', m: 'Máy bay phi cơ' },
    { w: '地铁', p: 'dìtiě', m: 'Tàu điện ngầm' },
    { w: '自行车', p: 'zìxíngchē', m: 'Xe đạp' },
    { w: '开车', p: 'kāichē', m: 'Lái xe ô tô' },
    { w: '坐', p: 'zuò', m: 'Ngồi, đi (phương tiện)' },
    { w: '走路', p: 'zǒulù', m: 'Đi bộ' },
    { w: '远', p: 'yuǎn', m: 'Khoảng cách xa xôi' },
    { w: '近', p: 'jìn', m: 'Khoảng cách gần gũi' },
    { w: '离', p: 'lí', m: 'Cách (khoảng cách)' },
    { w: '路', p: 'lù', m: 'Con đường, tuyến đường' },
    { w: '往', p: 'wǎng', m: 'Hướng về phía' },
    { w: '拐', p: 'guǎi', m: 'Rẽ, quẹo' },
    { w: '船', p: 'chuán', m: 'Con thuyền, tàu thủy' },
    { w: '慢', p: 'màn', m: 'Tốc độ chậm chạp' },
    { w: '快', p: 'kuài', m: 'Tốc độ nhanh chóng' },
    { w: '票', p: 'piào', m: 'Tấm vé đi lại' },
    { w: '旅游', p: 'lǚyóu', m: 'Đi du lịch tham quan' }
  ],
  [
    { q: "Phương tiện chạy dưới lòng đất gọi là:", opts: ['A. 火车', 'B. 地铁 (dìtiě)', 'C. 出租车', 'D. 自行车'], a: 1, exp: "'地铁' là tàu điện ngầm." }
  ]
);

export const HSK2_DECK_9 = buildDeck(
  'hsk2_b9_thoi_tiet_bon_mua',
  'HSK 2 - Bài 9: Thời Tiết & Bốn Mùa Trong Năm',
  'Tiếng Trung HSK 2',
  'zh-CN',
  'Khí hậu, hiện tượng thời tiết thiên nhiên và các mùa trong năm',
  [
    { w: '天气', p: 'tiānqì', m: 'Thời tiết' },
    { w: '晴天', p: 'qíngtiān', m: 'Ngày trời nắng ráo' },
    { w: '阴天', p: 'yīntiān', m: 'Ngày trời râm mát' },
    { w: '雨', p: 'yǔ', m: 'Cơn mưa' },
    { w: '下雨', p: 'xiàyǔ', m: 'Trời đổ mưa' },
    { w: '雪', p: 'xuě', m: 'Bông tuyết trắng' },
    { w: '风', p: 'fēng', m: 'Cơn gió' },
    { w: '太阳', p: 'tàiyáng', m: 'Mặt trời chiếu sáng' },
    { w: '月亮', p: 'yuèliang', m: 'Mặt trăng dịu êm' },
    { w: '热', p: 'rè', m: 'Nhiệt độ nóng bức' },
    { w: '冷', p: 'lěng', m: 'Nhiệt độ giá lạnh' },
    { w: '暖和', p: 'nuǎnhuo', m: 'Thời tiết ấm áp' },
    { w: '凉快', p: 'liángkuai', m: 'Thời tiết mát mẻ' },
    { w: '春天', p: 'chūntiān', m: 'Mùa xuân tươi mới' },
    { w: '夏天', p: 'xiàtiān', m: 'Mùa hè rực rỡ' },
    { w: '秋天', p: 'qiūtiān', m: 'Mùa thu lá vàng' },
    { w: '冬天', p: 'dōngtiān', m: 'Mùa đông tuyết rơi' },
    { w: '度', p: 'dù', m: 'Độ (nhiệt độ)' },
    { w: '空气', p: 'kōngqì', m: 'Không khí hít thở' },
    { w: '环境', p: 'huánjìng', m: 'Môi trường sống' }
  ],
  [
    { q: "Mùa hè trong tiếng Trung là gì?", opts: ['A. 春天', 'B. 夏天 (xiàtiān)', 'C. 秋天', 'D. 冬天'], a: 1, exp: "'夏天' là Mùa hè." }
  ]
);

export const HSK2_DECK_10 = buildDeck(
  'hsk2_b10_co_the_the_thao',
  'HSK 2 - Bài 10: Cơ Thể, Sức Khỏe & Thể Thao',
  'Tiếng Trung HSK 2',
  'zh-CN',
  'Bộ phận cơ thể con người, triệu chứng sức khỏe và môn thể thao',
  [
    { w: '身体', p: 'shēntǐ', m: 'Cơ thể, thân thể' },
    { w: '头', p: 'tóu', m: 'Cái đầu' },
    { w: '眼睛', p: 'yǎnjing', m: 'Đôi mắt sáng' },
    { w: '耳朵', p: 'ěrduo', m: 'Đôi tai lắng nghe' },
    { w: '鼻子', p: 'bízi', m: 'Chiếc mũi' },
    { w: '嘴巴', p: 'zuǐba', m: 'Cái miệng' },
    { w: '手', p: 'shǒu', m: 'Bàn tay khéo léo' },
    { w: '腿', p: 'tuǐ', m: 'Đôi chân bước đi' },
    { w: '生病', p: 'shēngbìng', m: 'Bị ốm, ngã bệnh' },
    { w: '感冒', p: 'gǎnmào', m: 'Cảm lạnh, cảm cúm' },
    { w: '发烧', p: 'fāshāo', m: 'Bị sốt cao' },
    { w: '药', p: 'yào', m: 'Thuốc chữa bệnh' },
    { w: '疼', p: 'téng', m: 'Đau đớn' },
    { w: '累', p: 'lèi', m: 'Mệt mỏi kiệt sức' },
    { w: '休息', p: 'xiūxi', m: 'Nghỉ ngơi thư giãn' },
    { w: '跑步', p: 'pǎobù', m: 'Chạy bộ tập thể dục' },
    { w: '游泳', p: 'yóuyǒng', m: 'Bơi lội dưới nước' },
    { w: '踢足球', p: 'tī zúqiú', m: 'Đá bóng' },
    { w: '打篮球', p: 'dǎ lánqiú', m: 'Chơi bóng rổ' },
    { w: '运动', p: 'yùndòng', m: 'Vận động, thể dục' }
  ],
  [
    { q: "Môn thể thao 'Bơi lội' trong tiếng Trung là:", opts: ['A. 跑步', 'B. 游泳 (yóuyǒng)', 'C. 踢足球', 'D. 生病'], a: 1, exp: "'游泳' nghĩa là Bơi lội." }
  ]
);

export const HSK2_DECK_11 = buildDeck(
  'hsk2_b11_so_thich_cam_xuc',
  'HSK 2 - Bài 11: Sở Thích, Giải Trí & Cảm Xúc',
  'Tiếng Trung HSK 2',
  'zh-CN',
  'Các hoạt động giải trí yêu thích và trạng thái tâm lý tình cảm',
  [
    { w: '唱歌', p: 'chànggē', m: 'Hát ca, ca hát' },
    { w: '跳舞', p: 'tiàowǔ', m: 'Nhảy múa, khiêu vũ' },
    { w: '画画', p: 'huàhuà', m: 'Vẽ tranh mỹ thuật' },
    { w: '听音乐', p: 'tīng yīnyuè', m: 'Nghe nhạc giải trí' },
    { w: '看电影', p: 'kàn diànyǐng', m: 'Xem phim rạp' },
    { w: '玩游戏', p: 'wán yóuxì', m: 'Chơi trò chơi điện tử' },
    { w: '上网', p: 'shàngwǎng', m: 'Lướt mạng Internet' },
    { w: '开心', p: 'kāixīn', m: 'Vui vẻ, hân hoan' },
    { w: '快乐', p: 'kuàilè', m: 'Hạnh phúc tràn đầy' },
    { w: '生气', p: 'shēngqì', m: 'Tức giận bực mình' },
    { w: '难过', p: 'nánguò', m: 'Buồn bã đau lòng' },
    { w: '担心', p: 'dānxīn', m: 'Lo lắng băn khoăn' },
    { w: '害怕', p: 'hàipà', m: 'Sợ hãi run sợ' },
    { w: '希望', p: 'xīwàng', m: 'Hy vọng mong ước' },
    { w: '满意', p: 'mǎnyì', m: 'Hài lòng vừa ý' },
    { w: '意思', p: 'yìsi', m: 'Ý nghĩa của điều gì' },
    { w: '有趣', p: 'yǒuqù', m: 'Thú vị hấp dẫn' },
    { w: '觉得', p: 'juéde', m: 'Cảm thấy, nghĩ rằng' },
    { w: '打算', p: 'dǎsuàn', m: 'Dự định kế hoạch' },
    { w: '准备', p: 'zhǔnbèi', m: 'Chuẩn bị sẵn sàng' }
  ],
  [
    { q: "Cụm từ 'Chơi game' trong tiếng Trung là:", opts: ['A. 玩游戏 (wán yóuxì)', 'B. 唱歌', 'C. 跳舞', 'D. 画画'], a: 0, exp: "'玩游戏' nghĩa là Chơi game." }
  ]
);

// ==========================================
// 🇨🇳 LỘ TRÌNH TIẾNG TRUNG HSK 3 (3 BÀI)
// ==========================================

export const HSK3_DECK_12 = buildDeck(
  'hsk3_b12_cong_viec_van_phong',
  'HSK 3 - Bài 12: Đời Sống Công Sở & Việc Làm',
  'Tiếng Trung HSK 3',
  'zh-CN',
  'Giao tiếp nghề nghiệp, văn phòng doanh nghiệp và sự phát triển cá nhân',
  [
    { w: '工作', p: 'gōngzuò', m: 'Công việc làm ăn' },
    { w: '上班', p: 'shàngbān', m: 'Đi làm việc' },
    { w: '下班', p: 'xiàbān', m: 'Tan ca về nhà' },
    { w: '公司', p: 'gōngsī', m: 'Công ty, doanh nghiệp' },
    { w: '经理', p: 'jīnglǐ', m: 'Giám đốc, quản lý' },
    { w: '同事', p: 'tóngshì', m: 'Đồng nghiệp cùng cơ quan' },
    { w: '会议', p: 'huìyì', m: 'Cuộc họp hội nghị' },
    { w: '解决', p: 'jiějué', m: 'Giải quyết vấn đề' },
    { w: '负责', p: 'fùzé', m: 'Chịu trách nhiệm' },
    { w: '任务', p: 'rènwu', m: 'Nhiệm vụ được giao' },
    { w: '经验', p: 'jīngyàn', m: 'Kinh nghiệm tích lũy' },
    { w: '机会', p: 'jīhuì', m: 'Cơ hội tốt' },
    { w: '成功', p: 'chénggōng', m: 'Thành công đạt mục tiêu' },
    { w: '努力', p: 'nǔlì', m: 'Nỗ lực cố gắng hết mình' },
    { w: '工资', p: 'gōngzī', m: 'Tiền lương thù lao' },
    { w: '迟到', p: 'chídào', m: 'Đi làm muộn, đến trễ' },
    { w: '请假', p: 'qǐngjià', m: 'Xin nghỉ phép' },
    { w: '合作', p: 'hézuò', m: 'Hợp tác làm việc nhóm' },
    { w: '发展', p: 'fāzhǎn', m: 'Phát triển lớn mạnh' },
    { w: '成绩', p: 'chéngjì', m: 'Thành tích đạt được' }
  ],
  [
    { q: "Từ chỉ người đứng đầu điều hành công ty là:", opts: ['A. 经理 (jīnglǐ)', 'B. 同事', 'C. 学生', 'D. 朋友'], a: 0, exp: "'经理' là Giám đốc / Người quản lý." }
  ]
);

export const HSK3_DECK_13 = buildDeck(
  'hsk3_b13_do_thi_xa_hoi',
  'HSK 3 - Bài 13: Đô Thị, Dịch Vụ & Xã Hội',
  'Tiếng Trung HSK 3',
  'zh-CN',
  'Cảnh quan thành phố, các dịch vụ công cộng và môi trường xã hội',
  [
    { w: '城市', p: 'chéngshì', m: 'Thành phố đô thị' },
    { w: '街道', p: 'jiēdào', m: 'Đường phố khu phố' },
    { w: '邻居', p: 'línjū', m: 'Hàng xóm láng giềng' },
    { w: '银行', p: 'yínháng', m: 'Ngân hàng tài chính' },
    { w: '邮局', p: 'yóujú', m: 'Bưu điện gửi thư' },
    { w: '宾馆', p: 'bīnguǎn', m: 'Khách sạn lưu trú' },
    { w: '图书馆', p: 'túshūguǎn', m: 'Thư viện đọc sách' },
    { w: '公园', p: 'gōngyuán', m: 'Công viên cây xanh' },
    { w: '警察', p: 'jǐngchá', m: 'Cảnh sát giữ gìn trật tự' },
    { w: '司机', p: 'sījī', m: 'Tài xế lái xe' },
    { w: '安全', p: 'ānquán', m: 'An toàn yên tâm' },
    { w: '危险', p: 'wēixiǎn', m: 'Nguy hiểm cảnh giác' },
    { w: '方便', p: 'fāngbiàn', m: 'Thuận tiện tiện lợi' },
    { w: '干净', p: 'gānjìng', m: 'Sạch sẽ tinh tươm' },
    { w: '安静', p: 'ānjìng', m: 'Yên tĩnh không ồn ào' },
    { w: '热闹', p: 'rènao', m: 'Náo nhiệt đông vui' },
    { w: '变化', p: 'biànhuà', m: 'Biến đổi thay đổi' },
    { w: '历史', p: 'lìshǐ', m: 'Lịch sử ngàn năm' },
    { w: '文化', p: 'wénhuà', m: 'Văn hóa truyền thống' },
    { w: '世界', p: 'shìjiè', m: 'Thế giới bao la' }
  ],
  [
    { q: "Nơi để mượn và đọc sách yên tĩnh là:", opts: ['A. 图书馆 (túshūguǎn)', 'B. 邮局', 'C. 银行', 'D. 车站'], a: 0, exp: "'图书馆' là Thư viện." }
  ]
);

export const HSK3_DECK_14 = buildDeck(
  'hsk3_b14_tinh_cach_giao_tiep',
  'HSK 3 - Bài 14: Phẩm Chất & Quan Điểm Đánh Giá',
  'Tiếng Trung HSK 3',
  'zh-CN',
  'Các tính từ miêu tả tính cách con người và phương pháp lập luận',
  [
    { w: '热情', p: 'rèqíng', m: 'Nhiệt tình hăng hái' },
    { w: '认真', p: 'rènzhēn', m: 'Nghiêm túc cẩn thận' },
    { w: '聪明', p: 'cōngming', m: 'Thông minh nhanh nhạy' },
    { w: '勇敢', p: 'yǒnggǎn', m: 'Dũng cảm can trường' },
    { w: '诚实', p: 'chéngshí', m: 'Thành thật trung thực' },
    { w: '礼貌', p: 'lǐmào', m: 'Lễ phép lịch thiệp' },
    { w: '严格', p: 'yángé', m: 'Nghiêm khắc chuẩn chỉ' },
    { w: '耐心', p: 'nàixīn', m: 'Kiên nhẫn nhẫn nại' },
    { w: '相信', p: 'xiāngxìn', m: 'Tin tưởng vào ai' },
    { w: '尊重', p: 'zūnzhòng', m: 'Tôn trọng người khác' },
    { w: '讨论', p: 'tǎolùn', m: 'Thảo luận bàn bạc' },
    { w: '意见', p: 'yìjiàn', m: 'Ý kiến đóng góp' },
    { w: '影响', p: 'yǐngxiǎng', m: 'Ảnh hưởng tác động' },
    { w: '习惯', p: 'xíguàn', m: 'Thói quen tập quán' },
    { w: '选择', p: 'xuǎnzé', m: 'Lựa chọn sáng suốt' },
    { w: '比较', p: 'bǐjiào', m: 'So sánh tương quan' },
    { w: '发现', p: 'fāxiàn', m: 'Phát hiện tìm ra' },
    { w: '检查', p: 'jiǎnchá', m: 'Kiểm tra xem xét' },
    { w: '保证', p: 'bǎozhèng', m: 'Đảm bảo cam đoan' },
    { w: '坚持', p: 'jiānchí', m: 'Kiên trì theo đuổi' }
  ],
  [
    { q: "Từ chỉ đức tính không dối trá là:", opts: ['A. 诚实 (chéngshí)', 'B. 热情', 'C. 严格', 'D. 迟到'], a: 0, exp: "'诚实' nghĩa là Thành thật / Trung thực." }
  ]
);

// ==========================================
// 🇬🇧 LỘ TRÌNH TIẾNG ANH CHUYÊN ĐỀ (6 BÀI)
// ==========================================

export const EN_DECK_15 = buildDeck(
  'en_b15_lap_trinh_it',
  'English - Bài 15: Công Nghệ Thông Tin & Lập Trình',
  'Tiếng Anh Công Nghệ',
  'en',
  'Thuật ngữ nòng cốt về kỹ thuật phần mềm, cấu trúc dữ liệu và hệ thống web',
  [
    { w: 'Algorithm', p: '/ˈæl.ɡə.rɪ.ðəm/', m: 'Thuật toán xử lý bài toán' },
    { w: 'Variable', p: '/ˈveə.ri.ə.bəl/', m: 'Biến số lưu trữ dữ liệu' },
    { w: 'Function', p: '/ˈfʌŋk.ʃən/', m: 'Hàm số xử lý khối lệnh' },
    { w: 'Compiler', p: '/kəmˈpaɪ.lər/', m: 'Trình biên dịch mã nguồn' },
    { w: 'Framework', p: '/ˈfreɪm.wɜːk/', m: 'Khung phần mềm nền tảng' },
    { w: 'Database', p: '/ˈdeɪ.tə.beɪs/', m: 'Cơ sở dữ liệu lưu trữ' },
    { w: 'Debug', p: '/diːˈbʌɡ/', m: 'Gỡ lỗi phần mềm' },
    { w: 'Frontend', p: '/ˌfrʌntˈend/', m: 'Giao diện phía người dùng' },
    { w: 'Backend', p: '/ˌbækˈend/', m: 'Hệ thống logic phía máy chủ' },
    { w: 'API', p: '/ˌeɪ.piːˈaɪ/', m: 'Giao diện lập trình ứng dụng' },
    { w: 'Responsive', p: '/rɪˈspɒn.sɪv/', m: 'Tương thích mọi kích thước màn hình' },
    { w: 'Component', p: '/kəmˈpəʊ.nənt/', m: 'Thành phần giao diện độc lập' },
    { w: 'Git', p: '/ɡɪt/', m: 'Hệ thống quản lý phiên bản' },
    { w: 'Repository', p: '/rɪˈpɒz.ɪ.tər.i/', m: 'Kho lưu trữ mã nguồn' },
    { w: 'Deploy', p: '/dɪˈplɔɪ/', m: 'Triển khai ứng dụng lên máy chủ' },
    { w: 'Cache', p: '/kæʃ/', m: 'Bộ nhớ đệm tốc độ cao' },
    { w: 'Server', p: '/ˈsɜː.vər/', m: 'Máy chủ xử lý yêu cầu mạng' },
    { w: 'Network', p: '/ˈnet.wɜːk/', m: 'Mạng lưới kết nối máy tính' },
    { w: 'Protocol', p: '/ˈprəʊ.tə.kɒl/', m: 'Giao thức truyền thông mạng' },
    { w: 'Encryption', p: '/ɪnˈkrɪp.ʃən/', m: 'Mã hóa bảo vệ dữ liệu bí mật' }
  ],
  [
    { q: "Thuật ngữ nào chỉ 'Giao diện lập trình ứng dụng' kết nối Frontend và Backend?", opts: ['A. API', 'B. Compiler', 'C. Cache', 'D. Git'], a: 0, exp: "API (Application Programming Interface) là giao diện lập trình kết nối hệ thống." },
    { q: "Quá trình tìm và khắc phục lỗi mã nguồn gọi là:", opts: ['A. Deploy', 'B. Debug', 'C. Server', 'D. Variable'], a: 1, exp: "Debug là quá trình dò tìm và gỡ lỗi phần mềm." }
  ]
);

export const EN_DECK_16 = buildDeck(
  'en_b16_ai_data_science',
  'English - Bài 16: Trí Tuệ Nhân Tạo & Khoa Học Dữ Liệu',
  'Tiếng Anh Công Nghệ',
  'en',
  'Các khái niệm hàng đầu về Generative AI, Machine Learning và Deep Learning',
  [
    { w: 'Machine Learning', p: '/məˈʃiːn ˈlɜːnɪŋ/', m: 'Học máy cho máy tính tự học từ dữ liệu' },
    { w: 'Neural Network', p: '/ˈnjʊə.rəl ˈnet.wɜːk/', m: 'Mạng nơ-ron phỏng não người' },
    { w: 'Deep Learning', p: '/diːp ˈlɜːnɪŋ/', m: 'Học sâu với nhiều tầng nơ-ron' },
    { w: 'Computer Vision', p: '/kəmˈpjuːtər ˈvɪʒn/', m: 'Thị giác máy tính nhận diện hình ảnh' },
    { w: 'Natural Language Processing', p: '/ˈnætʃrəl ˈlæŋɡwɪdʒ/', m: 'Xử lý ngôn ngữ tự nhiên' },
    { w: 'Supervised Learning', p: '/ˈsuːpəvaɪzd/', m: 'Học có giám sát bằng nhãn dữ liệu' },
    { w: 'Dataset', p: '/ˈdeɪtəset/', m: 'Bộ tập hợp dữ liệu huấn luyện' },
    { w: 'Feature', p: '/ˈfiːtʃər/', m: 'Đặc trưng thuộc tính của dữ liệu' },
    { w: 'Accuracy', p: '/ˈækjərəsi/', m: 'Độ chính xác của mô hình' },
    { w: 'Model Training', p: '/ˈtreɪnɪŋ/', m: 'Quá trình huấn luyện mô hình' },
    { w: 'Inference', p: '/ˈɪnfərəns/', m: 'Suy luận và dự đoán của mô hình' },
    { w: 'Prompt', p: '/prɒmpt/', m: 'Câu lệnh chỉ thị cho mô hình AI' },
    { w: 'Hallucination', p: '/həˌluːsɪˈneɪʃn/', m: 'Ảo giác đưa ra câu trả lời sai lệch của AI' },
    { w: 'Token', p: '/ˈtəʊkən/', m: 'Đơn vị mảnh từ được mô hình mã hóa' },
    { w: 'Vector Database', p: '/ˈvektər ˈdeɪtəbeɪs/', m: 'Cơ sở dữ liệu véc-tơ đa chiều' },
    { w: 'LLM', p: '/ˌel.elˈem/', m: 'Mô hình ngôn ngữ lớn (Large Language Model)' },
    { w: 'VLM', p: '/ˌviː.elˈem/', m: 'Mô hình ngôn ngữ thị giác đa phương thức' },
    { w: 'Overfitting', p: '/ˌəʊvəˈfɪtɪŋ/', m: 'Hiện tượng học vẹt quá khớp dữ liệu huấn luyện' },
    { w: 'Optimizer', p: '/ˈɒptɪmaɪzər/', m: 'Thuật toán tối ưu hóa trọng số mô hình' },
    { w: 'Fine-tuning', p: '/faɪn ˈtjuːnɪŋ/', m: 'Tinh chỉnh mô hình trên tập dữ liệu chuyên ngành' }
  ],
  [
    { q: "Hiện tượng AI đưa ra thông tin bịa đặt sai lệch gọi là gì?", opts: ['A. Hallucination', 'B. Optimizer', 'C. Token', 'D. Inference'], a: 0, exp: "Hallucination (Ảo giác AI) là hiện tượng mô hình sinh nội dung không có thật." }
  ]
);

export const EN_DECK_17 = buildDeck(
  'en_b17_tieng_anh_cong_so',
  'English - Bài 17: Tiếng Anh Công Sở & Quản Trị',
  'Tiếng Anh Giao Tiếp',
  'en',
  'Giao tiếp doanh nghiệp, quản lý dự án và tác phong làm việc chuyên nghiệp',
  [
    { w: 'Collaboration', p: '/kəˌlæb.əˈreɪ.ʃən/', m: 'Sự hợp tác cùng phát triển' },
    { w: 'Efficiency', p: '/ɪˈfɪʃ.ən.si/', m: 'Tính hiệu quả và tiết kiệm tài nguyên' },
    { w: 'Productivity', p: '/ˌprɒd.ʌkˈtɪv.ə.ti/', m: 'Năng suất lao động' },
    { w: 'Deadline', p: '/ˈded.laɪn/', m: 'Thời hạn chót hoàn thành công việc' },
    { w: 'Presentation', p: '/ˌprez.ənˈteɪ.ʃən/', m: 'Buổi thuyết trình báo cáo ý tưởng' },
    { w: 'Negotiation', p: '/nəˌɡəʊ.ʃiˈeɪ.ʃən/', m: 'Cuộc đàm phán thương lượng' },
    { w: 'Strategy', p: '/ˈstræt.ə.dʒi/', m: 'Chiến lược dài hạn' },
    { w: 'Objective', p: '/əbˈdʒek.tɪv/', m: 'Mục tiêu rõ ràng cụ thể' },
    { w: 'Feedback', p: '/ˈfiːd.bæk/', m: 'Ý kiến đóng góp phản hồi' },
    { w: 'Performance', p: '/pəˈfɔː.məns/', m: 'Hiệu suất năng lực làm việc' },
    { w: 'Leadership', p: '/ˈliː.də.ʃɪp/', m: 'Kỹ năng lãnh đạo dẫn dắt' },
    { w: 'Workflow', p: '/ˈwɜːk.fləʊ/', m: 'Quy trình luồng làm việc trơn tru' },
    { w: 'Milestone', p: '/ˈmaɪl.stəʊn/', m: 'Cột mốc quan trọng của dự án' },
    { w: 'Stakeholder', p: '/ˈsteɪkˌhəʊl.dər/', m: 'Các bên liên quan có lợi ích' },
    { w: 'Budget', p: '/ˈbʌdʒ.ɪt/', m: 'Ngân sách chi tiêu dự toán' },
    { w: 'Revenue', p: '/ˈrev.ən.juː/', m: 'Doanh thu thu về từ kinh doanh' },
    { w: 'Contract', p: '/ˈkɒn.trækt/', m: 'Hợp đồng giao kết pháp lý' },
    { w: 'Proposal', p: '/prəˈpəʊ.zəl/', m: 'Bản đề xuất phương án' },
    { w: 'Brainstorm', p: '/ˈbreɪn.stɔːm/', m: 'Động não cùng nhau tìm giải pháp mới' },
    { w: 'Resignation', p: '/ˌrez.ɪɡˈneɪ.ʃən/', m: 'Đơn từ chức xin nghỉ việc' }
  ],
  [
    { q: "Hạn chót phải hoàn thành nhiệm vụ gọi là gì?", opts: ['A. Deadline', 'B. Budget', 'C. Feedback', 'D. Workflow'], a: 0, exp: "Deadline là thời hạn cuối cùng phải nộp/hoàn thành công việc." }
  ]
);

export const EN_DECK_18 = buildDeck(
  'en_b18_du_lich_khach_san',
  'English - Bài 18: Du Lịch & Dịch Vụ Khách Sạn',
  'Tiếng Anh Giao Tiếp',
  'en',
  'Hành trình du lịch vòng quanh thế giới, thủ tục sân bay và khách sạn',
  [
    { w: 'Destination', p: '/ˌdes.tɪˈneɪ.ʃən/', m: 'Điểm đến du lịch mơ ước' },
    { w: 'Boarding Pass', p: '/ˈbɔː.dɪŋ ˌpɑːs/', m: 'Thẻ lên máy bay' },
    { w: 'Passport', p: '/ˈpɑːs.pɔːt/', m: 'Hộ chiếu xuất nhập cảnh' },
    { w: 'Baggage', p: '/ˈbæɡ.ɪdʒ/', m: 'Hành lý mang theo chuyến đi' },
    { w: 'Departure', p: '/dɪˈpɑː.tʃər/', m: 'Giờ khởi hành xuất phát' },
    { w: 'Arrival', p: '/əˈraɪ.vəl/', m: 'Giờ hạ cánh cập bến' },
    { w: 'Reservation', p: '/ˌrez.əˈveɪ.ʃən/', m: 'Sự đặt chỗ trước' },
    { w: 'Accommodation', p: '/əˌkɒm.əˈdeɪ.ʃən/', m: 'Nơi ăn chốn ở lưu trú' },
    { w: 'Itinerary', p: '/aɪˈtɪn.ər.ər.i/', m: 'Lịch trình chi tiết chuyến đi' },
    { w: 'Currency', p: '/ˈkʌr.ən.si/', m: 'Ngoại tệ tiền tệ các nước' },
    { w: 'Sightseeing', p: '/ˈsaɪtˌsiː.ɪŋ/', m: 'Ngắm cảnh danh lam thắng cảnh' },
    { w: 'Souvenir', p: '/ˌsuː.vənˈɪər/', m: 'Quà lưu niệm kỷ niệm' },
    { w: 'Customs', p: '/ˈkʌs.təmz/', m: 'Cửa khẩu hải quan kiểm tra' },
    { w: 'Reception', p: '/rɪˈsep.ʃən/', m: 'Quầy tiếp tân khách sạn' },
    { w: 'Check-in', p: '/ˈtʃek.ɪn/', m: 'Thủ tục nhận phòng bay' },
    { w: 'Check-out', p: '/ˈtʃek.aʊt/', m: 'Thủ tục trả phòng khách sạn' },
    { w: 'Guide', p: '/ɡaɪd/', m: 'Hướng dẫn viên du lịch' },
    { w: 'Scenic', p: '/ˈsiː.nɪk/', m: 'Cảnh đẹp như tranh vẽ' },
    { w: 'Cruise', p: '/kruːz/', m: 'Chuyến du thuyền trên biển' },
    { w: 'Adventure', p: '/ədˈven.tʃər/', m: 'Chuyến thám hiểm phiêu lưu mạo hiểm' }
  ],
  [
    { q: "Giấy tờ bắt buộc để lên máy bay cùng hộ chiếu là:", opts: ['A. Boarding Pass', 'B. Souvenir', 'C. Cruise', 'D. Sightseeing'], a: 0, exp: "Boarding Pass là thẻ lên máy bay." }
  ]
);

export const EN_DECK_19 = buildDeck(
  'en_b19_khoi_nghiep_tai_chinh',
  'English - Bài 19: Khởi Nghiệp, Tài Chính & Đầu Tư',
  'Tiếng Anh Kinh Tế',
  'en',
  'Thuật ngữ thế giới khởi nghiệp công nghệ, thị trường vốn và tài chính',
  [
    { w: 'Entrepreneur', p: '/ˌɒn.trə.prəˈnɜːr/', m: 'Nhà doanh nhân khởi nghiệp sáng tạo' },
    { w: 'Venture Capital', p: '/ˈven.tʃər ˌkæp.ɪ.təl/', m: 'Quỹ đầu tư mạo hiểm' },
    { w: 'Pitch Deck', p: '/pɪtʃ dek/', m: 'Bản tài liệu thuyết trình gọi vốn' },
    { w: 'Valuation', p: '/ˌvæl.juˈeɪ.ʃən/', m: 'Định giá trị giá doanh nghiệp' },
    { w: 'Equity', p: '/ˈek.wɪ.ti/', m: 'Cổ phần sở hữu trong công ty' },
    { w: 'Dividend', p: '/ˈdɪv.ɪ.dend/', m: 'Cổ tức chia cho cổ đông' },
    { w: 'Cash Flow', p: '/kæʃ fləʊ/', m: 'Dòng tiền mặt lưu chuyển' },
    { w: 'Asset', p: '/ˈæs.et/', m: 'Tài sản có giá trị sinh lời' },
    { w: 'Liability', p: '/ˌlaɪ.əˈbɪl.ə.ti/', m: 'Nợ phải trả và trách nhiệm tài chính' },
    { w: 'Profit', p: '/ˈprɒf.ɪt/', m: 'Lợi nhuận ròng thu về' },
    { w: 'Deficit', p: '/ˈdef.ɪ.sɪt/', m: 'Khoản thâm hụt cán cân' },
    { w: 'Inflation', p: '/ɪnˈfleɪ.ʃən/', m: 'Tình trạng lạm phát giá cả tăng' },
    { w: 'Portfolio', p: '/pɔːtˈfəʊ.li.əʊ/', m: 'Danh mục các khoản đầu tư' },
    { w: 'Scalability', p: '/ˌskeɪ.ləˈbɪl.ə.ti/', m: 'Khả năng mở rộng quy mô kinh doanh' },
    { w: 'Market Share', p: '/ˈmɑː.kɪt ʃeər/', m: 'Thị phần chi phối trên thị trường' },
    { w: 'Acquisition', p: '/ˌæk.wɪˈzɪʃ.ən/', m: 'Thương vụ mua lại và sáp nhập' },
    { w: 'Monopoly', p: '/məˈnɒp.əl.i/', m: 'Thị trường độc quyền một mình' },
    { w: 'Bankruptcy', p: '/ˈbæŋ.krəpt.si/', m: 'Tình trạng phá sản vỡ nợ' },
    { w: 'Crowdfunding', p: '/ˈkraʊdˌfʌn.dɪŋ/', m: 'Gọi vốn ủng hộ từ cộng đồng' },
    { w: 'Unicorn', p: '/ˈjuː.nɪ.kɔːn/', m: 'Kỳ lân khởi nghiệp định giá trên 1 tỷ USD' }
  ],
  [
    { q: "Startup được định giá trên 1 tỷ USD được gọi là:", opts: ['A. Unicorn', 'B. Asset', 'C. Deficit', 'D. Monopoly'], a: 0, exp: "Unicorn (Kỳ lân) chỉ doanh nghiệp khởi nghiệp được định giá từ 1 tỷ USD trở lên." }
  ]
);

export const EN_DECK_20 = buildDeck(
  'en_b20_khoa_hoc_vu_tru',
  'English - Bài 20: Khoa Học, Vũ Trụ & Thế Giới Tương Lai',
  'Tiếng Anh Khoa Học',
  'en',
  'Khám phá các bí ẩn thiên văn học, vật lý lượng tử và khoa học tương lai',
  [
    { w: 'Cosmos', p: '/ˈkɒz.mɒs/', m: 'Vũ trụ bao la rộng lớn' },
    { w: 'Galaxy', p: '/ˈɡæl.ək.si/', m: 'Dải thiên hà chứa hàng tỷ ngôi sao' },
    { w: 'Solar System', p: '/ˌsəʊ.lə ˈsɪs.təm/', m: 'Hệ Mặt Trời quay quanh trung tâm' },
    { w: 'Orbit', p: '/ˈɔː.bɪt/', m: 'Quỹ đạo chuyển động thiên thể' },
    { w: 'Gravity', p: '/ˈɡræv.ə.ti/', m: 'Lực hấp dẫn lực hút trái đất' },
    { w: 'Satellite', p: '/ˈsæt.əl.aɪt/', m: 'Vệ tinh nhân tạo bay ngoài không gian' },
    { w: 'Astronaut', p: '/ˈæs.trə.nɔːt/', m: 'Phi hành gia thám hiểm vũ trụ' },
    { w: 'Telescope', p: '/ˈtel.ɪ.skəʊp/', m: 'Kính thiên văn quan sát vũ trụ xa' },
    { w: 'Black Hole', p: '/blæk həʊl/', m: 'Hố đen có lực hấp dẫn cực đại' },
    { w: 'Nebula', p: '/ˈneb.jə.lə/', m: 'Tinh vân đám mây bụi vũ trụ' },
    { w: 'Atmosphere', p: '/ˈæt.məs.fɪər/', m: 'Bầu khí quyển bảo vệ sự sống' },
    { w: 'Ecosystem', p: '/ˈiː.kəʊˌsɪs.təm/', m: 'Hệ sinh thái tự nhiên hài hòa' },
    { w: 'Biodiversity', p: '/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/', m: 'Sự đa dạng sinh học các loài' },
    { w: 'Renewable', p: '/rɪˈnjuː.ə.bəl/', m: 'Năng lượng tái tạo sạch xanh' },
    { w: 'Quantum', p: '/ˈkwɒn.təm/', m: 'Lượng tử vật lý vi mô' },
    { w: 'Mutation', p: '/mjuːˈteɪ.ʃən/', m: 'Sự đột biến trong cấu trúc gen' },
    { w: 'Evolution', p: '/ˌiː.vəˈluː.ʃən/', m: 'Sự tiến hóa của muôn loài' },
    { w: 'Molecule', p: '/ˈmɒl.ɪ.kjuːl/', m: 'Phân tử cấu thành vật chất' },
    { w: 'Nanotechnology', p: '/ˌnæn.əʊ.tekˈnɒl.ə.dʒi/', m: 'Công nghệ nano kích thước siêu nhỏ' },
    { w: 'Exoplanet', p: '/ˈek.səʊˌplæn.ɪt/', m: 'Hành tinh nằm ngoài hệ mặt trời' }
  ],
  [
    { q: "Người du hành làm việc ngoài không gian vũ trụ gọi là:", opts: ['A. Astronaut', 'B. Satellite', 'C. Telescope', 'D. Molecule'], a: 0, exp: "Astronaut là Phi hành gia." }
  ]
);

// Danh sách trọn vẹn 20 bộ bài học (mỗi bài đúng 20 từ vựng = 400 từ vựng chuẩn)
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
