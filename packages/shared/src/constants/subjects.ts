// Knowledge point tree for Jiangsu Grade 1
// Based on: 部编版语文, 苏教版数学, 译林版英语

export interface KnowledgePointNode {
  id: string;
  name: string;
  level: number; // 1=章, 2=节, 3=知识点
  children?: KnowledgePointNode[];
}

export const SUBJECTS = [
  { id: 1, name: '语文', code: 'chinese' },
  { id: 2, name: '数学', code: 'math' },
  { id: 3, name: '英语', code: 'english' },
] as const;

// Chinese knowledge points (部编版)
export const CHINESE_KPS: KnowledgePointNode[] = [
  {
    id: 'ch-s1-u1',
    name: '识字（一）',
    level: 1,
    children: [
      { id: 'ch-s1-u1-k1', name: '天地人', level: 3 },
      { id: 'ch-s1-u1-k2', name: '金木水火土', level: 3 },
      { id: 'ch-s1-u1-k3', name: '口耳目', level: 3 },
      { id: 'ch-s1-u1-k4', name: '日月水火', level: 3 },
      { id: 'ch-s1-u1-k5', name: '对韵歌', level: 3 },
    ],
  },
  {
    id: 'ch-s1-u2',
    name: '汉语拼音',
    level: 1,
    children: [
      { id: 'ch-s1-u2-k1', name: '单韵母 a o e i u ü', level: 3 },
      { id: 'ch-s1-u2-k2', name: '声母 b p m f', level: 3 },
      { id: 'ch-s1-u2-k3', name: '声母 d t n l', level: 3 },
      { id: 'ch-s1-u2-k4', name: '声母 g k h', level: 3 },
      { id: 'ch-s1-u2-k5', name: '声母 j q x', level: 3 },
      { id: 'ch-s1-u2-k6', name: '平舌音 z c s 及整体认读音节', level: 3 },
      { id: 'ch-s1-u2-k7', name: '翘舌音 zh ch sh r 及整体认读音节', level: 3 },
      { id: 'ch-s1-u2-k8', name: '声母 y w 及整体认读音节', level: 3 },
      { id: 'ch-s1-u2-k9', name: '复韵母 ai ei ui', level: 3 },
      { id: 'ch-s1-u2-k10', name: '复韵母 ao ou iu', level: 3 },
      { id: 'ch-s1-u2-k11', name: '复韵母 ie üe er', level: 3 },
      { id: 'ch-s1-u2-k12', name: '前鼻韵母 an en in un ün', level: 3 },
      { id: 'ch-s1-u2-k13', name: '后鼻韵母 ang eng ing ong', level: 3 },
      { id: 'ch-s1-u2-k14', name: '四声调', level: 3 },
      { id: 'ch-s1-u2-k15', name: '两拼三拼', level: 3 },
    ],
  },
  {
    id: 'ch-s1-u3',
    name: '课文（第五至六单元）',
    level: 1,
    children: [
      { id: 'ch-s1-u3-k1', name: '秋天', level: 3 },
      { id: 'ch-s1-u3-k2', name: '小小的船', level: 3 },
      { id: 'ch-s1-u3-k3', name: '江南', level: 3 },
      { id: 'ch-s1-u3-k4', name: '四季', level: 3 },
      { id: 'ch-s1-u3-k5', name: '影子', level: 3 },
      { id: 'ch-s1-u3-k6', name: '比尾巴', level: 3 },
      { id: 'ch-s1-u3-k7', name: '青蛙写诗', level: 3 },
      { id: 'ch-s1-u3-k8', name: '雨点儿', level: 3 },
    ],
  },
  {
    id: 'ch-s1-u4',
    name: '课文（第七至八单元）',
    level: 1,
    children: [
      { id: 'ch-s1-u4-k1', name: '明天要远足', level: 3 },
      { id: 'ch-s1-u4-k2', name: '大还是小', level: 3 },
      { id: 'ch-s1-u4-k3', name: '项链', level: 3 },
      { id: 'ch-s1-u4-k4', name: '雪地里的小画家', level: 3 },
      { id: 'ch-s1-u4-k5', name: '两件宝', level: 3 },
      { id: 'ch-s1-u4-k6', name: '古诗二首', level: 3 },
      { id: 'ch-s1-u4-k7', name: '雪孩子', level: 3 },
      { id: 'ch-s1-u4-k8', name: '小蜗牛', level: 3 },
    ],
  },
  {
    id: 'ch-s1-u6',
    name: '书写与识字',
    level: 1,
    children: [
      { id: 'ch-s1-u6-k1', name: '基本笔画', level: 3 },
      { id: 'ch-s1-u6-k2', name: '偏旁部首认知', level: 3 },
      { id: 'ch-s1-u6-k3', name: '汉字结构', level: 3 },
      { id: 'ch-s1-u6-k4', name: '正确坐姿和握笔', level: 3 },
      { id: 'ch-s1-u6-k5', name: '田字格书写规范', level: 3 },
    ],
  },
];

// Math knowledge points (苏教版 2024新版)
export const MATH_KPS: KnowledgePointNode[] = [
  {
    id: 'ma-s1-u1',
    name: '0~5的认识和加减法',
    level: 1,
    children: [
      { id: 'ma-s1-u1-k1', name: '认识0~5各数', level: 3 },
      { id: 'ma-s1-u1-k2', name: '几和第几', level: 3 },
      { id: 'ma-s1-u1-k3', name: '5以内数的分与合', level: 3 },
      { id: 'ma-s1-u1-k4', name: '5以内加法', level: 3 },
      { id: 'ma-s1-u1-k5', name: '5以内减法', level: 3 },
      { id: 'ma-s1-u1-k6', name: '0的认识和加减法', level: 3 },
      { id: 'ma-s1-u1-k7', name: '数的大小比较', level: 3 },
    ],
  },
  {
    id: 'ma-s1-u2',
    name: '生活中的位置',
    level: 1,
    children: [
      { id: 'ma-s1-u2-k1', name: '上下位置关系', level: 3 },
      { id: 'ma-s1-u2-k2', name: '前后位置关系', level: 3 },
      { id: 'ma-s1-u2-k3', name: '左右位置关系', level: 3 },
      { id: 'ma-s1-u2-k4', name: '用方位词描述物体位置', level: 3 },
    ],
  },
  {
    id: 'ma-s1-u3',
    name: '6~9的认识和加减法',
    level: 1,
    children: [
      { id: 'ma-s1-u3-k1', name: '认识6~9各数', level: 3 },
      { id: 'ma-s1-u3-k2', name: '6~9的分与合', level: 3 },
      { id: 'ma-s1-u3-k3', name: '6~9的加法', level: 3 },
      { id: 'ma-s1-u3-k4', name: '6~9的减法', level: 3 },
      { id: 'ma-s1-u3-k5', name: '连加', level: 3 },
      { id: 'ma-s1-u3-k6', name: '连减', level: 3 },
      { id: 'ma-s1-u3-k7', name: '加减混合运算', level: 3 },
    ],
  },
  {
    id: 'ma-s1-u4',
    name: '图形的初步认识（一）',
    level: 1,
    children: [
      { id: 'ma-s1-u4-k1', name: '认识长方体', level: 3 },
      { id: 'ma-s1-u4-k2', name: '认识正方体', level: 3 },
      { id: 'ma-s1-u4-k3', name: '认识圆柱', level: 3 },
      { id: 'ma-s1-u4-k4', name: '认识球', level: 3 },
      { id: 'ma-s1-u4-k5', name: '立体图形拼搭', level: 3 },
    ],
  },
  {
    id: 'ma-s1-u5',
    name: '10的认识和加减法',
    level: 1,
    children: [
      { id: 'ma-s1-u5-k1', name: '认识10', level: 3 },
      { id: 'ma-s1-u5-k2', name: '10的分与合', level: 3 },
      { id: 'ma-s1-u5-k3', name: '10的加减法', level: 3 },
      { id: 'ma-s1-u5-k4', name: '求未知加数', level: 3 },
    ],
  },
  {
    id: 'ma-s1-u7',
    name: '认识11~19',
    level: 1,
    children: [
      { id: 'ma-s1-u7-k1', name: '认识11~19各数', level: 3 },
      { id: 'ma-s1-u7-k2', name: '数位启蒙（1个十和几个一）', level: 3 },
      { id: 'ma-s1-u7-k3', name: '10加几和相应减法', level: 3 },
      { id: 'ma-s1-u7-k4', name: '20以内数的大小比较', level: 3 },
    ],
  },
];

// English knowledge points (译林版)
export const ENGLISH_KPS: KnowledgePointNode[] = [
  {
    id: 'en-s1-u1',
    name: 'Unit 1 I\'m Liu Tao',
    level: 1,
    children: [
      { id: 'en-s1-u1-k1', name: 'hello hi 打招呼', level: 3 },
      { id: 'en-s1-u1-k2', name: 'I\'m 自我介绍', level: 3 },
      { id: 'en-s1-u1-k3', name: 'goodbye bye 告别', level: 3 },
    ],
  },
  {
    id: 'en-s1-u2',
    name: 'Unit 2 Good morning',
    level: 1,
    children: [
      { id: 'en-s1-u2-k1', name: 'Good morning 上午问候', level: 3 },
      { id: 'en-s1-u2-k2', name: 'Good afternoon 下午问候', level: 3 },
      { id: 'en-s1-u2-k3', name: '称呼 Miss Mr', level: 3 },
    ],
  },
  {
    id: 'en-s1-u3',
    name: 'Unit 3 This is Miss Li',
    level: 1,
    children: [
      { id: 'en-s1-u3-k1', name: 'This is 介绍他人', level: 3 },
      { id: 'en-s1-u3-k2', name: 'my friend 认识朋友', level: 3 },
    ],
  },
  {
    id: 'en-s1-u4',
    name: 'Unit 4 Is this a teddy?',
    level: 1,
    children: [
      { id: 'en-s1-u4-k1', name: '一般疑问句 Is this...?', level: 3 },
      { id: 'en-s1-u4-k2', name: 'Yes it is / No it isn\'t', level: 3 },
      { id: 'en-s1-u4-k3', name: '玩具词汇', level: 3 },
    ],
  },
  {
    id: 'en-s1-u5',
    name: 'Unit 5 A cherry, please',
    level: 1,
    children: [
      { id: 'en-s1-u5-k1', name: '水果词汇', level: 3 },
      { id: 'en-s1-u5-k2', name: 'A ... please 礼貌请求', level: 3 },
      { id: 'en-s1-u5-k3', name: 'Thank you 感谢', level: 3 },
    ],
  },
  {
    id: 'en-s1-u6',
    name: 'Unit 6 Look at my balloon',
    level: 1,
    children: [
      { id: 'en-s1-u6-k1', name: 'Look at 展示物品', level: 3 },
      { id: 'en-s1-u6-k2', name: 'It\'s nice / Great 赞美', level: 3 },
    ],
  },
  {
    id: 'en-s1-u7',
    name: 'Unit 7 I can dance',
    level: 1,
    children: [
      { id: 'en-s1-u7-k1', name: 'I can 表达能力', level: 3 },
      { id: 'en-s1-u7-k2', name: 'Can you 询问能力', level: 3 },
      { id: 'en-s1-u7-k3', name: '动作词汇', level: 3 },
    ],
  },
  {
    id: 'en-s1-u8',
    name: 'Unit 8 Put on your coat',
    level: 1,
    children: [
      { id: 'en-s1-u8-k1', name: '衣物词汇', level: 3 },
      { id: 'en-s1-u8-k2', name: 'Put on 穿衣指令', level: 3 },
      { id: 'en-s1-u8-k3', name: 'Take off 脱衣指令', level: 3 },
    ],
  },
];

export function getAllKnowledgePoints(): { subjectId: number; points: KnowledgePointNode[] }[] {
  return [
    { subjectId: 1, points: CHINESE_KPS },
    { subjectId: 2, points: MATH_KPS },
    { subjectId: 3, points: ENGLISH_KPS },
  ];
}

export function flattenKnowledgePoints(): { id: string; name: string; subjectId: number; level: number; parentId: string | null }[] {
  const result: { id: string; name: string; subjectId: number; level: number; parentId: string | null }[] = [];

  for (const { subjectId, points } of getAllKnowledgePoints()) {
    for (const unit of points) {
      result.push({ id: unit.id, name: unit.name, subjectId, level: unit.level, parentId: null });
      if (unit.children) {
        for (const child of unit.children) {
          result.push({ id: child.id, name: child.name, subjectId, level: child.level, parentId: unit.id });
        }
      }
    }
  }

  return result;
}
