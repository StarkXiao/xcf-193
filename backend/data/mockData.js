const { v4: uuidv4 } = require('uuid');

const users = [
  {
    id: 'user-1',
    username: '月下独酌',
    avatar: '🌸',
    bio: '热爱幻想故事的创作者',
    createdAt: '2024-01-15'
  },
  {
    id: 'user-2',
    username: '星河漫步者',
    avatar: '⭐',
    bio: '喜欢探索不同的故事世界',
    createdAt: '2024-02-20'
  },
  {
    id: 'user-3',
    username: '梦境织者',
    avatar: '🌙',
    bio: '用文字编织浪漫梦境',
    createdAt: '2024-03-10'
  }
];

const stories = [
  {
    id: 'story-1',
    title: '浮城之恋',
    summary: '在漂浮于云端的城市中，一位普通的图书管理员意外遇见了神秘的银发少年...',
    cover: '🏰',
    authorId: 'user-1',
    authorName: '月下独酌',
    tags: ['奇幻', '恋爱', '冒险'],
    likes: 256,
    views: 1024,
    createdAt: '2024-04-01',
    updatedAt: '2024-05-10',
    status: 'ongoing',
    startNodeId: 'node-1-1',
    auditStatus: 'approved',
    auditLevel: 'G'
  },
  {
    id: 'story-2',
    title: '星海彼端的约定',
    summary: '星际时代，两位少女在废弃空间站相遇，命运的齿轮开始转动...',
    cover: '🚀',
    authorId: 'user-2',
    authorName: '星河漫步者',
    tags: ['科幻', '百合', '治愈'],
    likes: 189,
    views: 756,
    createdAt: '2024-03-15',
    updatedAt: '2024-04-28',
    status: 'completed',
    startNodeId: 'node-2-1',
    auditStatus: 'approved',
    auditLevel: 'G'
  },
  {
    id: 'story-3',
    title: '妖狐与书生',
    summary: '深山古寺中，赶考的书生邂逅了一只受伤的九尾狐...',
    cover: '🦊',
    authorId: 'user-3',
    authorName: '梦境织者',
    tags: ['古风', '奇幻', '恋爱'],
    likes: 342,
    views: 1280,
    createdAt: '2024-02-10',
    updatedAt: '2024-05-05',
    status: 'ongoing',
    startNodeId: 'node-3-1',
    auditStatus: 'pending',
    auditLevel: null
  },
  {
    id: 'story-4',
    title: '时光邮局',
    summary: '在城市的角落，有一家能寄信给过去的邮局。一封封信件，串联起跨越时空的温柔...',
    cover: '✉️',
    authorId: 'user-2',
    authorName: '星河漫步者',
    tags: ['治愈', '奇幻', '恋爱'],
    likes: 512,
    views: 2048,
    createdAt: '2024-01-20',
    updatedAt: '2024-04-15',
    status: 'completed',
    startNodeId: 'node-4-1',
    auditStatus: 'approved',
    auditLevel: 'G'
  },
  {
    id: 'story-5',
    title: '深海的鲸歌',
    summary: '海洋生物学家潜入深海，遇见了一只会唱歌的鲸鱼，以及守护海洋的神秘少女...',
    cover: '🐋',
    authorId: 'user-1',
    authorName: '月下独酌',
    tags: ['奇幻', '治愈', '冒险'],
    likes: 428,
    views: 1560,
    createdAt: '2024-03-05',
    updatedAt: '2024-05-12',
    status: 'ongoing',
    startNodeId: 'node-5-1',
    auditStatus: 'approved',
    auditLevel: 'G'
  },
  {
    id: 'story-6',
    title: '机甲少女的誓言',
    summary: '战火纷飞的未来世界，少女驾驶着古老的机甲，守护着最后的和平...',
    cover: '🤖',
    authorId: 'user-3',
    authorName: '梦境织者',
    tags: ['科幻', '冒险', '战斗'],
    likes: 678,
    views: 3200,
    createdAt: '2024-02-28',
    updatedAt: '2024-05-08',
    status: 'ongoing',
    startNodeId: 'node-6-1',
    auditStatus: 'approved',
    auditLevel: 'PG'
  },
  {
    id: 'story-7',
    title: '咖啡屋的猫咪',
    summary: '街角的咖啡屋里，每只猫咪都有自己的故事。而店长的秘密，才刚刚揭开...',
    cover: '🐱',
    authorId: 'user-2',
    authorName: '星河漫步者',
    tags: ['治愈', '日常', '奇幻'],
    likes: 856,
    views: 4100,
    createdAt: '2023-12-10',
    updatedAt: '2024-03-20',
    status: 'completed',
    startNodeId: 'node-7-1',
    auditStatus: 'approved',
    auditLevel: 'G'
  },
  {
    id: 'story-8',
    title: '剑与蔷薇',
    summary: '骑士团的女剑士与神秘的蔷薇魔女，在命运的十字路口相遇...',
    cover: '⚔️',
    authorId: 'user-1',
    authorName: '月下独酌',
    tags: ['奇幻', '冒险', '百合'],
    likes: 723,
    views: 2890,
    createdAt: '2024-01-15',
    updatedAt: '2024-05-01',
    status: 'completed',
    startNodeId: 'node-8-1',
    auditStatus: 'approved',
    auditLevel: 'PG'
  },
  {
    id: 'story-9',
    title: '星图师的旅程',
    summary: '绘制星图的少年，在旅行中遇见了来自星星的少女，他们的命运从此交错...',
    cover: '✨',
    authorId: 'user-3',
    authorName: '梦境织者',
    tags: ['奇幻', '冒险', '治愈'],
    likes: 234,
    views: 980,
    createdAt: '2024-04-20',
    updatedAt: '2024-05-15',
    status: 'ongoing',
    startNodeId: 'node-9-1',
    auditStatus: 'approved',
    auditLevel: 'G'
  },
  {
    id: 'story-10',
    title: '长安月下',
    summary: '大唐盛世，长安城的夜色下，一位画师与一位狐妖的浪漫邂逅...',
    cover: '🏮',
    authorId: 'user-2',
    authorName: '星河漫步者',
    tags: ['古风', '恋爱', '奇幻'],
    likes: 567,
    views: 2340,
    createdAt: '2024-02-14',
    updatedAt: '2024-04-30',
    status: 'completed',
    startNodeId: 'node-10-1',
    auditStatus: 'approved',
    auditLevel: 'G'
  },
  {
    id: 'story-11',
    title: '赛博朋克夜曲',
    summary: '霓虹闪烁的未来都市，黑客少年与歌姬人偶的禁忌之恋...',
    cover: '🌃',
    authorId: 'user-1',
    authorName: '月下独酌',
    tags: ['科幻', '恋爱', '赛博朋克'],
    likes: 892,
    views: 4560,
    createdAt: '2023-11-20',
    updatedAt: '2024-04-10',
    status: 'completed',
    startNodeId: 'node-11-1',
    auditStatus: 'approved',
    auditLevel: 'PG'
  },
  {
    id: 'story-12',
    title: '精灵森林的秘密',
    summary: '误入精灵森林的人类少女，遇见了守护森林的精灵王子，以及古老的秘密...',
    cover: '🧝',
    authorId: 'user-3',
    authorName: '梦境织者',
    tags: ['奇幻', '冒险', '恋爱'],
    likes: 345,
    views: 1450,
    createdAt: '2024-03-25',
    updatedAt: '2024-05-18',
    status: 'ongoing',
    startNodeId: 'node-12-1',
    auditStatus: 'approved',
    auditLevel: 'G'
  },
  {
    id: 'story-13',
    title: '幽灵列车',
    summary: '午夜十二点的站台，一列只有亡灵才能乘坐的列车。她，为什么能看见？',
    cover: '🚂',
    authorId: 'user-2',
    authorName: '星河漫步者',
    tags: ['奇幻', '悬疑', '治愈'],
    likes: 612,
    views: 2780,
    createdAt: '2024-01-05',
    updatedAt: '2024-03-28',
    status: 'completed',
    startNodeId: 'node-13-1',
    auditStatus: 'approved',
    auditLevel: 'PG'
  },
  {
    id: 'story-14',
    title: '云端上的面包店',
    summary: '在云层之上的小镇，有一家只在晴天营业的面包店。面包的味道，藏着天空的秘密...',
    cover: '🥐',
    authorId: 'user-1',
    authorName: '月下独酌',
    tags: ['治愈', '日常', '奇幻'],
    likes: 445,
    views: 1890,
    createdAt: '2024-04-01',
    updatedAt: '2024-05-20',
    status: 'ongoing',
    startNodeId: 'node-14-1',
    auditStatus: 'approved',
    auditLevel: 'G'
  },
  {
    id: 'story-15',
    title: '末世微光',
    summary: '世界毁灭后的第一百年，少女在废墟中遇见了最后的机器人...',
    cover: '🌅',
    authorId: 'user-3',
    authorName: '梦境织者',
    tags: ['科幻', '治愈', '冒险'],
    likes: 756,
    views: 3450,
    createdAt: '2023-10-15',
    updatedAt: '2024-02-20',
    status: 'completed',
    startNodeId: 'node-15-1',
    auditStatus: 'approved',
    auditLevel: 'PG'
  }
];

const storyNodes = {
  'story-1': [
    {
      id: 'node-1-1',
      storyId: 'story-1',
      title: '第一章：云中之城',
      content: `浮城，一座漂浮在万米高空之上的奇迹之城。

我叫林小雨，是这座城市中央图书馆的一名普通管理员。每天的工作就是整理那些古老的书籍，在字里行间寻找着属于别人的故事。

"请问...这里有关于天空之境的书吗？"

一个清冷的声音在身后响起。我转过身，看见一个银发的少年站在书架旁。他的眼睛是淡紫色的，像是笼罩着一层薄雾。

他穿着一袭白衣，与图书馆古旧的氛围格格不入，却又莫名地和谐。`,
      choices: [
        { id: 'choice-1-1-1', text: '热情地帮他找书', nextNodeId: 'node-1-2a' },
        { id: 'choice-1-1-2', text: '保持距离，指给他方向', nextNodeId: 'node-1-2b' }
      ],
      isEnding: false,
      referencedEntries: [
        { worldId: 'world-1', worldName: '浮城世界观', entryId: 'entry-1', entryTitle: '浮城', entryCategory: '地理' },
        { worldId: 'world-1', worldName: '浮城世界观', entryId: 'entry-2', entryTitle: '天空之境', entryCategory: '传说' }
      ]
    },
    {
      id: 'node-1-2a',
      storyId: 'story-1',
      title: '第二章：神秘的访客',
      content: `"当然有！请跟我来。"我热情地领着他走向古籍区。

一路上，我偷偷打量着他。银发在阳光下闪烁着珍珠般的光泽，他的步伐轻盈得不像是踩在地上。

"你是第一次来图书馆吗？"我忍不住开口问道。

他微微一怔，随即露出一个浅淡的微笑："嗯，是第一次。我...寻找天空之境很久了。"

"天空之境据说在云层之上的更高处，是一个传说中的地方呢。"我一边说着，一边抽出一本泛黄的古籍。

他接过书，指尖不小心触碰到我的手。一阵冰凉的触感传来，像是触摸到了一片雪花。`,
      choices: [
        { id: 'choice-1-2a-1', text: '询问他的名字', nextNodeId: 'node-1-3a' },
        { id: 'choice-1-2a-2', text: '邀请他明天再来', nextNodeId: 'node-1-3b' }
      ],
      isEnding: false,
      referencedEntries: [
        { worldId: 'world-1', worldName: '浮城世界观', entryId: 'entry-3', entryTitle: '天空守护者', entryCategory: '种族' }
      ]
    },
    {
      id: 'node-1-2b',
      storyId: 'story-1',
      title: '第二章：擦肩而过',
      content: `"古籍区在那边。"我淡淡地指了指方向，继续整理手中的书籍。

"谢谢。"他轻声说道，然后转身离去。

我望着他的背影，不知为何，心里泛起一丝莫名的失落。银发白衣，像是一场转瞬即逝的梦。

摇摇头，我继续自己的工作。也许只是一个普通的访客吧。

然而，当天下班时，我在图书馆门口又遇见了他。他靠在栏杆上，望着远方的云海，神情落寞。`,
      choices: [
        { id: 'choice-1-2b-1', text: '上前打招呼', nextNodeId: 'node-1-3c' },
        { id: 'choice-1-2b-2', text: '悄悄离开', nextNodeId: 'node-1-3d' }
      ],
      isEnding: false
    },
    {
      id: 'node-1-3a',
      storyId: 'story-1',
      title: '结局：天空的守护者',
      content: `"我叫...辰。"他顿了顿，补充道，"我是天空的守护者。"

我愣住了，以为他在开玩笑。但他认真的眼神不像是在说谎。

"天空之境...是我的家。"他望着窗外的云海，"但我已经回不去了。"

不知从哪里来的勇气，我握住了他的手："没关系，浮城也可以是你的家。"

他转过头，紫色的眼眸中映着我的身影。然后，他笑了，那笑容像是冰雪初融。

"谢谢你，小雨。"

后来，辰成为了图书馆的常客。我们一起读书，一起看云，一起在浮城的大街小巷留下足迹。

虽然我不知道他来自哪里，也不知道他终将去往何方。但我知道，此刻的幸福，是真实的。

【结局达成：天空的守护者】`,
      choices: [],
      isEnding: true,
      endingType: 'good',
      referencedEntries: [
        { worldId: 'world-1', worldName: '浮城世界观', entryId: 'entry-2', entryTitle: '天空之境', entryCategory: '传说' },
        { worldId: 'world-1', worldName: '浮城世界观', entryId: 'entry-3', entryTitle: '天空守护者', entryCategory: '种族' }
      ]
    },
    {
      id: 'node-1-3b',
      storyId: 'story-1',
      title: '结局：未完的故事',
      content: `"明天...你还会来吗？"我鼓起勇气问道。

他愣了一下，然后轻轻点头："会的。"

第二天，他真的来了。第三天，第四天...他成了图书馆的常客。

我们一起讨论书中的故事，一起分享彼此的梦想。他从不提自己的来历，我也从不问。

有些故事，不需要知道结局。过程本身，就是最美的风景。

直到有一天，他没有再来。

桌上留着一本书，扉页上写着一行字："谢谢你，让我拥有了一段美好的时光。——辰"

我望着窗外的云海，心里空空的，却又满满的。

有些相遇，注定是生命中的惊鸿一瞥。但那份温暖，会永远留在心底。

【结局达成：未完的故事】`,
      choices: [],
      isEnding: true,
      endingType: 'normal'
    },
    {
      id: 'node-1-3c',
      storyId: 'story-1',
      title: '第三章：月下谈心',
      content: `"你怎么还在这里？"我走上前，轻声问道。

他转过头，看见是我，眼中闪过一丝惊讶："你...下班了？"

"嗯。"我走到他身边，也靠在栏杆上，"在看什么？"

"云海。"他淡淡地说，"我的家乡，也有这样的云海。"

"你的家乡在哪里？"我好奇地问。

他沉默了片刻，然后说："一个...很远的地方。"

月光洒在他的银发上，泛着柔和的光芒。那一刻，我忽然觉得，他像是不属于这个世界的精灵。`,
      choices: [
        { id: 'choice-1-3c-1', text: '邀请他一起吃晚饭', nextNodeId: 'node-1-4a' },
        { id: 'choice-1-3c-2', text: '陪他看一会儿云', nextNodeId: 'node-1-4b' }
      ],
      isEnding: false
    },
    {
      id: 'node-1-3d',
      storyId: 'story-1',
      title: '结局：错过',
      content: `我没有上前，而是悄悄地绕开了。

有些相遇，注定只是擦肩而过。

后来，我再也没有见过那个银发少年。

有时候，我会想起那个下午，想起那个清冷的声音，想起那双紫色的眼眸。

如果那天，我上前打了招呼，故事会不会不一样？

没有人知道答案。

浮城的云海依旧每天翻滚，图书馆的书籍依旧每天被整理。

只是，在某个不经意的瞬间，心里会泛起一丝淡淡的遗憾。

【结局达成：错过】`,
      choices: [],
      isEnding: true,
      endingType: 'bad'
    },
    {
      id: 'node-1-4a',
      storyId: 'story-1',
      title: '结局：烟火人间',
      content: `"要不要一起吃点东西？我知道附近有一家很好吃的小店。"我发出邀请。

他有些惊讶，但还是点了点头。

那是一家卖云吞面的小店，热气腾腾的，很有烟火气。

他笨拙地拿着筷子，惹得我偷偷发笑。

"很好吃。"他吃完后，认真地说。

看着他满足的样子，我心里暖暖的。

后来，我们经常一起来这家小店吃面。他说，这是他第一次感受到"人间烟火"的味道。

再后来，他成了这家小店的常客，也成了我生命中的常客。

也许他来自一个遥远的地方，也许他有很多秘密。但此刻，他就在我身边，这就够了。

【结局达成：烟火人间】`,
      choices: [],
      isEnding: true,
      endingType: 'good'
    },
    {
      id: 'node-1-4b',
      storyId: 'story-1',
      title: '结局：云之彼端',
      content: `我们就这样静静地站着，谁也没有说话。

风轻轻吹过，带来云海特有的湿润气息。

"谢谢你。"他忽然开口。

"谢什么？"

"谢谢你...愿意陪我。"他转过头，紫色的眼眸中映着月光，"很久没有人愿意这样陪着我了。"

我看着他，心里涌起一股莫名的情绪。

"以后，我可以经常陪你。"话一出口，我自己都愣住了。

他也愣住了，然后，露出了一个极浅极淡的笑容。

"好。"

那天之后，我们常常一起看云，一起看月，一起看浮城的日出日落。

他告诉我，他叫辰，来自一个叫做"天空之境"的地方。

我没有问他为什么会在这里，也没有问他会不会离开。

我只知道，有他在的每一天，都很美好。

【结局达成：云之彼端】`,
      choices: [],
      isEnding: true,
      endingType: 'good'
    }
  ],
  'story-2': [
    {
      id: 'node-2-1',
      storyId: 'story-2',
      title: '序章：废弃空间站',
      content: `公元3024年，星际航行时代。

我是苏晓，一名星际考古学研究员。这次的任务，是探索一座废弃了两百年的空间站——"北辰号"。

空间站漂浮在一片小行星带中，寂静而神秘。

"准备好了吗？"我对着通讯器问道。

"准备好了，苏博士。"助手的声音传来，"不过...这座空间站的能量读数有点奇怪。"

"怎么奇怪？"

"它似乎...还在运转。"

我皱起眉头。一座废弃了两百年的空间站，怎么可能还在运转？`,
      choices: [
        { id: 'choice-2-1-1', text: '谨慎行事，先做外部扫描', nextNodeId: 'node-2-2a' },
        { id: 'choice-2-1-2', text: '直接进入空间站探索', nextNodeId: 'node-2-2b' }
      ],
      isEnding: false,
      referencedEntries: [
        { worldId: 'world-2', worldName: '星际时代', entryId: 'entry-4', entryTitle: '星际联邦', entryCategory: '政治' },
        { worldId: 'world-2', worldName: '星际时代', entryId: 'entry-5', entryTitle: '超光速航行', entryCategory: '科技' },
        { worldId: 'world-2', worldName: '星际时代', entryId: 'entry-6', entryTitle: '北辰号空间站', entryCategory: '地点' }
      ]
    },
    {
      id: 'node-2-2a',
      storyId: 'story-2',
      title: '第二章：意外的发现',
      content: `我决定先进行外部扫描，确保安全。

扫描结果让我大吃一惊——空间站内部居然有生命反应！

"不可能..."我喃喃自语，"两百年了，怎么可能还有生命存活？"

"苏博士，要不要撤退？"助手的声音带着紧张。

我沉默了片刻，然后说："不，我们进去看看。"

穿上宇航服，我小心翼翼地进入了空间站。

让我意外的是，空间站内部的空气居然还能呼吸，温度也适宜。就好像...这里从来没有被废弃过一样。`,
      choices: [
        { id: 'choice-2-2a-1', text: '前往生命反应所在地', nextNodeId: 'node-2-3a' },
        { id: 'choice-2-2a-2', text: '先去控制室查看日志', nextNodeId: 'node-2-3b' }
      ],
      isEnding: false
    },
    {
      id: 'node-2-2b',
      storyId: 'story-2',
      title: '第二章：神秘的少女',
      content: `我迫不及待地进入了空间站。

里面的景象让我震惊——一切都井然有序，就好像昨天还有人在这里生活一样。

走廊里的灯光明亮，空气清新，甚至还能听到隐隐约约的音乐声。

"有人吗？"我试探性地喊道。

没有人回应。

我沿着走廊往前走，最后在一个培养舱前停下了脚步。

培养舱里，漂浮着一个少女。她有着淡蓝色的长发，闭着眼睛，像是在沉睡。

而培养舱上的标签写着："实验体编号：A-01，沉睡时间：198年"`,
      choices: [
        { id: 'choice-2-2b-1', text: '唤醒她', nextNodeId: 'node-2-3c' },
        { id: 'choice-2-2b-2', text: '先搞清楚状况', nextNodeId: 'node-2-3b' }
      ],
      isEnding: false,
      referencedEntries: [
        { worldId: 'world-2', worldName: '星际时代', entryId: 'entry-6', entryTitle: '北辰号空间站', entryCategory: '地点' }
      ]
    },
    {
      id: 'node-2-3a',
      storyId: 'story-2',
      title: '第三章：苏醒',
      content: `我朝着生命反应所在地走去，最后停在了一个培养舱前。

培养舱里漂浮着一个少女，淡蓝色的长发在液体中飘散，美得像是一幅画。

"她...还活着？"我难以置信。

这时，培养舱的盖子忽然缓缓打开。

少女睁开了眼睛——那是一双金色的眼眸，像是两团温暖的火焰。

她看着我，嘴唇轻启："你...是谁？"

她的声音很轻，像是从很远的地方传来。

我深吸一口气，尽量让自己的声音听起来温和："我叫苏晓，是一名星际考古学家。你...你是谁？"

少女歪了歪头，似乎在思考。然后，她摇摇头："我...不记得了。"`,
      choices: [
        { id: 'choice-2-3a-1', text: '带她离开这里', nextNodeId: 'node-2-4a' },
        { id: 'choice-2-3a-2', text: '帮她找回记忆', nextNodeId: 'node-2-4b' }
      ],
      isEnding: false
    },
    {
      id: 'node-2-3b',
      storyId: 'story-2',
      title: '第三章：真相的碎片',
      content: `我决定先去控制室查看日志，了解这座空间站的历史。

控制室里的电脑居然还能开机。我翻阅着日志，逐渐拼凑出了事情的真相。

原来，这座空间站是一个秘密实验室，进行着人类永生的实验。

实验体A-01，是唯一一个成功的案例。她获得了永生，但代价是...失去了所有记忆，并且陷入了长久的沉睡。

日志的最后一条，是两百年前写的：

"实验成功了，但我们都错了。永生不是恩赐，而是诅咒。A-01，如果你看到这条日志，忘了这一切吧。去做一个普通人，过普通的生活。——李博士"

我合上日志，心情复杂。`,
      choices: [
        { id: 'choice-2-3b-1', text: '去找到那个少女', nextNodeId: 'node-2-3c' },
        { id: 'choice-2-3b-2', text: '决定离开，不打扰她', nextNodeId: 'node-2-4c' }
      ],
      isEnding: false
    },
    {
      id: 'node-2-3c',
      storyId: 'story-2',
      title: '第四章：初见',
      content: `我找到那个少女时，她正站在一扇舷窗前，望着外面的星空。

听到脚步声，她转过头来。

"你是谁？"她问道，金色的眼眸里满是好奇。

"我叫苏晓。"我走到她身边，"你呢？你记得自己叫什么吗？"

她低下头，似乎在努力回想。然后，她摇摇头："不记得了。我什么都不记得了。"

她的声音里带着一丝迷茫和恐慌。

"没关系。"我轻声说，"想不起来就不要想了。我...我可以给你起个名字吗？"

她抬起头，看着我，然后轻轻点了点头。

我望着她淡蓝色的头发，和窗外的星空，忽然有了灵感："叫你星蓝，好吗？"

"星蓝..."她念着这个名字，然后露出了一个浅浅的笑容，"我喜欢这个名字。"`,
      choices: [
        { id: 'choice-2-3c-1', text: '带她一起离开', nextNodeId: 'node-2-4a' },
        { id: 'choice-2-3c-2', text: '陪她在空间站待一段时间', nextNodeId: 'node-2-4d' }
      ],
      isEnding: false
    },
    {
      id: 'node-2-4a',
      storyId: 'story-2',
      title: '结局：星河旅人',
      content: `我带着星蓝离开了空间站，回到了我的飞船上。

"这就是外面的世界吗？"星蓝趴在舷窗边，兴奋地看着外面的星空。

"嗯。"我站在她身边，"宇宙很大，有无数的星系和星球。我们可以一个一个地去探索。"

"真的吗？"她转过头，金色的眼眸闪闪发光，"那...我们会一直在一起吗？"

我看着她，心里涌起一股暖流。

"会的。"我郑重地说，"我们会一直在一起。"

从那以后，星蓝成了我的搭档，我们一起探索宇宙的每一个角落。

她有着超乎常人的学习能力，很快就掌握了各种知识和技能。

有时候，她会问起自己的过去。但每次，我都会告诉她："过去不重要，重要的是现在和未来。"

因为有彼此，宇宙中的每一次旅行都不再孤单。

我们是星河旅人，也是彼此的归宿。

【结局达成：星河旅人】`,
      choices: [],
      isEnding: true,
      endingType: 'good'
    },
    {
      id: 'node-2-4b',
      storyId: 'story-2',
      title: '结局：记忆的重量',
      content: `我决定帮星蓝找回记忆。

我们在空间站里寻找着各种线索，一点一点地拼凑着她的过去。

然而，随着记忆的碎片越来越多，星蓝的表情却越来越沉重。

"苏晓..."有一天，她忽然对我说，"如果我的过去很可怕...你还会愿意和我在一起吗？"

"当然。"我握住她的手，"无论你的过去是什么样的，你就是你。我喜欢的是现在的你。"

星蓝看着我，眼眶泛红。

最后，我们还是找到了所有的记忆。原来，她曾经是这个实验室的首席科学家，为了永生的实验，自愿成为了实验体。

但她失去的，不仅仅是记忆，还有她曾经的情感和人性。

"我...我是个怪物吗？"她颤抖着问。

"不是。"我紧紧抱住她，"你是星蓝，是我认识的那个好奇、善良、喜欢看星星的星蓝。"

那天之后，星蓝不再纠结于过去。她选择放下一切，和我一起开始新的生活。

有些记忆，遗忘反而是一种幸运。

而有些遇见，则是命中注定。

【结局达成：记忆的重量】`,
      choices: [],
      isEnding: true,
      endingType: 'normal'
    },
    {
      id: 'node-2-4c',
      storyId: 'story-2',
      title: '结局：各自的轨道',
      content: `我决定离开，不打扰那个沉睡的少女。

也许，让她继续沉睡，才是最好的选择。

我带着空间站的日志和资料，回到了自己的飞船。

"苏博士，我们不进去看看吗？"助手问道。

"不用了。"我望着窗外的空间站，"就让它继续沉睡吧。"

后来，我把这座空间站的位置报告给了星际考古局，但我再也没有回去过。

有时候，我会想起那个培养舱里的少女，想起她淡蓝色的长发。

她会醒来吗？醒来后会怎么样呢？

我不知道，也不想知道。

有些人，注定只是生命中的过客，即使从未真正相遇。

我们都有各自的轨道，偶然交汇，然后渐行渐远。

这就是宇宙的法则，也是人生的常态。

【结局达成：各自的轨道】`,
      choices: [],
      isEnding: true,
      endingType: 'normal'
    },
    {
      id: 'node-2-4d',
      storyId: 'story-2',
      title: '结局：两个人的空间站',
      content: `我决定陪星蓝在空间站里待一段时间。

日子一天天过去，我教她各种知识，她带我探索空间站的每一个角落。

我们一起看日出日落，一起在失重状态下漂浮，一起分享彼此的故事。

"苏晓，"有一天，星蓝忽然说，"我不想离开这里了。"

"为什么？"

"因为...这里有你啊。"她红着脸说，"只要有你在，在哪里都一样。"

我愣住了，然后，心跳不受控制地加速。

"星蓝..."

"我知道我这样很自私。"她低下头，"但是...我想和你一直在这里。只有我们两个人的空间站...不好吗？"

我走到她面前，轻轻抬起她的脸："好。"

"真的吗？"她的眼睛亮了起来。

"嗯。"我笑着说，"只要和你在一起，在哪里都好。"

从那以后，这座废弃的空间站不再废弃。它成了我们的家，一个只属于我们两个人的小世界。

宇宙很大，但我们的世界很小，小到只能容下彼此。

这样，就足够了。

【结局达成：两个人的空间站】`,
      choices: [],
      isEnding: true,
      endingType: 'good'
    }
  ],
  'story-3': [
    {
      id: 'node-3-1',
      storyId: 'story-3',
      title: '第一章：深山古寺',
      content: `我叫柳墨言，是一个赶考的书生。

为了赴京赶考，我日夜兼程，却没想到在深山中迷了路。

天色渐晚，正当我走投无路的时候，远处传来了钟声。

循着钟声，我找到了一座古寺。

寺门半掩着，里面静悄悄的。

"请问有人吗？"我试探性地喊道。

没有人回应。

我犹豫了一下，还是推开门走了进去。

院子里落满了枫叶，红得像是燃烧的火焰。而在那片火红中，我看到了一抹白色。

那是一只狐狸，一只九尾白狐。

它受了伤，后腿上有一道很深的伤口，鲜血染红了周围的枫叶。`,
      choices: [
        { id: 'choice-3-1-1', text: '上前帮助它', nextNodeId: 'node-3-2a' },
        { id: 'choice-3-1-2', text: '保持警惕，远远观察', nextNodeId: 'node-3-2b' }
      ],
      isEnding: false,
      referencedEntries: [
        { worldId: 'world-3', worldName: '大靖王朝', entryId: 'entry-9', entryTitle: '九尾狐', entryCategory: '种族' }
      ]
    },
    {
      id: 'node-3-2a',
      storyId: 'story-3',
      title: '第二章：受伤的九尾狐',
      content: `我虽然有些害怕，但还是忍不住走上前去。

九尾狐看到我靠近，警惕地抬起头，金色的眼眸里满是戒备。

"别怕，我不会伤害你的。"我尽量让自己的声音听起来温和。

我从行囊里取出伤药和纱布——这些都是为了以防万一准备的，没想到会用在这里。

它似乎听懂了我的话，没有再挣扎。

我小心翼翼地帮它清理伤口，敷上药，然后用纱布包扎好。

它的皮毛很柔软，像是最上等的丝绸。九条尾巴轻轻摆动着，似乎在表达什么。

"好了。"我包扎完，松了一口气，"你在这里好好休息吧。"

我站起身，准备找个地方过夜。然而，就在这时，九尾狐忽然发出了一道耀眼的白光。

我下意识地闭上眼。等我再睁开眼时，眼前的狐狸不见了，取而代之的是一个白衣少女。

她有着一头雪白的长发，金色的眼眸，身后还拖着九条毛茸茸的尾巴。

"多谢公子相救。"她轻轻躬身，声音清泠动听。`,
      choices: [
        { id: 'choice-3-2a-1', text: '惊讶地询问她的身份', nextNodeId: 'node-3-3a' },
        { id: 'choice-3-2a-2', text: '镇定地接受这个事实', nextNodeId: 'node-3-3b' }
      ],
      isEnding: false,
      referencedEntries: [
        { worldId: 'world-3', worldName: '大靖王朝', entryId: 'entry-8', entryTitle: '妖族', entryCategory: '种族' },
        { worldId: 'world-3', worldName: '大靖王朝', entryId: 'entry-9', entryTitle: '九尾狐', entryCategory: '种族' }
      ]
    },
    {
      id: 'node-3-2b',
      storyId: 'story-3',
      title: '第二章：远远的守望',
      content: `我不敢靠近，只是远远地观察着这只九尾狐。

它显然受了很重的伤，连站起来的力气都没有。但即便如此，它依然保持着警惕，金色的眼眸时不时地扫视四周。

"真是只漂亮的狐狸。"我忍不住赞叹道。

也许是听到了我的声音，它转过头，直直地看向我。

四目相对，我竟然有种心跳加速的感觉。

它的眼睛太美了，像是两团金色的火焰，又像是两轮秋日的暖阳。

就这样，我站在原地，它趴在枫叶中，我们就这样对视着。

不知过了多久，它忽然虚弱地倒了下去。

我一惊，再也顾不得害怕，冲了过去。`,
      choices: [
        { id: 'choice-3-2b-1', text: '救下它并带它离开', nextNodeId: 'node-3-3c' },
        { id: 'choice-3-2b-2', text: '就在这里照顾它', nextNodeId: 'node-3-3d' }
      ],
      isEnding: false
    },
    {
      id: 'node-3-3a',
      storyId: 'story-3',
      title: '第三章：狐妖小九',
      content: `"你...你是什么人？"我震惊地后退了一步。

少女微微一笑："公子别怕，我不是坏人。我叫小九，是...一只狐妖。"

"狐...狐妖？"我感觉自己的脑子有点转不过来。

"嗯。"她点点头，"我在山中修炼，不小心被猎人的陷阱所伤。多谢公子出手相救。"

我深吸一口气，努力让自己冷静下来。

"你...你不会伤害我吧？"我小心翼翼地问。

小九愣了一下，然后笑了起来："公子救了我，我怎么会伤害你呢？我们妖也是有恩报恩的。"

她笑起来很好看，眼睛弯成了月牙，身后的九条尾巴也欢快地摆动着。

看着她这个样子，我心中的恐惧渐渐消散了。

"那...你需要我帮你什么吗？"我问道。

小九歪了歪头："公子要进京赶考对吧？"

"你怎么知道？"

"我闻出来的。"她指了指我的行囊，"有书卷的味道。"

我哑然失笑。

"这样吧，"小九忽然说，"公子救了我，我护送公子进京，一路上保护公子，就当是报恩了，怎么样？"`,
      choices: [
        { id: 'choice-3-3a-1', text: '答应她的提议', nextNodeId: 'node-3-4a' },
        { id: 'choice-3-3a-2', text: '婉言谢绝', nextNodeId: 'node-3-4b' }
      ],
      isEnding: false,
      referencedEntries: [
        { worldId: 'world-3', worldName: '大靖王朝', entryId: 'entry-9', entryTitle: '九尾狐', entryCategory: '种族' }
      ]
    },
    {
      id: 'node-3-3b',
      storyId: 'story-3',
      title: '第三章：古寺之夜',
      content: `"原来这世上真的有妖。"我喃喃道，倒也不是特别惊讶。

毕竟，深山古寺，遇仙遇妖，本就是志怪小说里常见的桥段。

"公子不害怕吗？"小九有些好奇地看着我。

"怕什么？"我笑了笑，"你又不会吃了我。而且，是我救了你，你总不会恩将仇报吧？"

小九也笑了："公子真是个有趣的人。"

那天晚上，我们在古寺里聊了很多。

小九告诉我，她在这座山里修炼了三百年，化形也才不过几十年。

我也跟她讲了很多山外面的事情，讲了京城的繁华，讲了书中的故事。

她听得很入神，金色的眼眸亮晶晶的。

"外面的世界...真的有那么精彩吗？"她向往地问。

"嗯，很精彩。"我点点头，"有机会的话，你应该自己去看看。"

"真的可以吗？"

"当然。"我笑着说，"如果你愿意，我可以带你一起去京城。"`,
      choices: [
        { id: 'choice-3-3b-1', text: '带她一起去京城', nextNodeId: 'node-3-4a' },
        { id: 'choice-3-3b-2', text: '让她留在这里修炼', nextNodeId: 'node-3-4c' }
      ],
      isEnding: false
    },
    {
      id: 'node-3-3c',
      storyId: 'story-3',
      title: '第三章：一路同行',
      content: `我抱起九尾狐，找了个安全的地方安置下来。

它很轻，抱在怀里就像是抱着一团棉花。

我拿出干粮和水，它却只是嗅了嗅，没有吃。

"你不吃东西吗？"我疑惑地问。

它只是懒洋洋地睁了睁眼，又闭上了。

我无奈地摇摇头，开始自己吃东西。

就这样，我在山里待了三天，照顾这只受伤的九尾狐。

第三天的时候，它的伤好了很多，已经能站起来了。

但奇怪的是，它并没有离开的意思，反而一直跟在我身边。

"你跟着我做什么？"我笑着问它。

它歪了歪头，然后用头蹭了蹭我的手。

我心里一动，忽然有了个念头。

"你...要不要跟我一起走？"

它的眼睛亮了起来，九条尾巴欢快地摆动着。

就这样，我带着一只九尾狐，踏上了进京的路。`,
      choices: [
        { id: 'choice-3-3c-1', text: '一人一狐继续赶路', nextNodeId: 'node-3-4d' },
        { id: 'choice-3-3c-2', text: '在山中多待几天', nextNodeId: 'node-3-4e' }
      ],
      isEnding: false
    },
    {
      id: 'node-3-3d',
      storyId: 'story-3',
      title: '第三章：古寺相守',
      content: `我决定就在这座古寺里照顾这只九尾狐。

每天，我会出去采些草药，给它换药。

它一开始还很警惕，但渐渐地，对我越来越亲近。

它会趴在我身边，看我读书写字；会在我发呆的时候，用头蹭蹭我的手。

我给它起了个名字，叫"白九"——因为它是白色的，有九条尾巴。

日子一天天过去，白九的伤渐渐好了起来。但它并没有离开，依然每天陪着我。

有时候，我会觉得有些奇怪——这只狐狸似乎太通人性了。

但我没有多想。有个伴，总比一个人好。

有一天晚上，我做了一个梦。

梦里，白九变成了一个白衣少女，有着金色的眼眸和雪白的长发。

她对我说："谢谢你，公子。"

醒来后，我发现白九正趴在我身边，金色的眼眸一眨不眨地看着我。

"是梦吗..."我喃喃道。`,
      choices: [
        { id: 'choice-3-3d-1', text: '继续赶路进京', nextNodeId: 'node-3-4d' },
        { id: 'choice-3-3d-2', text: '留下来，不走了', nextNodeId: 'node-3-4f' }
      ],
      isEnding: false
    },
    {
      id: 'node-3-4a',
      storyId: 'story-3',
      title: '结局：京城烟火',
      content: `我带着小九一起进京了。

一路上，我们遇到了很多事。有小九在，所有的危险都迎刃而解。

她虽然是妖，但心地善良，一路上帮了很多人。

到了京城后，我安顿下来，专心备考。

小九则对京城的一切都充满了好奇。她每天都出去逛，回来时总会带一些有趣的小玩意儿。

"墨言墨言，你看这个！"她举着一串糖葫芦跑进来，"这个好好吃！"

看着她开心的样子，我也跟着开心。

考试那天，小九送我到考场门口。

"加油哦。"她笑着说，"我相信你一定可以的。"

我点点头，走进了考场。

放榜那天，我看到了自己的名字——第一名，状元。

我高中状元了。

但奇怪的是，我并没有想象中那么开心。

我回到住处，小九正在院子里等我。

"怎么样？考中了吗？"她期待地问。

"中了。"我说，"状元。"

"哇！好厉害！"她兴奋地跳了起来。

我看着她，忽然说："小九，我不想做官了。"

"为什么？"她愣住了。

"因为..."我走到她面前，认真地说，"我想和你一起，去看更多的风景。京城虽好，但没有你的话，便毫无意义。"

小九的脸红了，身后的九条尾巴不自觉地摆动着。

"真的吗？"她小声问。

"嗯。"我点点头，"你愿意...一直陪着我吗？"

她抬起头，金色的眼眸里闪着泪光，然后用力点头："我愿意！"

后来，我辞去了官职，带着小九游山玩水。

我们看过江南的烟雨，看过塞北的飞雪，看过东海的日出，看过西山的晚霞。

有小九在身边，每一天都像是新的。

人妖殊途又如何？只要心意相通，便能跨越一切。

【结局达成：京城烟火】`,
      choices: [],
      isEnding: true,
      endingType: 'good',
      referencedEntries: [
        { worldId: 'world-3', worldName: '大靖王朝', entryId: 'entry-7', entryTitle: '大靖王朝', entryCategory: '政治' }
      ]
    },
    {
      id: 'node-3-4b',
      storyId: 'story-3',
      title: '结局：擦肩而过',
      content: `"多谢姑娘好意，不过..."我摇摇头，"男女授受不亲，而且人妖殊途，我们...还是保持距离比较好。"

小九脸上的笑容消失了。

"这样啊..."她低下头，声音有些失落，"也是呢。"

那天之后，小九就离开了。

我继续赶路进京，一路上总觉得少了点什么。

后来，我高中进士，做了官。

但我常常会想起那座古寺，那片火红的枫叶，那只九尾白狐，还有那个白衣少女。

如果当初，我答应了她，结果会不会不一样？

没有人知道答案。

多年后，我告老还乡，又经过了那座深山。

古寺还在，枫叶依旧红得像火。

只是，再也看不到那抹白色的身影了。

我站在院子里，久久不语。

"小九...你还好吗？"

没有人回答。

只有风吹过枫叶的声音，沙沙作响，像是在诉说着什么。

有些相遇，错过了，便是一生。

【结局达成：擦肩而过】`,
      choices: [],
      isEnding: true,
      endingType: 'bad'
    },
    {
      id: 'node-3-4c',
      storyId: 'story-3',
      title: '结局：山中岁月长',
      content: `"你还是留在这里修炼吧。"我对小九说，"外面的世界虽然精彩，但也很危险。"

小九看着我，眼神里有些不舍。

"那...公子还会来看我吗？"

"会的。"我点点头，"等我考完试，有时间了，一定来看你。"

"一言为定？"

"一言为定。"

那天之后，我离开了古寺，继续进京赶考。

后来，我高中进士，做了官。

但官场沉浮，人心险恶，我渐渐感到疲惫。

有一天，我终于厌倦了，辞了官，回到了那座深山。

古寺还在，小九也还在。

"你回来了。"她看到我，笑着说，眼里满是欢喜。

"嗯，我回来了。"我也笑了，"以后，我不走了。"

"真的吗？"她的眼睛亮了起来。

"真的。"

从那以后，我就在这座古寺里住了下来。

每天，我读书写字，小九就陪在我身边。

山中岁月长，有她相伴，便不觉得寂寞。

春华秋实，寒来暑往。

一年又一年，我渐渐老去，而小九依旧是那副少女模样。

"墨言..."有一天，她担忧地说，"你..."

"我知道。"我握住她的手，"生老病死，人之常情。但能和你一起度过这些年，我已经很满足了。"

她的眼眶红了。

"不过..."我笑着说，"下辈子，我还来找你，好不好？"

她用力点头，眼泪掉了下来。

"好，我等你。"

【结局达成：山中岁月长】`,
      choices: [],
      isEnding: true,
      endingType: 'normal'
    },
    {
      id: 'node-3-4d',
      storyId: 'story-3',
      title: '结局：一人一狐',
      content: `我带着白九继续赶路。

一路上，白九成了我最好的伙伴。

它很聪明，总能找到最好走的路，总能找到最干净的水源。

有时候，我甚至觉得它能听懂我说的每一句话。

到了京城后，我租了个小院子，白九就陪我住在那里。

我读书的时候，它就趴在旁边睡觉；我出去的时候，它就在门口等我回来。

日子过得平静而温馨。

考试那天，白九送我到门口，用头蹭了蹭我的手。

"放心吧，我会努力的。"我笑着说。

放榜那天，我挤在人群里，找到了自己的名字——虽然不是状元，但也中了进士。

我兴冲冲地跑回去，想告诉白九这个好消息。

然而，院子里空荡荡的，白九不见了。

"白九？白九！"我四处寻找，却怎么也找不到。

就在我失魂落魄的时候，一个声音从身后传来："公子，你在找我吗？"

我转过身，看到了一个白衣少女。

雪白的长发，金色的眼眸，还有...九条毛茸茸的尾巴。

"你是..."我愣住了。

"我是白九啊。"她笑着说，"也是小九。多谢公子这些天的照顾。"

我呆呆地看着她，说不出话来。

"公子考中了，对吧？"她走到我面前，"恭喜你。"

"你...你要走了吗？"我忽然有些慌。

小九看着我，然后摇摇头："如果你...不嫌弃我的话，我可以继续陪着你。"

我愣了一下，然后狂喜："真的吗？"

"嗯。"她红着脸点点头，"只要公子不嫌弃我是妖。"

"怎么会！"我抓住她的手，"我高兴还来不及！"

就这样，一人一狐，不，一人一妖，开始了在京城的新生活。

未来还很长，但只要有彼此，就什么都不怕。

【结局达成：一人一狐】`,
      choices: [],
      isEnding: true,
      endingType: 'good'
    },
    {
      id: 'node-3-4e',
      storyId: 'story-3',
      title: '结局：世外桃源',
      content: `我在山中多待了几天。

白九的伤好了大半，我们在山中游山玩水，倒也逍遥自在。

这几天里，我发现白九似乎总能找到最美的风景，总能找到最好吃的野果。

跟着它，我看到了很多从未见过的美景。

"这里真是个好地方。"我忍不住感叹道。

白九蹭了蹭我的手，似乎很赞同。

我忽然有了个想法。

"白九，我...不想进京赶考了。"

它歪了歪头，似乎不太明白。

"我觉得在这里挺好的。"我笑着说，"有山有水，有你陪着我。比去京城当官强多了。"

白九的眼睛亮了起来，九条尾巴欢快地摆动着。

"你也觉得挺好，对吧？"

它用力点头。

从那以后，我就在这座山里住了下来。

我搭了个小木屋，种了些菜，日子过得悠闲自在。

白九每天都陪着我，我们一起看日出，一起看日落，一起数星星。

有时候，我会想，这样的生活，是不是就是人们所说的世外桃源？

我不知道。

但我知道，我很快乐。

有一天晚上，我做了个梦。梦里，白九变成了一个很漂亮的白衣少女，她说她叫小九。

她说，她会一直陪着我。

醒来后，我发现白九正趴在我枕边，金色的眼眸温柔地看着我。

我笑了。

不管是人是妖，不管是梦是真，只要有你在身边，就够了。

【结局达成：世外桃源】`,
      choices: [],
      isEnding: true,
      endingType: 'good'
    },
    {
      id: 'node-3-4f',
      storyId: 'story-3',
      title: '结局：古寺余生',
      content: `我决定留下来，不走了。

功名利禄，不过是过眼云烟。有白九陪着我，在这座古寺里度过余生，也挺好的。

白九似乎听懂了我的决定，它很开心，每天都围着我转。

我把古寺打扫干净，种了些花，又开辟了一小块菜地。

日子过得平静而充实。

每天，我读书写字，白九就陪在我身边。有时候，它会变成一个白衣少女，和我聊天。

她告诉我，她叫小九，修炼了三百年。

她还给我讲了很多山里精怪的故事，有趣极了。

"墨言，"有一天，小九忽然问我，"你会不会后悔？为了我，放弃了大好前程。"

我摇摇头："不会。有你陪着我，比什么都重要。"

她笑了，眼睛弯成了月牙。

春去秋来，岁月如梭。

我在这座古寺里，度过了一生。

临终前，小九守在我身边。

"小九..."我虚弱地说，"谢谢你，陪了我一辈子。"

她握着我的手，眼泪掉了下来。

"下辈子..."我笑着说，"换我来陪你。"

她用力点头，泣不成声。

我闭上眼睛，心里很平静。

这一生，能遇到小九，足矣。

【结局达成：古寺余生】`,
      choices: [],
      isEnding: true,
      endingType: 'normal'
    }
  ],
  'story-4': [
    {
      id: 'node-4-1',
      storyId: 'story-4',
      title: '第一章：神秘的邮局',
      content: '城市的角落，有一家不起眼的邮局。据说，这里可以寄信给过去的自己...',
      choices: [
        { id: 'choice-4-1-1', text: '寄一封给过去的信', nextNodeId: null },
        { id: 'choice-4-1-2', text: '询问邮局的秘密', nextNodeId: null }
      ],
      isEnding: false
    }
  ],
  'story-5': [
    {
      id: 'node-5-1',
      storyId: 'story-5',
      title: '序章：深海的呼唤',
      content: '海洋生物学家林深，在一次深海考察中，听到了奇异的鲸歌...',
      choices: [
        { id: 'choice-5-1-1', text: '追寻鲸歌的来源', nextNodeId: null },
        { id: 'choice-5-1-2', text: '返回船上报告发现', nextNodeId: null }
      ],
      isEnding: false
    }
  ],
  'story-6': [
    {
      id: 'node-6-1',
      storyId: 'story-6',
      title: '第一章：废弃的机甲',
      content: '战火纷飞的年代，少女艾拉在废墟中发现了一台古老的机甲...',
      choices: [
        { id: 'choice-6-1-1', text: '尝试启动机甲', nextNodeId: null },
        { id: 'choice-6-1-2', text: '寻找机甲的钥匙', nextNodeId: null }
      ],
      isEnding: false
    }
  ],
  'story-7': [
    {
      id: 'node-7-1',
      storyId: 'story-7',
      title: '第一章：咖啡屋的新店员',
      content: '街角的「喵语咖啡屋」正在招新，我推开了那扇挂着铃铛的门...',
      choices: [
        { id: 'choice-7-1-1', text: '和橘猫打招呼', nextNodeId: null },
        { id: 'choice-7-1-2', text: '询问店长招聘详情', nextNodeId: null }
      ],
      isEnding: false
    }
  ],
  'story-8': [
    {
      id: 'node-8-1',
      storyId: 'story-8',
      title: '第一章：蔷薇丛中的少女',
      content: '骑士艾莉娅在执行任务时，误入了一片神秘的蔷薇园...',
      choices: [
        { id: 'choice-8-1-1', text: '上前搭话', nextNodeId: null },
        { id: 'choice-8-1-2', text: '暗中观察', nextNodeId: null }
      ],
      isEnding: false
    }
  ],
  'story-9': [
    {
      id: 'node-9-1',
      storyId: 'story-9',
      title: '第一章：星空下的相遇',
      content: '星图师少年在山顶绘制星图时，一颗流星落在了不远处...',
      choices: [
        { id: 'choice-9-1-1', text: '前往流星坠落处', nextNodeId: null },
        { id: 'choice-9-1-2', text: '继续观察星象', nextNodeId: null }
      ],
      isEnding: false
    }
  ],
  'story-10': [
    {
      id: 'node-10-1',
      storyId: 'story-10',
      title: '第一章：上元夜',
      content: '大唐长安，上元灯会。画师柳言在人群中，看见了一只九尾狐...',
      choices: [
        { id: 'choice-10-1-1', text: '追上去看个究竟', nextNodeId: null },
        { id: 'choice-10-1-2', text: '回到画摊继续作画', nextNodeId: null }
      ],
      isEnding: false
    }
  ],
  'story-11': [
    {
      id: 'node-11-1',
      storyId: 'story-11',
      title: '第一章：霓虹下的邂逅',
      content: '2099年，新东京。黑客少年在数据海洋中，遇见了一个神秘的AI歌姬...',
      choices: [
        { id: 'choice-11-1-1', text: '追踪这个AI', nextNodeId: null },
        { id: 'choice-11-1-2', text: '切断连接保持安全', nextNodeId: null }
      ],
      isEnding: false
    }
  ],
  'story-12': [
    {
      id: 'node-12-1',
      storyId: 'story-12',
      title: '第一章：误入森林',
      content: '迷路的少女艾米，在精灵森林深处遇见了一位银发精灵...',
      choices: [
        { id: 'choice-12-1-1', text: '请求精灵帮助', nextNodeId: null },
        { id: 'choice-12-1-2', text: '悄悄躲起来', nextNodeId: null }
      ],
      isEnding: false
    }
  ],
  'story-13': [
    {
      id: 'node-13-1',
      storyId: 'story-13',
      title: '序章：午夜十二点',
      content: '传闻中，午夜十二点会有一列幽灵列车经过。今晚，我决定去一探究竟...',
      choices: [
        { id: 'choice-13-1-1', text: '登上列车', nextNodeId: null },
        { id: 'choice-13-1-2', text: '在站台观望', nextNodeId: null }
      ],
      isEnding: false
    }
  ],
  'story-14': [
    {
      id: 'node-14-1',
      storyId: 'story-14',
      title: '第一章：云朵上的小镇',
      content: '乘坐热气球旅行的我，意外发现了一座漂浮在云端的小镇...',
      choices: [
        { id: 'choice-14-1-1', text: '降落一探究竟', nextNodeId: null },
        { id: 'choice-14-1-2', text: '在空中绕行观察', nextNodeId: null }
      ],
      isEnding: false
    }
  ],
  'story-15': [
    {
      id: 'node-15-1',
      storyId: 'story-15',
      title: '序章：废墟中的光',
      content: '世界毁灭后的第一百年，少女米拉在废墟中寻找着生存的希望...',
      choices: [
        { id: 'choice-15-1-1', text: '走近那道光', nextNodeId: null },
        { id: 'choice-15-1-2', text: '小心地绕开', nextNodeId: null }
      ],
      isEnding: false
    }
  ]
};

const featuredTopics = [
  {
    id: 'topic-1',
    title: '奇幻恋爱精选',
    description: '跨越种族与时空的浪漫故事',
    cover: '💕',
    tags: ['奇幻', '恋爱'],
    storyCount: 8,
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    sortOrder: 1
  },
  {
    id: 'topic-2',
    title: '治愈系故事集',
    description: '温暖心灵的治愈系故事，陪你度过每一个温柔的夜晚',
    cover: '🌿',
    tags: ['治愈'],
    storyCount: 7,
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    sortOrder: 2
  },
  {
    id: 'topic-3',
    title: '科幻世界大冒险',
    description: '穿越星际，探索未来，在科幻世界中开启奇妙旅程',
    cover: '🚀',
    tags: ['科幻', '冒险'],
    storyCount: 5,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    sortOrder: 3
  },
  {
    id: 'topic-4',
    title: '古风古韵',
    description: '梦回千年，在古风世界中邂逅浪漫',
    cover: '🏮',
    tags: ['古风'],
    storyCount: 3,
    color: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    sortOrder: 4
  },
  {
    id: 'topic-5',
    title: '完本佳作',
    description: '已完结的精品故事，放心入坑',
    cover: '📚',
    tags: [],
    isCompleted: true,
    storyCount: 8,
    color: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    sortOrder: 5
  },
  {
    id: 'topic-6',
    title: '百合向精选',
    description: '少女之间的细腻情感与温柔故事',
    cover: '🌸',
    tags: ['百合'],
    storyCount: 3,
    color: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    sortOrder: 6
  }
];

const comments = {
  'story-1': [
    {
      id: 'comment-1',
      storyId: 'story-1',
      nodeId: 'node-1-1',
      nodeTitle: '第一章：云中之城',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      content: '第一章就很有画面感！银发少年好神秘~紫色眼眸的设定太戳我了！',
      likes: 23,
      replyCount: 2,
      replyToCommentId: null,
      replyToUserId: null,
      replyToUsername: null,
      isPinned: true,
      pinnedAt: '2024-04-08T08:00:00.000Z',
      pinnedBy: { userId: 'user-1', username: '月下独酌' },
      isAuthor: false,
      createdAt: '2024-04-05 10:30',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-1-reply-1',
      storyId: 'story-1',
      nodeId: 'node-1-1',
      nodeTitle: '第一章：云中之城',
      userId: 'user-3',
      username: '梦境织者',
      avatar: '🌙',
      content: '同感同感！我也觉得银发少年的设定太棒了',
      likes: 8,
      replyCount: 0,
      replyToCommentId: 'comment-1',
      replyToUserId: 'user-2',
      replyToUsername: '星河漫步者',
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-04-05 11:20',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-1-reply-2',
      storyId: 'story-1',
      nodeId: 'node-1-1',
      nodeTitle: '第一章：云中之城',
      userId: 'user-1',
      username: '月下独酌',
      avatar: '🌸',
      content: '谢谢喜欢！后续辰的身份会慢慢揭晓哦~',
      likes: 12,
      replyCount: 0,
      replyToCommentId: 'comment-1',
      replyToUserId: 'user-2',
      replyToUsername: '星河漫步者',
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: true,
      createdAt: '2024-04-05 12:00',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-2',
      storyId: 'story-1',
      nodeId: 'node-1-1',
      nodeTitle: '第一章：云中之城',
      userId: 'user-3',
      username: '梦境织者',
      avatar: '🌙',
      content: '浮城的设定好棒，好想住在云上面！每天推开窗就是云海的感觉一定很棒！',
      likes: 15,
      replyCount: 1,
      replyToCommentId: null,
      replyToUserId: null,
      replyToUsername: null,
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-04-06 14:20',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-2-reply-1',
      storyId: 'story-1',
      nodeId: 'node-1-1',
      nodeTitle: '第一章：云中之城',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      content: '想想都觉得浪漫！',
      likes: 5,
      replyCount: 0,
      replyToCommentId: 'comment-2',
      replyToUserId: 'user-3',
      replyToUsername: '梦境织者',
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-04-06 15:10',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-3',
      storyId: 'story-1',
      nodeId: 'node-1-2a',
      nodeTitle: '第二章：神秘的访客',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      content: '指尖触碰那一段写得太美了！"冰凉的触感传来，像是触摸到了一片雪花" 这个比喻绝了！',
      likes: 31,
      replyCount: 0,
      replyToCommentId: null,
      replyToUserId: null,
      replyToUsername: null,
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-04-08 16:45',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-4',
      storyId: 'story-1',
      nodeId: 'node-1-3a',
      nodeTitle: '结局：天空的守护者',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      content: '天空的守护者！这个结局好甜~辰和小雨一定要幸福啊！',
      likes: 45,
      replyCount: 1,
      replyToCommentId: null,
      replyToUserId: null,
      replyToUsername: null,
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-04-10 09:15',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-4-reply-1',
      storyId: 'story-1',
      nodeId: 'node-1-3a',
      nodeTitle: '结局：天空的守护者',
      userId: 'user-3',
      username: '梦境织者',
      avatar: '🌙',
      content: '我也超爱这个结局！反复看了三遍！',
      likes: 18,
      replyCount: 0,
      replyToCommentId: 'comment-4',
      replyToUserId: 'user-2',
      replyToUsername: '星河漫步者',
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-04-10 10:30',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-5',
      storyId: 'story-1',
      nodeId: 'node-1-4a',
      nodeTitle: '结局：烟火人间',
      userId: 'user-3',
      username: '梦境织者',
      avatar: '🌙',
      content: '烟火人间才是最温暖的！一碗云吞面就能定终身什么的，太戳人了！',
      likes: 38,
      replyCount: 0,
      replyToCommentId: null,
      replyToUserId: null,
      replyToUsername: null,
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-04-12 20:00',
      auditStatus: 'approved',
      auditLevel: 'G'
    }
  ],
  'story-2': [
    {
      id: 'comment-6',
      storyId: 'story-2',
      nodeId: 'node-2-1',
      nodeTitle: '序章：废弃空间站',
      userId: 'user-1',
      username: '月下独酌',
      avatar: '🌸',
      content: '科幻百合！太对我胃口了！废弃空间站的设定超有感觉！',
      likes: 34,
      replyCount: 1,
      replyToCommentId: null,
      replyToUserId: null,
      replyToUsername: null,
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-03-20 16:45',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-6-reply-1',
      storyId: 'story-2',
      nodeId: 'node-2-1',
      nodeTitle: '序章：废弃空间站',
      userId: 'user-3',
      username: '梦境织者',
      avatar: '🌙',
      content: '我也是！星际+百合的组合简直无敌',
      likes: 10,
      replyCount: 0,
      replyToCommentId: 'comment-6',
      replyToUserId: 'user-1',
      replyToUsername: '月下独酌',
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-03-20 17:30',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-7',
      storyId: 'story-2',
      nodeId: 'node-2-4a',
      nodeTitle: '结局：星河旅人',
      userId: 'user-3',
      username: '梦境织者',
      avatar: '🌙',
      content: '星河旅人这个结局太浪漫了！一起探索宇宙什么的...苏晓和星蓝一定要一直在一起啊！',
      likes: 56,
      replyCount: 2,
      replyToCommentId: null,
      replyToUserId: null,
      replyToUsername: null,
      isPinned: true,
      pinnedAt: '2024-04-02T10:00:00.000Z',
      pinnedBy: { userId: 'user-2', username: '星河漫步者' },
      isAuthor: false,
      createdAt: '2024-04-01 11:30',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-7-reply-1',
      storyId: 'story-2',
      nodeId: 'node-2-4a',
      nodeTitle: '结局：星河旅人',
      userId: 'user-1',
      username: '月下独酌',
      avatar: '🌸',
      content: '两个人的宇宙旅行！想想都觉得浪漫',
      likes: 15,
      replyCount: 0,
      replyToCommentId: 'comment-7',
      replyToUserId: 'user-3',
      replyToUsername: '梦境织者',
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-04-01 12:15',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-7-reply-2',
      storyId: 'story-2',
      nodeId: 'node-2-4a',
      nodeTitle: '结局：星河旅人',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      content: '谢谢大家喜欢星蓝和苏晓！她们会在宇宙的某个角落继续幸福着~',
      likes: 28,
      replyCount: 0,
      replyToCommentId: 'comment-7',
      replyToUserId: 'user-3',
      replyToUsername: '梦境织者',
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: true,
      createdAt: '2024-04-01 13:00',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-8',
      storyId: 'story-2',
      nodeId: 'node-2-3c',
      nodeTitle: '第四章：初见',
      userId: 'user-1',
      username: '月下独酌',
      avatar: '🌸',
      content: '星蓝这个名字起得太好了！淡蓝色的头发和星空真的配！',
      likes: 22,
      replyCount: 0,
      replyToCommentId: null,
      replyToUserId: null,
      replyToUsername: null,
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-03-25 14:20',
      auditStatus: 'approved',
      auditLevel: 'G'
    }
  ],
  'story-3': [
    {
      id: 'comment-9',
      storyId: 'story-3',
      nodeId: 'node-3-1',
      nodeTitle: '第一章：深山古寺',
      userId: 'user-1',
      username: '月下独酌',
      avatar: '🌸',
      content: '九尾狐！古风恋爱我的最爱！枫叶林+白九的组合YYDS！',
      likes: 67,
      replyCount: 2,
      replyToCommentId: null,
      replyToUserId: null,
      replyToUsername: null,
      isPinned: true,
      pinnedAt: '2024-02-16T09:00:00.000Z',
      pinnedBy: { userId: 'user-3', username: '梦境织者' },
      isAuthor: false,
      createdAt: '2024-02-15 08:00',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-9-reply-1',
      storyId: 'story-3',
      nodeId: 'node-3-1',
      nodeTitle: '第一章：深山古寺',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      content: '红枫白狐，画面感太强了！',
      likes: 20,
      replyCount: 0,
      replyToCommentId: 'comment-9',
      replyToUserId: 'user-1',
      replyToUsername: '月下独酌',
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-02-15 09:30',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-9-reply-2',
      storyId: 'story-3',
      nodeId: 'node-3-1',
      nodeTitle: '第一章：深山古寺',
      userId: 'user-3',
      username: '梦境织者',
      avatar: '🌙',
      content: '谢谢喜欢！小九会继续努力的！',
      likes: 35,
      replyCount: 0,
      replyToCommentId: 'comment-9',
      replyToUserId: 'user-1',
      replyToUsername: '月下独酌',
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: true,
      createdAt: '2024-02-15 10:00',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-10',
      storyId: 'story-3',
      nodeId: 'node-3-4a',
      nodeTitle: '结局：京城烟火',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      content: '京城烟火这个结局太圆满了！为了爱人放弃功名什么的...这才是真正的浪漫！',
      likes: 89,
      replyCount: 3,
      replyToCommentId: null,
      replyToUserId: null,
      replyToUsername: null,
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-03-01 20:10',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-10-reply-1',
      storyId: 'story-3',
      nodeId: 'node-3-4a',
      nodeTitle: '结局：京城烟火',
      userId: 'user-1',
      username: '月下独酌',
      avatar: '🌸',
      content: '柳墨言太好了！功名哪有小九重要！',
      likes: 30,
      replyCount: 0,
      replyToCommentId: 'comment-10',
      replyToUserId: 'user-2',
      replyToUsername: '星河漫步者',
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-03-01 21:00',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-10-reply-2',
      storyId: 'story-3',
      nodeId: 'node-3-4a',
      nodeTitle: '结局：京城烟火',
      userId: 'user-3',
      username: '梦境织者',
      avatar: '🌙',
      content: '功名利禄不过是过眼云烟，只有身边人才是最珍贵的',
      likes: 42,
      replyCount: 0,
      replyToCommentId: 'comment-10',
      replyToUserId: 'user-2',
      replyToUsername: '星河漫步者',
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: true,
      createdAt: '2024-03-01 21:30',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-10-reply-3',
      storyId: 'story-3',
      nodeId: 'node-3-4a',
      nodeTitle: '结局：京城烟火',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      content: '@梦境织者 作者大大说得对！',
      likes: 8,
      replyCount: 0,
      replyToCommentId: 'comment-10-reply-2',
      replyToUserId: 'user-3',
      replyToUsername: '梦境织者',
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-03-01 22:00',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-11',
      storyId: 'story-3',
      nodeId: 'node-3-3a',
      nodeTitle: '第三章：狐妖小九',
      userId: 'user-1',
      username: '月下独酌',
      avatar: '🌸',
      content: '小九化形那段我反复看了好多遍！白衣银发太仙了！',
      likes: 52,
      replyCount: 0,
      replyToCommentId: null,
      replyToUserId: null,
      replyToUsername: null,
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-02-20 16:00',
      auditStatus: 'approved',
      auditLevel: 'G'
    },
    {
      id: 'comment-12',
      storyId: 'story-3',
      nodeId: 'node-3-4f',
      nodeTitle: '结局：古寺余生',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      content: '古寺余生这个结局也很动人，虽然平淡但是很治愈，一生一世一双人的感觉！',
      likes: 41,
      replyCount: 0,
      replyToCommentId: null,
      replyToUserId: null,
      replyToUsername: null,
      isPinned: false,
      pinnedAt: null,
      pinnedBy: null,
      isAuthor: false,
      createdAt: '2024-03-05 19:20',
      auditStatus: 'approved',
      auditLevel: 'G'
    }
  ]
};

const worldSettings = [
  {
    id: 'world-1',
    name: '浮城世界观',
    description: '漂浮在云端的城市，充满奇幻色彩的世界',
    cover: '🏙️',
    authorId: 'user-1',
    authorName: '月下独酌',
    likes: 128,
    auditStatus: 'approved',
    auditLevel: 'G',
    entries: [
      {
        id: 'entry-1',
        title: '浮城',
        category: '地理',
        content: '浮城是一座漂浮在万米高空之上的城市，依靠神秘的天空之力悬浮。城市分为多层，最上层是贵族区，中间是商业区，最下层是平民区。浮城的能源来自天空晶石，这是一种稀有的矿石，蕴含着强大的能量。',
        referencedStories: [
          { storyId: 'story-1', storyTitle: '浮城之恋', nodeId: 'node-1-1', nodeTitle: '第一章：云中之城' }
        ]
      },
      {
        id: 'entry-2',
        title: '天空之境',
        category: '传说',
        content: '天空之境是传说中的圣地，据说在云层之上的更高处。那里是天空守护者的居所，有着无穷无尽的天空之力。没有人真正到达过天空之境，只有传说流传下来。',
        referencedStories: [
          { storyId: 'story-1', storyTitle: '浮城之恋', nodeId: 'node-1-1', nodeTitle: '第一章：云中之城' },
          { storyId: 'story-1', storyTitle: '浮城之恋', nodeId: 'node-1-3a', nodeTitle: '结局：天空的守护者' }
        ]
      },
      {
        id: 'entry-3',
        title: '天空守护者',
        category: '种族',
        content: '天空守护者是一群神秘的存在，他们守护着天空之境和天空之力。他们有着银色的头发和紫色的眼眸，能够操控风和云。天空守护者通常不与凡人接触，但偶尔也会有守护者来到浮城。',
        referencedStories: [
          { storyId: 'story-1', storyTitle: '浮城之恋', nodeId: 'node-1-2a', nodeTitle: '第二章：神秘的访客' },
          { storyId: 'story-1', storyTitle: '浮城之恋', nodeId: 'node-1-3a', nodeTitle: '结局：天空的守护者' }
        ]
      }
    ],
    createdAt: '2024-01-20'
  },
  {
    id: 'world-2',
    name: '星际时代',
    description: '公元3000年后的星际航行时代',
    cover: '🌌',
    authorId: 'user-2',
    authorName: '星河漫步者',
    likes: 96,
    auditStatus: 'approved',
    auditLevel: 'G',
    entries: [
      {
        id: 'entry-4',
        title: '星际联邦',
        category: '政治',
        content: '星际联邦是人类星际殖民地的联合政府，成立于公元2500年。联邦的首都是地球，但实际权力中心在火星城。星际联邦负责管理人类的所有殖民地，维护星际秩序。',
        referencedStories: [
          { storyId: 'story-2', storyTitle: '星海彼端的约定', nodeId: 'node-2-1', nodeTitle: '序章：废弃空间站' }
        ]
      },
      {
        id: 'entry-5',
        title: '超光速航行',
        category: '科技',
        content: '超光速航行技术是星际时代的基石，于公元2300年被发明。通过曲速引擎，飞船可以进入亚空间进行超光速旅行。然而，超光速航行仍然有风险，每年都有飞船在航行中失踪。',
        referencedStories: [
          { storyId: 'story-2', storyTitle: '星海彼端的约定', nodeId: 'node-2-1', nodeTitle: '序章：废弃空间站' }
        ]
      },
      {
        id: 'entry-6',
        title: '北辰号空间站',
        category: '地点',
        content: '北辰号是一座建造于公元2800年的科研空间站，位于猎户座小行星带。两百年前，这座空间站突然与联邦失去联系，成为了一座废弃空间站。关于它的废弃原因，有很多传闻。',
        referencedStories: [
          { storyId: 'story-2', storyTitle: '星海彼端的约定', nodeId: 'node-2-1', nodeTitle: '序章：废弃空间站' },
          { storyId: 'story-2', storyTitle: '星海彼端的约定', nodeId: 'node-2-2b', nodeTitle: '第二章：神秘的少女' }
        ]
      }
    ],
    createdAt: '2024-02-10'
  },
  {
    id: 'world-3',
    name: '大靖王朝',
    description: '古风架空王朝，精怪与人类共存',
    cover: '🏯',
    authorId: 'user-3',
    authorName: '梦境织者',
    likes: 156,
    auditStatus: 'pending',
    auditLevel: null,
    entries: [
      {
        id: 'entry-7',
        title: '大靖王朝',
        category: '政治',
        content: '大靖王朝是一个传承了三百年的王朝，国力强盛，文化繁荣。王朝的都城是长安，那里是天下最繁华的地方。王朝崇尚儒学，但也兼容并包，各种思想都能找到立足之地。',
        referencedStories: [
          { storyId: 'story-3', storyTitle: '妖狐与书生', nodeId: 'node-3-4a', nodeTitle: '结局：京城烟火' }
        ]
      },
      {
        id: 'entry-8',
        title: '妖族',
        category: '种族',
        content: '妖族是一群拥有智慧和法力的精怪，它们通常隐居在深山老林之中，不与人类接触。妖族修炼成人形需要很长时间，通常需要几百年。妖族中有善有恶，不能一概而论。',
        referencedStories: [
          { storyId: 'story-3', storyTitle: '妖狐与书生', nodeId: 'node-3-2a', nodeTitle: '第二章：受伤的九尾狐' }
        ]
      },
      {
        id: 'entry-9',
        title: '九尾狐',
        category: '种族',
        content: '九尾狐是妖族中比较高贵的种族，它们天生就有强大的法力，化形也比其他妖族容易。九尾狐通常有着白色的毛发和金色的眼眸，九条尾巴是它们力量的象征。九尾狐大多住在深山古寺之中。',
        referencedStories: [
          { storyId: 'story-3', storyTitle: '妖狐与书生', nodeId: 'node-3-1', nodeTitle: '第一章：深山古寺' },
          { storyId: 'story-3', storyTitle: '妖狐与书生', nodeId: 'node-3-2a', nodeTitle: '第二章：受伤的九尾狐' },
          { storyId: 'story-3', storyTitle: '妖狐与书生', nodeId: 'node-3-3a', nodeTitle: '第三章：狐妖小九' }
        ]
      }
    ],
    createdAt: '2024-01-05'
  }
];

const readingHistory = {
  'user-1': [
    { storyId: 'story-1', currentNodeId: 'node-1-2a', historyNodeIds: ['node-1-1', 'node-1-2a'], readAt: '2024-06-14T10:30:00Z' },
    { storyId: 'story-2', currentNodeId: 'node-2-1', historyNodeIds: ['node-2-1'], readAt: '2024-06-13T08:15:00Z' }
  ],
  'user-2': [
    { storyId: 'story-1', currentNodeId: 'node-1-1', historyNodeIds: ['node-1-1'], readAt: '2024-06-12T14:00:00Z' }
  ],
  'user-3': [
    { storyId: 'story-2', currentNodeId: 'node-2-1', historyNodeIds: ['node-2-1'], readAt: '2024-06-11T09:20:00Z' }
  ]
};

const favorites = {
  'user-1': {
    stories: ['story-2', 'story-3'],
    worlds: ['world-2', 'world-3']
  },
  'user-2': {
    stories: ['story-1', 'story-3'],
    worlds: ['world-1', 'world-3']
  },
  'user-3': {
    stories: ['story-1', 'story-2'],
    worlds: ['world-1', 'world-2']
  }
};

const notifications = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'like',
    content: '星河漫步者 点赞了你的故事《浮城之恋》',
    relatedId: 'story-1',
    relatedType: 'story',
    relatedTitle: '浮城之恋',
    isRead: false,
    createdAt: '2024-05-12 10:30'
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'comment',
    content: '梦境织者 评论了你的故事：第一章就很有画面感！',
    relatedId: 'story-1',
    relatedType: 'story',
    relatedTitle: '浮城之恋',
    isRead: false,
    createdAt: '2024-05-11 14:20'
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'favorite',
    content: '星河漫步者 收藏了你的世界设定《浮城世界观》',
    relatedId: 'world-1',
    relatedType: 'world',
    relatedTitle: '浮城世界观',
    isRead: true,
    createdAt: '2024-05-10 09:15'
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    type: 'system',
    content: '欢迎来到浮城回声！开始你的创作之旅吧~',
    relatedId: null,
    relatedType: null,
    isRead: true,
    createdAt: '2024-01-15 00:00'
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    type: 'like',
    content: '梦境织者 点赞了你的评论',
    relatedId: 'comment-4',
    relatedType: 'comment',
    isRead: false,
    createdAt: '2024-05-13 16:45'
  },
  {
    id: 'notif-6',
    userId: 'user-1',
    type: 'invitation',
    content: '星河漫步者 邀请你共同维护世界设定「星际时代」',
    relatedId: 'invite-4',
    relatedType: 'invitation',
    relatedWorldId: 'world-2',
    relatedWorldName: '星际时代',
    invitationRole: 'editor',
    invitationCategories: ['科技', '政治'],
    inviterId: 'user-2',
    inviterName: '星河漫步者',
    isRead: false,
    createdAt: '2024-05-18 14:00'
  },
  {
    id: 'notif-7',
    userId: 'user-1',
    type: 'comment_reply',
    content: '星河漫步者 回复了你的评论：说得太对了，我也超喜欢这个设定！',
    relatedId: 'story-1',
    relatedType: 'story',
    relatedTitle: '浮城之恋',
    replyToCommentId: 'comment-2',
    replyContent: '浮城的设定好棒，好想住在云上面！',
    inviterId: 'user-2',
    inviterName: '星河漫步者',
    inviterAvatar: '⭐',
    isRead: false,
    createdAt: '2024-05-19 09:30'
  },
  {
    id: 'notif-8',
    userId: 'user-1',
    type: 'reference',
    content: '梦境织者 在作品《妖狐与书生》中引用了你的世界设定「浮城」',
    relatedId: 'story-3',
    relatedType: 'story',
    relatedTitle: '妖狐与书生',
    referenceType: 'world_entry',
    referenceId: 'entry-1',
    referenceTitle: '浮城',
    inviterId: 'user-3',
    inviterName: '梦境织者',
    inviterAvatar: '🌙',
    isRead: false,
    createdAt: '2024-05-19 11:20'
  },
  {
    id: 'notif-9',
    userId: 'user-1',
    type: 'reference',
    content: '星河漫步者 在世界设定《星际时代》中引用了你的设定条目「天空晶石」',
    relatedId: 'world-2',
    relatedType: 'world',
    relatedTitle: '星际时代',
    referenceType: 'world_entry',
    referenceId: 'entry-3',
    referenceTitle: '天空晶石',
    inviterId: 'user-2',
    inviterName: '星河漫步者',
    inviterAvatar: '⭐',
    isRead: true,
    createdAt: '2024-05-17 16:45'
  },
  {
    id: 'notif-10',
    userId: 'user-1',
    type: 'story_update',
    content: '你关注的作者 梦境织者 更新了作品《妖狐与书生》',
    relatedId: 'story-3',
    relatedType: 'story',
    relatedTitle: '妖狐与书生',
    updateType: 'new_chapter',
    chapterTitle: '结局：京城烟火',
    authorId: 'user-3',
    authorName: '梦境织者',
    authorAvatar: '🌙',
    isRead: false,
    createdAt: '2024-05-20 08:00'
  },
  {
    id: 'notif-11',
    userId: 'user-1',
    type: 'story_update',
    content: '你收藏的作品《星海彼端的约定》发布了新结局',
    relatedId: 'story-2',
    relatedType: 'story',
    relatedTitle: '星海彼端的约定',
    updateType: 'new_ending',
    chapterTitle: '结局：两个人的空间站',
    authorId: 'user-2',
    authorName: '星河漫步者',
    authorAvatar: '⭐',
    isRead: false,
    createdAt: '2024-05-19 20:30'
  },
  {
    id: 'notif-12',
    userId: 'user-1',
    type: 'collaboration',
    content: '星河漫步者 提交了对「天空之境」条目修改申请',
    relatedId: 'world-1',
    relatedType: 'world',
    relatedTitle: '浮城世界观',
    changeRequestId: 'change-1',
    changeType: 'update',
    entryTitle: '天空之境',
    inviterId: 'user-2',
    inviterName: '星河漫步者',
    inviterAvatar: '⭐',
    isRead: false,
    createdAt: '2024-05-20 10:15'
  },
  {
    id: 'notif-13',
    userId: 'user-1',
    type: 'activity',
    content: '「夏日幻想创作季」活动开始了！快来参与赢取奖励~',
    relatedId: 'activity-1',
    relatedType: 'activity',
    relatedTitle: '夏日幻想创作季',
    activityType: 'submission',
    isRead: true,
    createdAt: '2024-05-15 00:00'
  },
  {
    id: 'notif-14',
    userId: 'user-2',
    type: 'comment',
    content: '月下独酌 评论了你的故事：科幻百合！太对我胃口了！',
    relatedId: 'story-2',
    relatedType: 'story',
    relatedTitle: '星海彼端的约定',
    isRead: false,
    createdAt: '2024-05-20 12:00'
  },
  {
    id: 'notif-15',
    userId: 'user-2',
    type: 'like',
    content: '梦境织者 点赞了你的世界设定《星际时代》',
    relatedId: 'world-2',
    relatedType: 'world',
    relatedTitle: '星际时代',
    isRead: true,
    createdAt: '2024-05-18 15:30'
  },
  {
    id: 'notif-16',
    userId: 'user-3',
    type: 'reference',
    content: '月下独酌 在作品《浮城之恋》中引用了你的设定「九尾狐」',
    relatedId: 'story-1',
    relatedType: 'story',
    relatedTitle: '浮城之恋',
    referenceType: 'world_entry',
    referenceId: 'entry-9',
    referenceTitle: '九尾狐',
    inviterId: 'user-1',
    inviterName: '月下独酌',
    inviterAvatar: '🌸',
    isRead: false,
    createdAt: '2024-05-20 09:45'
  }
];

const collaborators = {
  'world-1': [
    {
      id: 'collab-1',
      worldId: 'world-1',
      userId: 'user-1',
      username: '月下独酌',
      avatar: '🌸',
      role: 'owner',
      permissions: ['read', 'write', 'review', 'manage'],
      categories: [],
      joinedAt: '2024-01-20'
    },
    {
      id: 'collab-2',
      worldId: 'world-1',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      role: 'editor',
      permissions: ['read', 'write'],
      categories: ['地理', '传说'],
      joinedAt: '2024-02-15'
    },
    {
      id: 'collab-3',
      worldId: 'world-1',
      userId: 'user-3',
      username: '梦境织者',
      avatar: '🌙',
      role: 'editor',
      permissions: ['read', 'write'],
      categories: ['种族'],
      joinedAt: '2024-03-01'
    }
  ],
  'world-2': [
    {
      id: 'collab-4',
      worldId: 'world-2',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      role: 'owner',
      permissions: ['read', 'write', 'review', 'manage'],
      categories: [],
      joinedAt: '2024-02-10'
    },
    {
      id: 'collab-5',
      worldId: 'world-2',
      userId: 'user-1',
      username: '月下独酌',
      avatar: '🌸',
      role: 'reviewer',
      permissions: ['read', 'review'],
      categories: [],
      joinedAt: '2024-03-05'
    }
  ],
  'world-3': [
    {
      id: 'collab-6',
      worldId: 'world-3',
      userId: 'user-3',
      username: '梦境织者',
      avatar: '🌙',
      role: 'owner',
      permissions: ['read', 'write', 'review', 'manage'],
      categories: [],
      joinedAt: '2024-01-05'
    }
  ]
};

const invitations = [
  {
    id: 'invite-1',
    worldId: 'world-1',
    worldName: '浮城世界观',
    inviterId: 'user-1',
    inviterName: '月下独酌',
    inviteeId: 'user-2',
    inviteeName: '星河漫步者',
    role: 'editor',
    categories: ['地理', '传说'],
    status: 'accepted',
    createdAt: '2024-02-14 10:00',
    respondedAt: '2024-02-14 15:30'
  },
  {
    id: 'invite-2',
    worldId: 'world-1',
    worldName: '浮城世界观',
    inviterId: 'user-1',
    inviterName: '月下独酌',
    inviteeId: 'user-3',
    inviteeName: '梦境织者',
    role: 'editor',
    categories: ['种族'],
    status: 'accepted',
    createdAt: '2024-02-28 09:00',
    respondedAt: '2024-02-28 12:00'
  },
  {
    id: 'invite-3',
    worldId: 'world-1',
    worldName: '浮城世界观',
    inviterId: 'user-1',
    inviterName: '月下独酌',
    inviteeId: 'user-2',
    inviteeName: '星河漫步者',
    role: 'editor',
    categories: ['地理'],
    status: 'pending',
    createdAt: '2024-05-20 08:00',
    respondedAt: null
  },
  {
    id: 'invite-4',
    worldId: 'world-2',
    worldName: '星际时代',
    inviterId: 'user-2',
    inviterName: '星河漫步者',
    inviteeId: 'user-1',
    inviteeName: '月下独酌',
    role: 'editor',
    categories: ['科技', '政治'],
    status: 'pending',
    createdAt: '2024-05-18 14:00',
    respondedAt: null
  }
];

const changeRequests = [
  {
    id: 'change-1',
    worldId: 'world-1',
    entryId: 'entry-1',
    entryTitle: '浮城',
    requestedBy: 'user-2',
    requesterName: '星河漫步者',
    requesterAvatar: '⭐',
    type: 'update',
    status: 'approved',
    summary: '更新浮城的地理描述，增加下层区域的详细设定',
    oldValue: { title: '浮城', category: '地理', content: '浮城是一座漂浮在万米高空之上的城市，依靠神秘的天空之力悬浮。城市分为多层，最上层是贵族区，中间是商业区，最下层是平民区。' },
    newValue: { title: '浮城', category: '地理', content: '浮城是一座漂浮在万米高空之上的城市，依靠神秘的天空之力悬浮。城市分为多层，最上层是贵族区，中间是商业区，最下层是平民区。浮城的能源来自天空晶石，这是一种稀有的矿石，蕴含着强大的能量。' },
    reviewedBy: 'user-1',
    reviewerName: '月下独酌',
    reviewComment: '很好的补充，天空晶石的设定很重要',
    createdAt: '2024-04-10 14:30',
    reviewedAt: '2024-04-11 09:00'
  },
  {
    id: 'change-2',
    worldId: 'world-1',
    entryId: 'entry-2',
    entryTitle: '天空之境',
    requestedBy: 'user-2',
    requesterName: '星河漫步者',
    requesterAvatar: '⭐',
    type: 'update',
    status: 'pending',
    summary: '扩展天空之境的传说内容，增加守护者仪式的描述',
    oldValue: { title: '天空之境', category: '传说', content: '天空之境是传说中的圣地，据说在云层之上的更高处。那里是天空守护者的居所，有着无穷无尽的天空之力。没有人真正到达过天空之境，只有传说流传下来。' },
    newValue: { title: '天空之境', category: '传说', content: '天空之境是传说中的圣地，据说在云层之上的更高处。那里是天空守护者的居所，有着无穷无尽的天空之力。每年春分之日，守护者会在天空之境举行升云仪式，将天空之力注入浮城的核心晶石，维系浮城的悬浮。没有人真正到达过天空之境，只有传说流传下来。' },
    reviewedBy: null,
    reviewerName: null,
    reviewComment: null,
    createdAt: '2024-05-15 16:00',
    reviewedAt: null
  },
  {
    id: 'change-3',
    worldId: 'world-1',
    entryId: null,
    entryTitle: null,
    requestedBy: 'user-3',
    requesterName: '梦境织者',
    requesterAvatar: '🌙',
    type: 'create',
    status: 'pending',
    summary: '新增浮城货币体系条目',
    oldValue: null,
    newValue: { title: '浮城货币', category: '经济', content: '浮城使用天空币作为通用货币。天空币由天空晶石的碎屑制成，本身也蕴含微弱的天空之力。1枚天空币可以购买一顿丰盛的午餐。贵族区流通的则是镶嵌了天空宝石的贵族币，价值是普通天空币的一百倍。' },
    reviewedBy: null,
    reviewerName: null,
    reviewComment: null,
    createdAt: '2024-05-18 11:30',
    reviewedAt: null
  },
  {
    id: 'change-4',
    worldId: 'world-1',
    entryId: 'entry-3',
    entryTitle: '天空守护者',
    requestedBy: 'user-3',
    requesterName: '梦境织者',
    requesterAvatar: '🌙',
    type: 'update',
    status: 'rejected',
    summary: '修改天空守护者的描述，增加关于守护者叛逃的设定',
    oldValue: { title: '天空守护者', category: '种族', content: '天空守护者是一群神秘的存在，他们守护着天空之境和天空之力。他们有着银色的头发和紫色的眼眸，能够操控风和云。天空守护者通常不与凡人接触，但偶尔也会有守护者来到浮城。' },
    newValue: { title: '天空守护者', category: '种族', content: '天空守护者是一群神秘的存在，他们守护着天空之境和天空之力。他们有着银色的头发和紫色的眼眸，能够操控风和云。每隔数十年，会有守护者因厌倦永恒的守候而叛逃至浮城，这些叛逃者将失去操控天空之力的能力，但会保留银发紫眸的外貌特征。' },
    reviewedBy: 'user-1',
    reviewerName: '月下独酌',
    reviewComment: '叛逃设定与主线故事冲突，暂不添加',
    createdAt: '2024-04-20 10:00',
    reviewedAt: '2024-04-21 14:00'
  }
];

const versionHistory = [
  {
    id: 'version-1',
    worldId: 'world-1',
    version: 1,
    changeType: 'create',
    changeSummary: '创建世界设定「浮城世界观」',
    changedBy: 'user-1',
    changerName: '月下独酌',
    changerAvatar: '🌸',
    entries: [
      { id: 'entry-1', title: '浮城', category: '地理', content: '浮城是一座漂浮在万米高空之上的城市，依靠神秘的天空之力悬浮。城市分为多层，最上层是贵族区，中间是商业区，最下层是平民区。' },
      { id: 'entry-2', title: '天空之境', category: '传说', content: '天空之境是传说中的圣地，据说在云层之上的更高处。那里是天空守护者的居所，有着无穷无尽的天空之力。没有人真正到达过天空之境，只有传说流传下来。' },
      { id: 'entry-3', title: '天空守护者', category: '种族', content: '天空守护者是一群神秘的存在，他们守护着天空之境和天空之力。他们有着银色的头发和紫色的眼眸，能够操控风和云。天空守护者通常不与凡人接触，但偶尔也会有守护者来到浮城。' }
    ],
    createdAt: '2024-01-20 10:00'
  },
  {
    id: 'version-2',
    worldId: 'world-1',
    version: 2,
    changeType: 'update',
    changeSummary: '更新浮城地理描述，补充天空晶石能源设定',
    changeRequestId: 'change-1',
    changedBy: 'user-1',
    changerName: '月下独酌',
    changerAvatar: '🌸',
    entries: [
      { id: 'entry-1', title: '浮城', category: '地理', content: '浮城是一座漂浮在万米高空之上的城市，依靠神秘的天空之力悬浮。城市分为多层，最上层是贵族区，中间是商业区，最下层是平民区。浮城的能源来自天空晶石，这是一种稀有的矿石，蕴含着强大的能量。' },
      { id: 'entry-2', title: '天空之境', category: '传说', content: '天空之境是传说中的圣地，据说在云层之上的更高处。那里是天空守护者的居所，有着无穷无尽的天空之力。没有人真正到达过天空之境，只有传说流传下来。' },
      { id: 'entry-3', title: '天空守护者', category: '种族', content: '天空守护者是一群神秘的存在，他们守护着天空之境和天空之力。他们有着银色的头发和紫色的眼眸，能够操控风和云。天空守护者通常不与凡人接触，但偶尔也会有守护者来到浮城。' }
    ],
    createdAt: '2024-04-11 09:00'
  }
];

const storyDrafts = [
  {
    id: 'draft-1',
    storyId: null,
    userId: 'user-1',
    title: '未命名草稿',
    summary: '',
    cover: '📖',
    tags: [],
    nodes: [
      {
        id: 'draft-node-1',
        title: '第一章',
        content: '这是一个草稿的开头...',
        choices: [],
        isEnding: false
      }
    ],
    autoSaved: true,
    lastSavedAt: '2024-06-15 14:30',
    createdAt: '2024-06-15 14:00'
  }
];

const storyVersions = [];

const activities = [
  {
    id: 'activity-1',
    title: '「浮城梦境」主题征文大赛',
    subtitle: '用文字编织属于你的浮城故事',
    description: '欢迎来到浮城！这是一座漂浮在万米高空之上的奇迹之城。在这里，天空守护者与凡人共存，古老的传说与浪漫的相遇交织。请以「浮城梦境」为主题，创作一篇互动叙事故事，让读者在你的文字中感受浮城的浪漫与奇幻。',
    theme: '浮城梦境',
    cover: '🏰✨',
    banner: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=floating%20city%20in%20clouds%20fantasy%20dreamy%20romantic%20anime%20style&image_size=landscape_16_9',
    rules: [
      '作品需围绕「浮城梦境」主题展开，可融入浮城世界观元素',
      '故事形式为互动叙事（分支选择），至少包含3个不同结局',
      '字数不少于3000字，内容健康向上，不得涉及违规内容',
      '参赛作品需为原创，严禁抄袭、洗稿',
      '每位参赛者最多提交2部作品'
    ],
    prizes: [
      { rank: '一等奖', name: '浮城金笔奖', count: 1, reward: '奖金5000元 + 专属头像框 + 作品首页推荐' },
      { rank: '二等奖', name: '天空银笔奖', count: 3, reward: '奖金2000元 + 专属头像框 + 作品分类推荐' },
      { rank: '三等奖', name: '云海铜笔奖', count: 5, reward: '奖金800元 + 作品分类推荐' },
      { rank: '人气奖', name: '最具人气作品', count: 10, reward: '浮城周边礼盒 + 作品曝光提升' },
      { rank: '参与奖', name: '梦想参与奖', count: '不限', reward: '活动限定徽章 + 50积分' }
    ],
    tags: ['征文', '浮城', '恋爱', '奇幻'],
    organizerId: 'system',
    organizerName: '浮城回声官方',
    organizerAvatar: '🏛️',
    startTime: '2024-06-01 00:00',
    endTime: '2024-07-31 23:59',
    registrationEndTime: '2024-07-20 23:59',
    status: 'ongoing',
    maxParticipants: 1000,
    viewCount: 12580,
    shareCount: 892,
    participantCount: 256,
    submissionCount: 189,
    createdAt: '2024-05-20 10:00'
  },
  {
    id: 'activity-2',
    title: '「星海彼端」科幻恋爱征文',
    subtitle: '跨越星际的浪漫约定',
    description: '公元3024年，星际航行时代已经来临。在浩瀚的宇宙中，是否也存在着动人的爱情故事？请以「星海彼端」为主题，创作一篇科幻背景下的恋爱互动故事。',
    theme: '星海彼端',
    cover: '🚀💫',
    banner: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=starry%20space%20sci-fi%20romantic%20spaceship%20galaxy%20anime%20style&image_size=landscape_16_9',
    rules: [
      '作品需为科幻背景下的恋爱故事',
      '故事需包含互动分支，至少2个结局',
      '字数不少于2000字',
      '必须为原创作品'
    ],
    prizes: [
      { rank: '一等奖', name: '星海桂冠', count: 1, reward: '奖金3000元 + 专属标识' },
      { rank: '二等奖', name: '星辰奖章', count: 3, reward: '奖金1000元 + 专属标识' },
      { rank: '参与奖', name: '星 dust', count: '不限', reward: '30积分' }
    ],
    tags: ['征文', '科幻', '恋爱', '星际'],
    organizerId: 'system',
    organizerName: '浮城回声官方',
    organizerAvatar: '🏛️',
    startTime: '2024-05-15 00:00',
    endTime: '2024-06-30 23:59',
    registrationEndTime: '2024-06-20 23:59',
    status: 'ongoing',
    maxParticipants: 500,
    viewCount: 8920,
    shareCount: 456,
    participantCount: 178,
    submissionCount: 134,
    createdAt: '2024-05-10 10:00'
  },
  {
    id: 'activity-3',
    title: '「山海奇缘」古风恋爱主题月',
    subtitle: '前世今生的山海之约',
    description: '在远古的山海世界，精怪与人类共存。九尾白狐、乘黄异兽、鲛人泣珠...请以「山海奇缘」为主题，创作一篇古风奇幻恋爱故事。',
    theme: '山海奇缘',
    cover: '🦊🏔️',
    banner: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20mountain%20sea%20mythology%20fox%20spirit%20romantic%20anime%20style&image_size=landscape_16_9',
    rules: [
      '作品需为古风背景，可融入山海经元素',
      '故事形式为互动叙事',
      '字数不少于2500字',
      '必须为原创作品'
    ],
    prizes: [
      { rank: '一等奖', name: '山海奇缘奖', count: 1, reward: '奖金4000元 + 古风头像框' },
      { rank: '二等奖', name: '青丘奖章', count: 2, reward: '奖金1500元 + 古风头像框' },
      { rank: '人气奖', name: '最受欢迎作品', count: 5, reward: '古风周边礼盒' },
      { rank: '参与奖', name: '结缘奖', count: '不限', reward: '40积分' }
    ],
    tags: ['征文', '古风', '奇幻', '恋爱'],
    organizerId: 'system',
    organizerName: '浮城回声官方',
    organizerAvatar: '🏛️',
    startTime: '2024-04-01 00:00',
    endTime: '2024-05-31 23:59',
    registrationEndTime: '2024-05-20 23:59',
    status: 'ended',
    maxParticipants: 800,
    viewCount: 15680,
    shareCount: 1234,
    participantCount: 423,
    submissionCount: 356,
    createdAt: '2024-03-25 10:00'
  }
];

const activityRegistrations = [
  {
    id: 'reg-1',
    activityId: 'activity-1',
    userId: 'user-1',
    username: '月下独酌',
    avatar: '🌸',
    penName: '月下独酌',
    contactInfo: 'wechat: yuexia123',
    motivation: '热爱浮城的世界观，想创作一个属于自己的浮城故事',
    status: 'approved',
    registeredAt: '2024-06-02 10:30',
    reviewedAt: '2024-06-02 11:00'
  },
  {
    id: 'reg-2',
    activityId: 'activity-1',
    userId: 'user-2',
    username: '星河漫步者',
    avatar: '⭐',
    penName: '星河漫步者',
    contactInfo: 'qq: 123456789',
    motivation: '想试试写恋爱题材的故事',
    status: 'approved',
    registeredAt: '2024-06-03 14:20',
    reviewedAt: '2024-06-03 15:00'
  },
  {
    id: 'reg-3',
    activityId: 'activity-1',
    userId: 'user-3',
    username: '梦境织者',
    avatar: '🌙',
    penName: '梦境织者',
    contactInfo: 'email: mengjing@example.com',
    motivation: '古风是我的强项，这次想挑战奇幻题材',
    status: 'approved',
    registeredAt: '2024-06-05 09:15',
    reviewedAt: '2024-06-05 10:00'
  },
  {
    id: 'reg-4',
    activityId: 'activity-2',
    userId: 'user-2',
    username: '星河漫步者',
    avatar: '⭐',
    penName: '星河漫步者',
    contactInfo: 'qq: 123456789',
    motivation: '科幻是我的最爱！',
    status: 'approved',
    registeredAt: '2024-05-16 16:00',
    reviewedAt: '2024-05-16 16:30'
  }
];

const activitySubmissions = [
  {
    id: 'submission-1',
    activityId: 'activity-1',
    userId: 'user-1',
    username: '月下独酌',
    avatar: '🌸',
    storyId: 'story-1',
    storyTitle: '浮城之恋',
    summary: '在漂浮于云端的城市中，一位普通的图书管理员意外遇见了神秘的银发少年...',
    cover: '🏰',
    tags: ['奇幻', '恋爱', '冒险'],
    wordCount: 8500,
    endingCount: 5,
    status: 'approved',
    reviewComment: '画面感极强，人物形象丰满，完美契合主题',
    submittedAt: '2024-06-15 10:00',
    reviewedAt: '2024-06-16 14:00',
    voteCount: 256,
    viewCount: 1024,
    score: 9.5
  },
  {
    id: 'submission-2',
    activityId: 'activity-1',
    userId: 'user-3',
    username: '梦境织者',
    avatar: '🌙',
    storyId: 'story-3',
    storyTitle: '浮城月下',
    summary: '月光下的浮城，藏着多少不为人知的秘密...',
    cover: '🌙',
    tags: ['古风', '奇幻', '恋爱'],
    wordCount: 6800,
    endingCount: 4,
    status: 'approved',
    reviewComment: '文笔优美，意境深远',
    submittedAt: '2024-06-18 11:30',
    reviewedAt: '2024-06-19 09:00',
    voteCount: 189,
    viewCount: 756,
    score: 9.2
  },
  {
    id: 'submission-3',
    activityId: 'activity-2',
    userId: 'user-2',
    username: '星河漫步者',
    avatar: '⭐',
    storyId: 'story-2',
    storyTitle: '星海彼端的约定',
    summary: '星际时代，两位少女在废弃空间站相遇，命运的齿轮开始转动...',
    cover: '🚀',
    tags: ['科幻', '百合', '治愈'],
    wordCount: 7200,
    endingCount: 4,
    status: 'approved',
    reviewComment: '科幻设定新颖，情感真挚动人',
    submittedAt: '2024-05-28 15:00',
    reviewedAt: '2024-05-29 10:00',
    voteCount: 312,
    viewCount: 1280,
    score: 9.6
  },
  {
    id: 'submission-4',
    activityId: 'activity-3',
    userId: 'user-3',
    username: '梦境织者',
    avatar: '🌙',
    storyId: 'story-3',
    storyTitle: '妖狐与书生',
    summary: '深山古寺中，赶考的书生邂逅了一只受伤的九尾狐...',
    cover: '🦊',
    tags: ['古风', '奇幻', '恋爱'],
    wordCount: 9200,
    endingCount: 6,
    status: 'approved',
    reviewComment: '古风韵味十足，人物塑造鲜活',
    submittedAt: '2024-04-25 20:00',
    reviewedAt: '2024-04-26 14:00',
    voteCount: 445,
    viewCount: 1890,
    score: 9.8
  }
];

const activityRankings = {
  'activity-1': [
    { rank: 1, submissionId: 'submission-1', userId: 'user-1', username: '月下独酌', avatar: '🌸', storyTitle: '浮城之恋', score: 9.5, voteCount: 256, viewCount: 1024 },
    { rank: 2, submissionId: 'submission-2', userId: 'user-3', username: '梦境织者', avatar: '🌙', storyTitle: '浮城月下', score: 9.2, voteCount: 189, viewCount: 756 }
  ],
  'activity-2': [
    { rank: 1, submissionId: 'submission-3', userId: 'user-2', username: '星河漫步者', avatar: '⭐', storyTitle: '星海彼端的约定', score: 9.6, voteCount: 312, viewCount: 1280 }
  ],
  'activity-3': [
    { rank: 1, submissionId: 'submission-4', userId: 'user-3', username: '梦境织者', avatar: '🌙', storyTitle: '妖狐与书生', score: 9.8, voteCount: 445, viewCount: 1890 }
  ]
};

const activityShares = [
  {
    id: 'share-1',
    activityId: 'activity-1',
    userId: 'user-1',
    username: '月下独酌',
    avatar: '🌸',
    channel: 'wechat',
    shareType: 'activity',
    targetId: 'activity-1',
    targetType: 'activity',
    clickCount: 45,
    registerCount: 8,
    submitCount: 3,
    createdAt: '2024-06-10 14:30'
  },
  {
    id: 'share-2',
    activityId: 'activity-1',
    userId: 'user-2',
    username: '星河漫步者',
    avatar: '⭐',
    channel: 'qq',
    shareType: 'submission',
    targetId: 'submission-3',
    targetType: 'submission',
    clickCount: 78,
    registerCount: 12,
    submitCount: 5,
    createdAt: '2024-06-12 09:15'
  },
  {
    id: 'share-3',
    activityId: 'activity-2',
    userId: 'user-2',
    username: '星河漫步者',
    avatar: '⭐',
    channel: 'weibo',
    shareType: 'activity',
    targetId: 'activity-2',
    targetType: 'activity',
    clickCount: 156,
    registerCount: 23,
    submitCount: 8,
    createdAt: '2024-05-20 16:45'
  },
  {
    id: 'share-4',
    activityId: 'activity-1',
    userId: 'user-3',
    username: '梦境织者',
    avatar: '🌙',
    channel: 'wechat',
    shareType: 'submission',
    targetId: 'submission-2',
    targetType: 'submission',
    clickCount: 92,
    registerCount: 15,
    submitCount: 6,
    createdAt: '2024-06-20 11:20'
  }
];

const activityVotes = [
  { id: 'vote-1', activityId: 'activity-1', submissionId: 'submission-1', userId: 'user-2', createdAt: '2024-06-20 10:00' },
  { id: 'vote-2', activityId: 'activity-1', submissionId: 'submission-1', userId: 'user-3', createdAt: '2024-06-21 14:30' },
  { id: 'vote-3', activityId: 'activity-1', submissionId: 'submission-2', userId: 'user-2', createdAt: '2024-06-22 09:15' }
];

const storyPerformance = {
  'user-1': {
    summary: {
      totalStories: 1,
      totalViews: 1024,
      totalLikes: 256,
      totalComments: 3,
      avgCompletionRate: 78,
      weeklyGrowth: 12.5
    },
    stories: [
      {
        id: 'story-1',
        title: '浮城之恋',
        cover: '🏰',
        views: 1024,
        likes: 256,
        comments: 3,
        favorites: 89,
        shares: 34,
        completionRate: 78,
        avgReadingTime: 8.5,
        status: 'ongoing',
        updatedAt: '2024-05-10',
        trend: [
          { date: '2024-05-06', views: 120, likes: 28 },
          { date: '2024-05-07', views: 145, likes: 32 },
          { date: '2024-05-08', views: 168, likes: 35 },
          { date: '2024-05-09', views: 190, likes: 42 },
          { date: '2024-05-10', views: 175, likes: 38 },
          { date: '2024-05-11', views: 210, likes: 45 },
          { date: '2024-05-12', views: 186, likes: 36 }
        ]
      }
    ],
    topEndings: [
      { id: 'node-1-4b', title: '结局：云之彼端', count: 156, rate: 42 },
      { id: 'node-1-3a', title: '结局：天空的守护者', count: 98, rate: 26 },
      { id: 'node-1-4a', title: '结局：烟火人间', count: 76, rate: 20 },
      { id: 'node-1-3b', title: '结局：未完的故事', count: 54, rate: 14 }
    ]
  },
  'user-2': {
    summary: {
      totalStories: 1,
      totalViews: 756,
      totalLikes: 189,
      totalComments: 2,
      avgCompletionRate: 82,
      weeklyGrowth: 8.3
    },
    stories: [
      {
        id: 'story-2',
        title: '星海彼端的约定',
        cover: '🚀',
        views: 756,
        likes: 189,
        comments: 2,
        favorites: 67,
        shares: 28,
        completionRate: 82,
        avgReadingTime: 10.2,
        status: 'completed',
        updatedAt: '2024-04-28',
        trend: [
          { date: '2024-04-22', views: 98, likes: 22 },
          { date: '2024-04-23', views: 112, likes: 28 },
          { date: '2024-04-24', views: 130, likes: 35 },
          { date: '2024-04-25', views: 125, likes: 30 },
          { date: '2024-04-26', views: 140, likes: 38 },
          { date: '2024-04-27', views: 148, likes: 40 },
          { date: '2024-04-28', views: 103, likes: 26 }
        ]
      }
    ],
    topEndings: [
      { id: 'node-2-4d', title: '结局：两个人的空间站', count: 168, rate: 45 },
      { id: 'node-2-4a', title: '结局：星河旅人', count: 112, rate: 30 },
      { id: 'node-2-4b', title: '结局：记忆的重量', count: 60, rate: 16 },
      { id: 'node-2-4c', title: '结局：各自的轨道', count: 33, rate: 9 }
    ]
  },
  'user-3': {
    summary: {
      totalStories: 1,
      totalViews: 1280,
      totalLikes: 342,
      totalComments: 2,
      avgCompletionRate: 85,
      weeklyGrowth: 15.2
    },
    stories: [
      {
        id: 'story-3',
        title: '妖狐与书生',
        cover: '🦊',
        views: 1280,
        likes: 342,
        comments: 2,
        favorites: 125,
        shares: 56,
        completionRate: 85,
        avgReadingTime: 12.3,
        status: 'ongoing',
        updatedAt: '2024-05-05',
        trend: [
          { date: '2024-04-29', views: 156, likes: 42 },
          { date: '2024-04-30', views: 178, likes: 48 },
          { date: '2024-05-01', views: 210, likes: 56 },
          { date: '2024-05-02', views: 195, likes: 50 },
          { date: '2024-05-03', views: 225, likes: 62 },
          { date: '2024-05-04', views: 180, likes: 45 },
          { date: '2024-05-05', views: 136, likes: 39 }
        ]
      }
    ],
    topEndings: [
      { id: 'node-3-4a', title: '结局：京城烟火', count: 245, rate: 48 },
      { id: 'node-3-4d', title: '结局：一人一狐', count: 128, rate: 25 },
      { id: 'node-3-4f', title: '结局：古寺余生', count: 78, rate: 15 },
      { id: 'node-3-4c', title: '结局：山中岁月长', count: 61, rate: 12 }
    ]
  }
};

const readerProfiles = {
  'user-1': {
    demographics: {
      gender: { male: 35, female: 58, other: 7 },
      ageGroups: { '18-24': 42, '25-34': 38, '35-44': 15, '45+': 5 },
      regions: [
        { name: '华东', value: 28 },
        { name: '华南', value: 22 },
        { name: '华北', value: 18 },
        { name: '西南', value: 15 },
        { name: '华中', value: 10 },
        { name: '其他', value: 7 }
      ]
    },
    preferences: {
      favoriteTags: [
        { name: '奇幻', value: 78 },
        { name: '恋爱', value: 85 },
        { name: '冒险', value: 62 },
        { name: '治愈', value: 45 },
        { name: '古风', value: 38 }
      ],
      readingHabits: {
        avgSessions: 3.2,
        avgDuration: 25,
        preferredTime: '20:00-23:00'
      },
      engagement: {
        activeDays: [
          { day: '周一', readers: 156 },
          { day: '周二', readers: 178 },
          { day: '周三', readers: 165 },
          { day: '周四', readers: 189 },
          { day: '周五', readers: 234 },
          { day: '周六', readers: 312 },
          { day: '周日', readers: 289 }
        ]
      }
    }
  },
  'user-2': {
    demographics: {
      gender: { male: 42, female: 52, other: 6 },
      ageGroups: { '18-24': 35, '25-34': 42, '35-44': 18, '45+': 5 },
      regions: [
        { name: '华东', value: 30 },
        { name: '华南', value: 25 },
        { name: '华北', value: 20 },
        { name: '西南', value: 12 },
        { name: '华中', value: 8 },
        { name: '其他', value: 5 }
      ]
    },
    preferences: {
      favoriteTags: [
        { name: '科幻', value: 82 },
        { name: '百合', value: 75 },
        { name: '治愈', value: 68 },
        { name: '冒险', value: 42 },
        { name: '奇幻', value: 35 }
      ],
      readingHabits: {
        avgSessions: 2.8,
        avgDuration: 30,
        preferredTime: '21:00-24:00'
      },
      engagement: {
        activeDays: [
          { day: '周一', readers: 132 },
          { day: '周二', readers: 145 },
          { day: '周三', readers: 158 },
          { day: '周四', readers: 170 },
          { day: '周五', readers: 195 },
          { day: '周六', readers: 268 },
          { day: '周日', readers: 245 }
        ]
      }
    }
  },
  'user-3': {
    demographics: {
      gender: { male: 28, female: 65, other: 7 },
      ageGroups: { '18-24': 48, '25-34': 35, '35-44': 12, '45+': 5 },
      regions: [
        { name: '华东', value: 25 },
        { name: '华南', value: 20 },
        { name: '华北', value: 22 },
        { name: '西南', value: 18 },
        { name: '华中', value: 10 },
        { name: '其他', value: 5 }
      ]
    },
    preferences: {
      favoriteTags: [
        { name: '古风', value: 88 },
        { name: '奇幻', value: 72 },
        { name: '恋爱', value: 80 },
        { name: '治愈', value: 55 },
        { name: '冒险', value: 40 }
      ],
      readingHabits: {
        avgSessions: 3.5,
        avgDuration: 28,
        preferredTime: '19:00-22:00'
      },
      engagement: {
        activeDays: [
          { day: '周一', readers: 189 },
          { day: '周二', readers: 201 },
          { day: '周三', readers: 195 },
          { day: '周四', readers: 220 },
          { day: '周五', readers: 278 },
          { day: '周六', readers: 356 },
          { day: '周日', readers: 334 }
        ]
      }
    }
  }
};

const branchConversions = {
  'story-1': {
    nodes: [
      {
      nodeId: 'node-1-1',
      title: '第一章：云中之城',
      visitors: 1024,
      choices: [
        { id: 'choice-1-1-1', text: '热情地帮他找书', count: 620, rate: 60.5, nextNodeId: 'node-1-2a' },
        { id: 'choice-1-1-2', text: '保持距离，指给他方向', count: 404, rate: 39.5, nextNodeId: 'node-1-2b' }
      ]
    },
    {
      nodeId: 'node-1-2a',
      title: '第二章：神秘的访客',
      visitors: 620,
      choices: [
        { id: 'choice-1-2a-1', text: '询问他的名字', count: 342, rate: 55.2, nextNodeId: 'node-1-3a' },
        { id: 'choice-1-2a-2', text: '邀请他明天再来', count: 278, rate: 44.8, nextNodeId: 'node-1-3b' }
      ]
    },
    {
      nodeId: 'node-1-2b',
      title: '第二章：擦肩而过',
      visitors: 404,
      choices: [
        { id: 'choice-1-2b-1', text: '上前打招呼', count: 256, rate: 63.4, nextNodeId: 'node-1-3c' },
        { id: 'choice-1-2b-2', text: '悄悄离开', count: 148, rate: 36.6, nextNodeId: 'node-1-3d' }
      ]
    },
    {
      nodeId: 'node-1-3c',
      title: '第三章：月下谈心',
      visitors: 256,
      choices: [
        { id: 'choice-1-3c-1', text: '邀请他一起吃晚饭', count: 130, rate: 50.8, nextNodeId: 'node-1-4a' },
        { id: 'choice-1-3c-2', text: '陪他看一会儿云', count: 126, rate: 49.2, nextNodeId: 'node-1-4b' }
      ]
    }
  ],
  overallFunnel: [
    { stage: '开始阅读', count: 1024, rate: 100 },
    { stage: '完成第一章', count: 890, rate: 86.9 },
    { stage: '完成第二章', count: 720, rate: 70.3 },
    { stage: '完成第三章', count: 560, rate: 54.7 },
    { stage: '达成结局', count: 456, rate: 44.5 }
  ]
  },
  'story-2': {
    nodes: [
      {
      nodeId: 'node-2-1',
      title: '序章：废弃空间站',
      visitors: 756,
      choices: [
        { id: 'choice-2-1-1', text: '谨慎行事，先做外部扫描', count: 412, rate: 54.5, nextNodeId: 'node-2-2a' },
        { id: 'choice-2-1-2', text: '直接进入空间站探索', count: 344, rate: 45.5, nextNodeId: 'node-2-2b' }
      ]
    },
    {
      nodeId: 'node-2-2a',
      title: '第二章：意外的发现',
      visitors: 412,
      choices: [
        { id: 'choice-2-2a-1', text: '前往生命反应所在地', count: 220, rate: 53.4, nextNodeId: 'node-2-3a' },
        { id: 'choice-2-2a-2', text: '先去控制室查看日志', count: 192, rate: 46.6, nextNodeId: 'node-2-3b' }
      ]
    },
    {
      nodeId: 'node-2-2b',
      title: '第二章：神秘的少女',
      visitors: 344,
      choices: [
        { id: 'choice-2-2b-1', text: '唤醒她', count: 180, rate: 52.3, nextNodeId: 'node-2-3c' },
        { id: 'choice-2-2b-2', text: '先搞清楚状况', count: 164, rate: 47.7, nextNodeId: 'node-2-3b' }
      ]
    },
    {
      nodeId: 'node-2-3b',
      title: '第三章：真相的碎片',
      visitors: 356,
      choices: [
        { id: 'choice-2-3b-1', text: '去找到那个少女', count: 215, rate: 60.4, nextNodeId: 'node-2-3c' },
        { id: 'choice-2-3b-2', text: '决定离开，不打扰她', count: 141, rate: 39.6, nextNodeId: 'node-2-4c' }
      ]
    }
  ],
  overallFunnel: [
    { stage: '开始阅读', count: 756, rate: 100 },
    { stage: '完成序章', count: 680, rate: 89.9 },
    { stage: '完成第二章', count: 540, rate: 71.4 },
    { stage: '完成第三章', count: 460, rate: 60.8 },
    { stage: '达成结局', count: 395, rate: 52.2 }
  ]
  },
  'story-3': {
    nodes: [
      {
      nodeId: 'node-3-1',
      title: '第一章：深山古寺',
      visitors: 1280,
      choices: [
        { id: 'choice-3-1-1', text: '上前帮助它', count: 768, rate: 60.0, nextNodeId: 'node-3-2a' },
        { id: 'choice-3-1-2', text: '保持警惕，远远观察', count: 512, rate: 40.0, nextNodeId: 'node-3-2b' }
      ]
    },
    {
      nodeId: 'node-3-2a',
      title: '第二章：受伤的九尾狐',
      visitors: 768,
      choices: [
        { id: 'choice-3-2a-1', text: '惊讶地询问她的身份', count: 400, rate: 52.1, nextNodeId: 'node-3-3a' },
        { id: 'choice-3-2a-2', text: '镇定地接受这个事实', count: 368, rate: 47.9, nextNodeId: 'node-3-3b' }
      ]
    },
    {
      nodeId: 'node-3-2b',
      title: '第二章：远远的守望',
      visitors: 512,
      choices: [
        { id: 'choice-3-2b-1', text: '救下它并带它离开', count: 280, rate: 54.7, nextNodeId: 'node-3-3c' },
        { id: 'choice-3-2b-2', text: '就在这里照顾它', count: 232, rate: 45.3, nextNodeId: 'node-3-3d' }
      ]
    },
    {
      nodeId: 'node-3-3a',
      title: '第三章：狐妖小九',
      visitors: 400,
      choices: [
        { id: 'choice-3-3a-1', text: '答应她的提议', count: 245, rate: 61.3, nextNodeId: 'node-3-4a' },
        { id: 'choice-3-3a-2', text: '婉言谢绝', count: 155, rate: 38.7, nextNodeId: 'node-3-4b' }
      ]
    }
  ],
  overallFunnel: [
    { stage: '开始阅读', count: 1280, rate: 100 },
    { stage: '完成第一章', count: 1150, rate: 89.8 },
    { stage: '完成第二章', count: 980, rate: 76.6 },
    { stage: '完成第三章', count: 790, rate: 61.7 },
    { stage: '达成结局', count: 685, rate: 53.5 }
  ]
  }
};

const settingReferenceTrends = {
  'user-1': {
    summary: {
      totalReferences: 45,
      weeklyReferences: 8,
      topReferenced: [
        {
          entryId: 'entry-1',
          title: '浮城',
          category: '地理',
          referenceCount: 23,
          trend: 'up',
          weeklyChange: 5
        },
        {
          entryId: 'entry-3',
          title: '天空守护者',
          category: '种族',
          referenceCount: 15,
          trend: 'up',
          weeklyChange: 2
        },
        {
          entryId: 'entry-2',
          title: '天空之境',
          category: '传说',
          referenceCount: 7,
          trend: 'stable',
          weeklyChange: 1
        }
      ]
    },
    trendData: [
      { week: '第1周', references: 3 },
      { week: '第2周', references: 5 },
      { week: '第3周', references: 6 },
      { week: '第4周', references: 8 },
      { week: '第5周', references: 7 },
      { week: '第6周', references: 9 },
      { week: '第7周', references: 8 }
    ],
    referenceSources: [
      { source: '故事引用', count: 28 },
      { source: '世界设定引用', count: 12 },
      { source: '评论提及', count: 5 }
    ]
  },
  'user-2': {
    summary: {
      totalReferences: 32,
      weeklyReferences: 5,
      topReferenced: [
        {
          entryId: 'entry-5',
          title: '超光速航行',
          category: '科技',
          referenceCount: 18,
          trend: 'up',
          weeklyChange: 3
        },
        {
          entryId: 'entry-4',
          title: '星际联邦',
          category: '政治',
          referenceCount: 10,
          trend: 'stable',
          weeklyChange: 1
        },
        {
          entryId: 'entry-6',
          title: '北辰号空间站',
          category: '地点',
          referenceCount: 4,
          trend: 'down',
          weeklyChange: -1
        }
      ]
    },
    trendData: [
      { week: '第1周', references: 2 },
      { week: '第2周', references: 4 },
      { week: '第3周', references: 5 },
      { week: '第4周', references: 6 },
      { week: '第5周', references: 5 },
      { week: '第6周', references: 4 },
      { week: '第7周', references: 6 }
    ],
    referenceSources: [
      { source: '故事引用', count: 20 },
      { source: '世界设定引用', count: 9 },
      { source: '评论提及', count: 3 }
    ]
  },
  'user-3': {
    summary: {
      totalReferences: 58,
      weeklyReferences: 12,
      topReferenced: [
        {
          entryId: 'entry-9',
          title: '九尾狐',
          category: '种族',
          referenceCount: 32,
          trend: 'up',
          weeklyChange: 7
        },
        {
          entryId: 'entry-8',
          title: '妖族',
          category: '种族',
          referenceCount: 18,
          trend: 'up',
          weeklyChange: 3
        },
        {
          entryId: 'entry-7',
          title: '大靖王朝',
          category: '政治',
          referenceCount: 8,
          trend: 'stable',
          weeklyChange: 2
        }
      ]
    },
    trendData: [
      { week: '第1周', references: 5 },
      { week: '第2周', references: 7 },
      { week: '第3周', references: 9 },
      { week: '第4周', references: 10 },
      { week: '第5周', references: 8 },
      { week: '第6周', references: 11 },
      { week: '第7周', references: 8 }
    ],
    referenceSources: [
      { source: '故事引用', count: 38 },
      { source: '世界设定引用', count: 15 },
      { source: '评论提及', count: 5 }
    ]
  }
};

const endingAchievements = {
  'story-1': {
    storyId: 'story-1',
    storyTitle: '浮城之恋',
    totalReaders: 1024,
    totalEndings: 4,
    overallAchievementRate: 44.5,
    averageEndingsPerReader: 1.2,
    endings: [
      {
        id: 'node-1-4b',
        title: '结局：云之彼端',
        endingType: 'happy',
        achievementCount: 156,
        achievementRate: 42,
        firstReachedAt: '2024-04-15',
        recentWeekCount: 28,
        trend: 'up'
      },
      {
        id: 'node-1-3a',
        title: '结局：天空的守护者',
        endingType: 'normal',
        achievementCount: 98,
        achievementRate: 26,
        firstReachedAt: '2024-04-18',
        recentWeekCount: 18,
        trend: 'stable'
      },
      {
        id: 'node-1-4a',
        title: '结局：烟火人间',
        endingType: 'bittersweet',
        achievementCount: 76,
        achievementRate: 20,
        firstReachedAt: '2024-04-20',
        recentWeekCount: 12,
        trend: 'up'
      },
      {
        id: 'node-1-3b',
        title: '结局：未完的故事',
        endingType: 'sad',
        achievementCount: 54,
        achievementRate: 14,
        firstReachedAt: '2024-04-22',
        recentWeekCount: 8,
        trend: 'down'
      }
    ],
    achievementTrend: [
      { date: '2024-05-06', totalAchievements: 320, newAchievements: 18 },
      { date: '2024-05-07', totalAchievements: 338, newAchievements: 22 },
      { date: '2024-05-08', totalAchievements: 360, newAchievements: 25 },
      { date: '2024-05-09', totalAchievements: 385, newAchievements: 28 },
      { date: '2024-05-10', totalAchievements: 405, newAchievements: 24 },
      { date: '2024-05-11', totalAchievements: 435, newAchievements: 32 },
      { date: '2024-05-12', totalAchievements: 456, newAchievements: 26 }
    ]
  },
  'story-2': {
    storyId: 'story-2',
    storyTitle: '星海彼端的约定',
    totalReaders: 756,
    totalEndings: 4,
    overallAchievementRate: 52.2,
    averageEndingsPerReader: 1.5,
    endings: [
      {
        id: 'node-2-4d',
        title: '结局：两个人的空间站',
        endingType: 'happy',
        achievementCount: 168,
        achievementRate: 45,
        firstReachedAt: '2024-03-20',
        recentWeekCount: 25,
        trend: 'up'
      },
      {
        id: 'node-2-4a',
        title: '结局：星河旅人',
        endingType: 'normal',
        achievementCount: 112,
        achievementRate: 30,
        firstReachedAt: '2024-03-25',
        recentWeekCount: 16,
        trend: 'stable'
      },
      {
        id: 'node-2-4b',
        title: '结局：记忆的重量',
        endingType: 'bittersweet',
        achievementCount: 60,
        achievementRate: 16,
        firstReachedAt: '2024-04-01',
        recentWeekCount: 8,
        trend: 'stable'
      },
      {
        id: 'node-2-4c',
        title: '结局：各自的轨道',
        endingType: 'sad',
        achievementCount: 33,
        achievementRate: 9,
        firstReachedAt: '2024-04-05',
        recentWeekCount: 4,
        trend: 'down'
      }
    ],
    achievementTrend: [
      { date: '2024-04-22', totalAchievements: 280, newAchievements: 15 },
      { date: '2024-04-23', totalAchievements: 295, newAchievements: 18 },
      { date: '2024-04-24', totalAchievements: 315, newAchievements: 22 },
      { date: '2024-04-25', totalAchievements: 335, newAchievements: 20 },
      { date: '2024-04-26', totalAchievements: 355, newAchievements: 24 },
      { date: '2024-04-27', totalAchievements: 380, newAchievements: 28 },
      { date: '2024-04-28', totalAchievements: 395, newAchievements: 16 }
    ]
  },
  'story-3': {
    storyId: 'story-3',
    storyTitle: '妖狐与书生',
    totalReaders: 1280,
    totalEndings: 4,
    overallAchievementRate: 53.5,
    averageEndingsPerReader: 1.8,
    endings: [
      {
        id: 'node-3-4a',
        title: '结局：京城烟火',
        endingType: 'happy',
        achievementCount: 245,
        achievementRate: 48,
        firstReachedAt: '2024-02-25',
        recentWeekCount: 35,
        trend: 'up'
      },
      {
        id: 'node-3-4d',
        title: '结局：一人一狐',
        endingType: 'normal',
        achievementCount: 128,
        achievementRate: 25,
        firstReachedAt: '2024-03-05',
        recentWeekCount: 22,
        trend: 'up'
      },
      {
        id: 'node-3-4f',
        title: '结局：古寺余生',
        endingType: 'bittersweet',
        achievementCount: 78,
        achievementRate: 15,
        firstReachedAt: '2024-03-12',
        recentWeekCount: 10,
        trend: 'stable'
      },
      {
        id: 'node-3-4c',
        title: '结局：山中岁月长',
        endingType: 'sad',
        achievementCount: 61,
        achievementRate: 12,
        firstReachedAt: '2024-03-18',
        recentWeekCount: 6,
        trend: 'down'
      }
    ],
    achievementTrend: [
      { date: '2024-04-29', totalAchievements: 450, newAchievements: 28 },
      { date: '2024-04-30', totalAchievements: 480, newAchievements: 32 },
      { date: '2024-05-01', totalAchievements: 520, newAchievements: 42 },
      { date: '2024-05-02', totalAchievements: 555, newAchievements: 38 },
      { date: '2024-05-03', totalAchievements: 600, newAchievements: 48 },
      { date: '2024-05-04', totalAchievements: 630, newAchievements: 30 },
      { date: '2024-05-05', totalAchievements: 685, newAchievements: 22 }
    ]
  }
};

const popularBranches = {
  'story-1': {
    storyId: 'story-1',
    storyTitle: '浮城之恋',
    totalBranches: 6,
    ranking: [
      {
        rank: 1,
        nodeId: 'node-1-1',
        nodeTitle: '第一章：云中之城',
        choiceId: 'choice-1-1-1',
        choiceText: '热情地帮他找书',
        selectCount: 620,
        selectRate: 60.5,
        isKeyBranch: true,
        leadsToEnding: false,
        trend: 'up'
      },
      {
        rank: 2,
        nodeId: 'node-1-2b',
        nodeTitle: '第二章：擦肩而过',
        choiceId: 'choice-1-2b-1',
        choiceText: '上前打招呼',
        selectCount: 256,
        selectRate: 63.4,
        isKeyBranch: true,
        leadsToEnding: false,
        trend: 'up'
      },
      {
        rank: 3,
        nodeId: 'node-1-2a',
        nodeTitle: '第二章：神秘的访客',
        choiceId: 'choice-1-2a-1',
        choiceText: '询问他的名字',
        selectCount: 342,
        selectRate: 55.2,
        isKeyBranch: true,
        leadsToEnding: false,
        trend: 'stable'
      },
      {
        rank: 4,
        nodeId: 'node-1-3c',
        nodeTitle: '第三章：月下谈心',
        choiceId: 'choice-1-3c-2',
        choiceText: '陪他看一会儿云',
        selectCount: 126,
        selectRate: 49.2,
        isKeyBranch: false,
        leadsToEnding: true,
        endingId: 'node-1-4b',
        trend: 'up'
      },
      {
        rank: 5,
        nodeId: 'node-1-3c',
        nodeTitle: '第三章：月下谈心',
        choiceId: 'choice-1-3c-1',
        choiceText: '邀请他一起吃晚饭',
        selectCount: 130,
        selectRate: 50.8,
        isKeyBranch: false,
        leadsToEnding: true,
        endingId: 'node-1-4a',
        trend: 'stable'
      },
      {
        rank: 6,
        nodeId: 'node-1-1',
        nodeTitle: '第一章：云中之城',
        choiceId: 'choice-1-1-2',
        choiceText: '保持距离，指给他方向',
        selectCount: 404,
        selectRate: 39.5,
        isKeyBranch: true,
        leadsToEnding: false,
        trend: 'down'
      }
    ],
    keyBranchPoints: [
      { nodeId: 'node-1-1', title: '第一章：云中之城', visitors: 1024, branchCount: 2, isFirstLevel: true },
      { nodeId: 'node-1-2a', title: '第二章：神秘的访客', visitors: 620, branchCount: 2, isFirstLevel: false },
      { nodeId: 'node-1-2b', title: '第二章：擦肩而过', visitors: 404, branchCount: 2, isFirstLevel: false }
    ]
  },
  'story-2': {
    storyId: 'story-2',
    storyTitle: '星海彼端的约定',
    totalBranches: 6,
    ranking: [
      {
        rank: 1,
        nodeId: 'node-2-1',
        nodeTitle: '序章：废弃空间站',
        choiceId: 'choice-2-1-1',
        choiceText: '谨慎行事，先做外部扫描',
        selectCount: 412,
        selectRate: 54.5,
        isKeyBranch: true,
        leadsToEnding: false,
        trend: 'up'
      },
      {
        rank: 2,
        nodeId: 'node-2-3b',
        nodeTitle: '第三章：真相的碎片',
        choiceId: 'choice-2-3b-1',
        choiceText: '去找到那个少女',
        selectCount: 215,
        selectRate: 60.4,
        isKeyBranch: true,
        leadsToEnding: false,
        trend: 'up'
      },
      {
        rank: 3,
        nodeId: 'node-2-2a',
        nodeTitle: '第二章：意外的发现',
        choiceId: 'choice-2-2a-1',
        choiceText: '前往生命反应所在地',
        selectCount: 220,
        selectRate: 53.4,
        isKeyBranch: true,
        leadsToEnding: false,
        trend: 'stable'
      },
      {
        rank: 4,
        nodeId: 'node-2-2b',
        nodeTitle: '第二章：神秘的少女',
        choiceId: 'choice-2-2b-1',
        choiceText: '唤醒她',
        selectCount: 180,
        selectRate: 52.3,
        isKeyBranch: false,
        leadsToEnding: false,
        trend: 'up'
      },
      {
        rank: 5,
        nodeId: 'node-2-3b',
        nodeTitle: '第三章：真相的碎片',
        choiceId: 'choice-2-3b-2',
        choiceText: '决定离开，不打扰她',
        selectCount: 141,
        selectRate: 39.6,
        isKeyBranch: false,
        leadsToEnding: true,
        endingId: 'node-2-4c',
        trend: 'down'
      },
      {
        rank: 6,
        nodeId: 'node-2-1',
        nodeTitle: '序章：废弃空间站',
        choiceId: 'choice-2-1-2',
        choiceText: '直接进入空间站探索',
        selectCount: 344,
        selectRate: 45.5,
        isKeyBranch: true,
        leadsToEnding: false,
        trend: 'stable'
      }
    ],
    keyBranchPoints: [
      { nodeId: 'node-2-1', title: '序章：废弃空间站', visitors: 756, branchCount: 2, isFirstLevel: true },
      { nodeId: 'node-2-2a', title: '第二章：意外的发现', visitors: 412, branchCount: 2, isFirstLevel: false },
      { nodeId: 'node-2-2b', title: '第二章：神秘的少女', visitors: 344, branchCount: 2, isFirstLevel: false }
    ]
  },
  'story-3': {
    storyId: 'story-3',
    storyTitle: '妖狐与书生',
    totalBranches: 6,
    ranking: [
      {
        rank: 1,
        nodeId: 'node-3-1',
        nodeTitle: '第一章：深山古寺',
        choiceId: 'choice-3-1-1',
        choiceText: '上前帮助它',
        selectCount: 768,
        selectRate: 60.0,
        isKeyBranch: true,
        leadsToEnding: false,
        trend: 'up'
      },
      {
        rank: 2,
        nodeId: 'node-3-3a',
        nodeTitle: '第三章：狐妖小九',
        choiceId: 'choice-3-3a-1',
        choiceText: '答应她的提议',
        selectCount: 245,
        selectRate: 61.3,
        isKeyBranch: true,
        leadsToEnding: true,
        endingId: 'node-3-4a',
        trend: 'up'
      },
      {
        rank: 3,
        nodeId: 'node-3-2a',
        nodeTitle: '第二章：受伤的九尾狐',
        choiceId: 'choice-3-2a-1',
        choiceText: '惊讶地询问她的身份',
        selectCount: 400,
        selectRate: 52.1,
        isKeyBranch: true,
        leadsToEnding: false,
        trend: 'stable'
      },
      {
        rank: 4,
        nodeId: 'node-3-2b',
        nodeTitle: '第二章：远远的守望',
        choiceId: 'choice-3-2b-1',
        choiceText: '救下它并带它离开',
        selectCount: 280,
        selectRate: 54.7,
        isKeyBranch: false,
        leadsToEnding: false,
        trend: 'up'
      },
      {
        rank: 5,
        nodeId: 'node-3-2b',
        nodeTitle: '第二章：远远的守望',
        choiceId: 'choice-3-2b-2',
        choiceText: '就在这里照顾它',
        selectCount: 232,
        selectRate: 45.3,
        isKeyBranch: false,
        leadsToEnding: true,
        endingId: 'node-3-4d',
        trend: 'stable'
      },
      {
        rank: 6,
        nodeId: 'node-3-1',
        nodeTitle: '第一章：深山古寺',
        choiceId: 'choice-3-1-2',
        choiceText: '保持警惕，远远观察',
        selectCount: 512,
        selectRate: 40.0,
        isKeyBranch: true,
        leadsToEnding: false,
        trend: 'down'
      }
    ],
    keyBranchPoints: [
      { nodeId: 'node-3-1', title: '第一章：深山古寺', visitors: 1280, branchCount: 2, isFirstLevel: true },
      { nodeId: 'node-3-2a', title: '第二章：受伤的九尾狐', visitors: 768, branchCount: 2, isFirstLevel: false },
      { nodeId: 'node-3-2b', title: '第二章：远远的守望', visitors: 512, branchCount: 2, isFirstLevel: false }
    ]
  }
};

const readerEndingDistribution = {
  'user-1': {
    authorId: 'user-1',
    totalReaders: 1024,
    totalEndingAchievements: 456,
    stories: [
      {
        storyId: 'story-1',
        storyTitle: '浮城之恋',
        byGender: {
          male: [
            { endingId: 'node-1-4b', endingTitle: '云之彼端', count: 52, rate: 38 },
            { endingId: 'node-1-3a', endingTitle: '天空的守护者', count: 35, rate: 26 },
            { endingId: 'node-1-4a', endingTitle: '烟火人间', count: 28, rate: 20 },
            { endingId: 'node-1-3b', endingTitle: '未完的故事', count: 22, rate: 16 }
          ],
          female: [
            { endingId: 'node-1-4b', endingTitle: '云之彼端', count: 78, rate: 45 },
            { endingId: 'node-1-3a', endingTitle: '天空的守护者', count: 42, rate: 24 },
            { endingId: 'node-1-4a', endingTitle: '烟火人间', count: 35, rate: 20 },
            { endingId: 'node-1-3b', endingTitle: '未完的故事', count: 18, rate: 11 }
          ],
          other: [
            { endingId: 'node-1-4b', endingTitle: '云之彼端', count: 26, rate: 40 },
            { endingId: 'node-1-3a', endingTitle: '天空的守护者', count: 21, rate: 32 },
            { endingId: 'node-1-4a', endingTitle: '烟火人间', count: 13, rate: 20 },
            { endingId: 'node-1-3b', endingTitle: '未完的故事', count: 5, rate: 8 }
          ]
        },
        byAgeGroup: {
          '18-24': [
            { endingId: 'node-1-4b', endingTitle: '云之彼端', count: 68, rate: 45 },
            { endingId: 'node-1-3a', endingTitle: '天空的守护者', count: 38, rate: 25 },
            { endingId: 'node-1-4a', endingTitle: '烟火人间', count: 28, rate: 18 },
            { endingId: 'node-1-3b', endingTitle: '未完的故事', count: 18, rate: 12 }
          ],
          '25-34': [
            { endingId: 'node-1-4b', endingTitle: '云之彼端', count: 52, rate: 40 },
            { endingId: 'node-1-3a', endingTitle: '天空的守护者', count: 35, rate: 27 },
            { endingId: 'node-1-4a', endingTitle: '烟火人间', count: 28, rate: 22 },
            { endingId: 'node-1-3b', endingTitle: '未完的故事', count: 14, rate: 11 }
          ],
          '35-44': [
            { endingId: 'node-1-4b', endingTitle: '云之彼端', count: 22, rate: 35 },
            { endingId: 'node-1-3a', endingTitle: '天空的守护者', count: 18, rate: 29 },
            { endingId: 'node-1-4a', endingTitle: '烟火人间', count: 15, rate: 24 },
            { endingId: 'node-1-3b', endingTitle: '未完的故事', count: 8, rate: 12 }
          ],
          '45+': [
            { endingId: 'node-1-4b', endingTitle: '云之彼端', count: 14, rate: 32 },
            { endingId: 'node-1-3a', endingTitle: '天空的守护者', count: 12, rate: 27 },
            { endingId: 'node-1-4a', endingTitle: '烟火人间', count: 10, rate: 23 },
            { endingId: 'node-1-3b', endingTitle: '未完的故事', count: 8, rate: 18 }
          ]
        },
        byRegion: {
          '华东': [
            { endingId: 'node-1-4b', endingTitle: '云之彼端', count: 42, rate: 44 },
            { endingId: 'node-1-3a', endingTitle: '天空的守护者', count: 25, rate: 26 },
            { endingId: 'node-1-4a', endingTitle: '烟火人间', count: 18, rate: 19 },
            { endingId: 'node-1-3b', endingTitle: '未完的故事', count: 11, rate: 11 }
          ],
          '华南': [
            { endingId: 'node-1-4b', endingTitle: '云之彼端', count: 35, rate: 40 },
            { endingId: 'node-1-3a', endingTitle: '天空的守护者', count: 22, rate: 25 },
            { endingId: 'node-1-4a', endingTitle: '烟火人间', count: 20, rate: 23 },
            { endingId: 'node-1-3b', endingTitle: '未完的故事', count: 10, rate: 12 }
          ],
          '华北': [
            { endingId: 'node-1-4b', endingTitle: '云之彼端', count: 28, rate: 42 },
            { endingId: 'node-1-3a', endingTitle: '天空的守护者', count: 20, rate: 30 },
            { endingId: 'node-1-4a', endingTitle: '烟火人间', count: 12, rate: 18 },
            { endingId: 'node-1-3b', endingTitle: '未完的故事', count: 7, rate: 10 }
          ],
          '其他': [
            { endingId: 'node-1-4b', endingTitle: '云之彼端', count: 51, rate: 38 },
            { endingId: 'node-1-3a', endingTitle: '天空的守护者', count: 31, rate: 23 },
            { endingId: 'node-1-4a', endingTitle: '烟火人间', count: 26, rate: 20 },
            { endingId: 'node-1-3b', endingTitle: '未完的故事', count: 26, rate: 19 }
          ]
        },
        endingTypeDistribution: [
          { type: 'happy', label: '喜剧结局', count: 156, rate: 42 },
          { type: 'normal', label: '普通结局', count: 98, rate: 26 },
          { type: 'bittersweet', label: '苦乐参半', count: 76, rate: 20 },
          { type: 'sad', label: '悲剧结局', count: 54, rate: 14 }
        ],
        completionPaths: {
          avgStepsToEnding: 3.2,
          fastestPath: 'node-1-1 → node-1-2b → node-1-3c → node-1-4b',
          mostPopularPath: 'node-1-1 → node-1-2a → node-1-3a',
          avgReplayCount: 1.8
        }
      }
    ],
    overallInsights: [
      { insight: '女性读者达成喜剧结局的比例比男性高 7%', type: 'gender' },
      { insight: '18-24 岁读者更倾向于探索多种结局', type: 'age' },
      { insight: '华东地区读者的结局达成率最高', type: 'region' },
      { insight: '「云之彼端」是最受欢迎的结局，占比 42%', type: 'ending' }
    ]
  },
  'user-2': {
    authorId: 'user-2',
    totalReaders: 756,
    totalEndingAchievements: 395,
    stories: [
      {
        storyId: 'story-2',
        storyTitle: '星海彼端的约定',
        byGender: {
          male: [
            { endingId: 'node-2-4d', endingTitle: '两个人的空间站', count: 58, rate: 42 },
            { endingId: 'node-2-4a', endingTitle: '星河旅人', count: 42, rate: 30 },
            { endingId: 'node-2-4b', endingTitle: '记忆的重量', count: 22, rate: 16 },
            { endingId: 'node-2-4c', endingTitle: '各自的轨道', count: 17, rate: 12 }
          ],
          female: [
            { endingId: 'node-2-4d', endingTitle: '两个人的空间站', count: 75, rate: 48 },
            { endingId: 'node-2-4a', endingTitle: '星河旅人', count: 45, rate: 29 },
            { endingId: 'node-2-4b', endingTitle: '记忆的重量', count: 25, rate: 16 },
            { endingId: 'node-2-4c', endingTitle: '各自的轨道', count: 11, rate: 7 }
          ],
          other: [
            { endingId: 'node-2-4d', endingTitle: '两个人的空间站', count: 35, rate: 40 },
            { endingId: 'node-2-4a', endingTitle: '星河旅人', count: 25, rate: 29 },
            { endingId: 'node-2-4b', endingTitle: '记忆的重量', count: 13, rate: 15 },
            { endingId: 'node-2-4c', endingTitle: '各自的轨道', count: 5, rate: 6 }
          ]
        },
        byAgeGroup: {
          '18-24': [
            { endingId: 'node-2-4d', endingTitle: '两个人的空间站', count: 62, rate: 48 },
            { endingId: 'node-2-4a', endingTitle: '星河旅人', count: 35, rate: 27 },
            { endingId: 'node-2-4b', endingTitle: '记忆的重量', count: 20, rate: 16 },
            { endingId: 'node-2-4c', endingTitle: '各自的轨道', count: 12, rate: 9 }
          ],
          '25-34': [
            { endingId: 'node-2-4d', endingTitle: '两个人的空间站', count: 58, rate: 44 },
            { endingId: 'node-2-4a', endingTitle: '星河旅人', count: 40, rate: 30 },
            { endingId: 'node-2-4b', endingTitle: '记忆的重量', count: 22, rate: 17 },
            { endingId: 'node-2-4c', endingTitle: '各自的轨道', count: 12, rate: 9 }
          ],
          '35-44': [
            { endingId: 'node-2-4d', endingTitle: '两个人的空间站', count: 32, rate: 40 },
            { endingId: 'node-2-4a', endingTitle: '星河旅人', count: 24, rate: 30 },
            { endingId: 'node-2-4b', endingTitle: '记忆的重量', count: 14, rate: 18 },
            { endingId: 'node-2-4c', endingTitle: '各自的轨道', count: 10, rate: 12 }
          ],
          '45+': [
            { endingId: 'node-2-4d', endingTitle: '两个人的空间站', count: 16, rate: 38 },
            { endingId: 'node-2-4a', endingTitle: '星河旅人', count: 13, rate: 31 },
            { endingId: 'node-2-4b', endingTitle: '记忆的重量', count: 8, rate: 19 },
            { endingId: 'node-2-4c', endingTitle: '各自的轨道', count: 5, rate: 12 }
          ]
        },
        byRegion: {
          '华东': [
            { endingId: 'node-2-4d', endingTitle: '两个人的空间站', count: 52, rate: 47 },
            { endingId: 'node-2-4a', endingTitle: '星河旅人', count: 30, rate: 27 },
            { endingId: 'node-2-4b', endingTitle: '记忆的重量', count: 18, rate: 16 },
            { endingId: 'node-2-4c', endingTitle: '各自的轨道', count: 11, rate: 10 }
          ],
          '华南': [
            { endingId: 'node-2-4d', endingTitle: '两个人的空间站', count: 42, rate: 44 },
            { endingId: 'node-2-4a', endingTitle: '星河旅人', count: 28, rate: 29 },
            { endingId: 'node-2-4b', endingTitle: '记忆的重量', count: 15, rate: 16 },
            { endingId: 'node-2-4c', endingTitle: '各自的轨道', count: 10, rate: 11 }
          ],
          '华北': [
            { endingId: 'node-2-4d', endingTitle: '两个人的空间站', count: 35, rate: 42 },
            { endingId: 'node-2-4a', endingTitle: '星河旅人', count: 25, rate: 30 },
            { endingId: 'node-2-4b', endingTitle: '记忆的重量', count: 14, rate: 17 },
            { endingId: 'node-2-4c', endingTitle: '各自的轨道', count: 8, rate: 11 }
          ],
          '其他': [
            { endingId: 'node-2-4d', endingTitle: '两个人的空间站', count: 39, rate: 39 },
            { endingId: 'node-2-4a', endingTitle: '星河旅人', count: 29, rate: 29 },
            { endingId: 'node-2-4b', endingTitle: '记忆的重量', count: 13, rate: 13 },
            { endingId: 'node-2-4c', endingTitle: '各自的轨道', count: 4, rate: 4 }
          ]
        },
        endingTypeDistribution: [
          { type: 'happy', label: '喜剧结局', count: 168, rate: 45 },
          { type: 'normal', label: '普通结局', count: 112, rate: 30 },
          { type: 'bittersweet', label: '苦乐参半', count: 60, rate: 16 },
          { type: 'sad', label: '悲剧结局', count: 33, rate: 9 }
        ],
        completionPaths: {
          avgStepsToEnding: 3.5,
          fastestPath: 'node-2-1 → node-2-2b → node-2-3b → node-2-4c',
          mostPopularPath: 'node-2-1 → node-2-2a → node-2-3a → node-2-4d',
          avgReplayCount: 2.1
        }
      }
    ],
    overallInsights: [
      { insight: '女性读者更偏好圆满结局，男性更偏好开放结局', type: 'gender' },
      { insight: '年轻读者重玩率更高，平均重玩 2.5 次', type: 'age' },
      { insight: '科幻题材在华东地区最受欢迎', type: 'region' },
      { insight: '「两个人的空间站」是人气最高的结局', type: 'ending' }
    ]
  },
  'user-3': {
    authorId: 'user-3',
    totalReaders: 1280,
    totalEndingAchievements: 685,
    stories: [
      {
        storyId: 'story-3',
        storyTitle: '妖狐与书生',
        byGender: {
          male: [
            { endingId: 'node-3-4a', endingTitle: '京城烟火', count: 82, rate: 45 },
            { endingId: 'node-3-4d', endingTitle: '一人一狐', count: 45, rate: 25 },
            { endingId: 'node-3-4f', endingTitle: '古寺余生', count: 28, rate: 15 },
            { endingId: 'node-3-4c', endingTitle: '山中岁月长', count: 28, rate: 15 }
          ],
          female: [
            { endingId: 'node-3-4a', endingTitle: '京城烟火', count: 130, rate: 50 },
            { endingId: 'node-3-4d', endingTitle: '一人一狐', count: 62, rate: 24 },
            { endingId: 'node-3-4f', endingTitle: '古寺余生', count: 38, rate: 15 },
            { endingId: 'node-3-4c', endingTitle: '山中岁月长', count: 28, rate: 11 }
          ],
          other: [
            { endingId: 'node-3-4a', endingTitle: '京城烟火', count: 33, rate: 42 },
            { endingId: 'node-3-4d', endingTitle: '一人一狐', count: 21, rate: 27 },
            { endingId: 'node-3-4f', endingTitle: '古寺余生', count: 12, rate: 15 },
            { endingId: 'node-3-4c', endingTitle: '山中岁月长', count: 5, rate: 6 }
          ]
        },
        byAgeGroup: {
          '18-24': [
            { endingId: 'node-3-4a', endingTitle: '京城烟火', count: 108, rate: 50 },
            { endingId: 'node-3-4d', endingTitle: '一人一狐', count: 52, rate: 24 },
            { endingId: 'node-3-4f', endingTitle: '古寺余生', count: 32, rate: 15 },
            { endingId: 'node-3-4c', endingTitle: '山中岁月长', count: 24, rate: 11 }
          ],
          '25-34': [
            { endingId: 'node-3-4a', endingTitle: '京城烟火', count: 85, rate: 47 },
            { endingId: 'node-3-4d', endingTitle: '一人一狐', count: 45, rate: 25 },
            { endingId: 'node-3-4f', endingTitle: '古寺余生', count: 28, rate: 16 },
            { endingId: 'node-3-4c', endingTitle: '山中岁月长', count: 22, rate: 12 }
          ],
          '35-44': [
            { endingId: 'node-3-4a', endingTitle: '京城烟火', count: 35, rate: 42 },
            { endingId: 'node-3-4d', endingTitle: '一人一狐', count: 22, rate: 26 },
            { endingId: 'node-3-4f', endingTitle: '古寺余生', count: 15, rate: 18 },
            { endingId: 'node-3-4c', endingTitle: '山中岁月长', count: 12, rate: 14 }
          ],
          '45+': [
            { endingId: 'node-3-4a', endingTitle: '京城烟火', count: 17, rate: 38 },
            { endingId: 'node-3-4d', endingTitle: '一人一狐', count: 9, rate: 20 },
            { endingId: 'node-3-4f', endingTitle: '古寺余生', count: 9, rate: 20 },
            { endingId: 'node-3-4c', endingTitle: '山中岁月长', count: 3, rate: 22 }
          ]
        },
        byRegion: {
          '华东': [
            { endingId: 'node-3-4a', endingTitle: '京城烟火', count: 68, rate: 49 },
            { endingId: 'node-3-4d', endingTitle: '一人一狐', count: 32, rate: 23 },
            { endingId: 'node-3-4f', endingTitle: '古寺余生', count: 20, rate: 14 },
            { endingId: 'node-3-4c', endingTitle: '山中岁月长', count: 18, rate: 13 }
          ],
          '华南': [
            { endingId: 'node-3-4a', endingTitle: '京城烟火', count: 55, rate: 47 },
            { endingId: 'node-3-4d', endingTitle: '一人一狐', count: 28, rate: 24 },
            { endingId: 'node-3-4f', endingTitle: '古寺余生', count: 18, rate: 15 },
            { endingId: 'node-3-4c', endingTitle: '山中岁月长', count: 16, rate: 14 }
          ],
          '华北': [
            { endingId: 'node-3-4a', endingTitle: '京城烟火', count: 48, rate: 46 },
            { endingId: 'node-3-4d', endingTitle: '一人一狐', count: 25, rate: 24 },
            { endingId: 'node-3-4f', endingTitle: '古寺余生', count: 16, rate: 15 },
            { endingId: 'node-3-4c', endingTitle: '山中岁月长', count: 15, rate: 15 }
          ],
          '其他': [
            { endingId: 'node-3-4a', endingTitle: '京城烟火', count: 74, rate: 43 },
            { endingId: 'node-3-4d', endingTitle: '一人一狐', count: 43, rate: 25 },
            { endingId: 'node-3-4f', endingTitle: '古寺余生', count: 24, rate: 14 },
            { endingId: 'node-3-4c', endingTitle: '山中岁月长', count: 12, rate: 7 }
          ]
        },
        endingTypeDistribution: [
          { type: 'happy', label: '喜剧结局', count: 245, rate: 48 },
          { type: 'normal', label: '普通结局', count: 128, rate: 25 },
          { type: 'bittersweet', label: '苦乐参半', count: 78, rate: 15 },
          { type: 'sad', label: '悲剧结局', count: 61, rate: 12 }
        ],
        completionPaths: {
          avgStepsToEnding: 3.8,
          fastestPath: 'node-3-1 → node-3-2a → node-3-3a → node-3-4a',
          mostPopularPath: 'node-3-1 → node-3-2a → node-3-3a → node-3-4a',
          avgReplayCount: 2.5
        }
      }
    ],
    overallInsights: [
      { insight: '女性读者对恋爱结局的偏好明显高于男性', type: 'gender' },
      { insight: '年长读者更能接受悲剧结局', type: 'age' },
      { insight: '古风题材在北方地区人气更高', type: 'region' },
      { insight: '「京城烟火」作为真结局，获得近半数读者青睐', type: 'ending' }
    ]
  }
};

const auditLogs = [
  {
    id: 'audit-log-1',
    targetType: 'story',
    targetId: 'story-1',
    targetTitle: '浮城之恋',
    action: 'approve',
    auditLevel: 'G',
    auditorId: 'admin-1',
    auditorName: '管理员',
    remark: '内容健康，适合全年龄段阅读',
    createdAt: '2024-04-02 10:00:00'
  },
  {
    id: 'audit-log-2',
    targetType: 'story',
    targetId: 'story-2',
    targetTitle: '星海彼端的约定',
    action: 'approve',
    auditLevel: 'G',
    auditorId: 'admin-1',
    auditorName: '管理员',
    remark: '内容积极向上，无违规内容',
    createdAt: '2024-03-16 14:30:00'
  },
  {
    id: 'audit-log-3',
    targetType: 'world',
    targetId: 'world-1',
    targetTitle: '浮城世界观',
    action: 'approve',
    auditLevel: 'G',
    auditorId: 'admin-1',
    auditorName: '管理员',
    remark: '世界观设定完整，内容健康',
    createdAt: '2024-01-22 09:15:00'
  },
  {
    id: 'audit-log-4',
    targetType: 'world',
    targetId: 'world-2',
    targetTitle: '星际时代',
    action: 'approve',
    auditLevel: 'G',
    auditorId: 'admin-2',
    auditorName: '审核员小王',
    remark: '科幻设定合理，无违规内容',
    createdAt: '2024-02-12 16:45:00'
  },
  {
    id: 'audit-log-5',
    targetType: 'comment',
    targetId: 'comment-7',
    targetTitle: '评论-京城烟火这个结局太圆满了...',
    action: 'reject',
    auditLevel: null,
    auditorId: 'admin-1',
    auditorName: '管理员',
    remark: '内容包含不当表述',
    createdAt: '2024-03-02 11:20:00'
  }
];

const auditStats = {
  pending: {
    stories: 1,
    worlds: 1,
    comments: 1,
    total: 3
  },
  approved: {
    stories: 2,
    worlds: 2,
    comments: 5,
    total: 9
  },
  rejected: {
    stories: 0,
    worlds: 0,
    comments: 1,
    total: 1
  }
};

const themeHalls = [
  {
    id: 'hall-1',
    name: '九霄云天录',
    cover: '🏔️',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: '一个修仙问道的宏大世界，万族林立，宗门万千，少年踏歌而行，逆天改命。',
    tagline: '一念仙魔，万载春秋',
    fullDescription: '九霄云天，九天之上，云海翻涌，万族共生于此界。上古一战，仙魔争锋，天道崩碎，留万载纷争。三千年后，仙门鼎盛，魔道蛰伏，妖族盘踞西荒，人族居中土。青云宗少年云凌霄，身怀上古剑冢传承，誓要踏破九天，问道长生。一路红颜相伴，兄弟同袍，问剑天涯。然天道苍茫，正邪难辨，宿命之局早已铺开，少年执剑，直指九霄！',
    genre: '仙侠',
    likes: 12580,
    characterCount: 86,
    factionCount: 12,
    timelineCount: 9,
    storyCount: 34,
    regions: ['中土神州', '西荒魔域', '北海冰原', '南疆十万大山', '东海外域'],
    powerSystems: ['炼气筑基', '金丹元婴', '化神渡劫', '大乘飞升'],
    coreConflicts: ['仙魔之争，正邪不两立', '宗门利益纠葛', '上古秘辛复苏', '天道轮回宿命'],
    featuredCharacters: [
      { name: '云凌霄', avatar: '⚔️' },
      { name: '慕清寒', avatar: '🌸' },
      { name: '炎无极', avatar: '🔥' }
    ],
    featuredFactions: [
      { name: '青云宗', colorType: 'primary' },
      { name: '天魔殿', colorType: 'error' },
      { name: '万剑阁', colorType: 'info' }
    ],
    authorId: 'user-1',
    authorName: '月下独酌',
    createdAt: '2024-03-15'
  },
  {
    id: 'hall-2',
    name: '奥斯特瑞亚大陆',
    cover: '🐉',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: '龙与骑士的史诗大陆，人类、精灵、矮人、兽人在诸神见证下谱写传奇。',
    tagline: '龙族之誓，不灭的荣耀',
    fullDescription: '奥斯特瑞亚大陆，一片被诸神祝福的土地。千年之前，巨龙一族与人类签下誓约，共同守护这片大陆的和平。然而黑暗的力量正在北境悄然苏醒，死亡骑士率领亡灵大军步步紧逼。年轻的圣骑士阿尔萨斯，背负着家族的荣耀与诅咒，踏上了寻找真相的旅途。在精灵公主艾蕾娜和矮人战士索林的陪伴下，他们将揭开龙族最古老的秘密。',
    genre: '西幻',
    likes: 9876,
    characterCount: 72,
    factionCount: 8,
    timelineCount: 7,
    storyCount: 28,
    regions: ['人类王国', '精灵森林', '矮人山脉', '兽人草原', '北境冰原'],
    powerSystems: ['圣光之力', '自然魔法', '符文锻造', '龙血秘术'],
    coreConflicts: ['光明与黑暗的永恒之战', '龙族誓约的秘密', '诸神遗产的争夺', '王国的内忧外患'],
    featuredCharacters: [
      { name: '阿尔萨斯', avatar: '🗡️' },
      { name: '艾蕾娜', avatar: '💎' },
      { name: '索林', avatar: '🔨' }
    ],
    featuredFactions: [
      { name: '圣光骑士团', colorType: 'warning' },
      { name: '银月议会', colorType: 'info' },
      { name: '龙鳞守护', colorType: 'success' }
    ],
    authorId: 'user-2',
    authorName: '星河漫步者',
    createdAt: '2024-02-20'
  },
  {
    id: 'hall-3',
    name: '霓虹纪元2099',
    cover: '🌃',
    gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    description: '霓虹闪烁的未来都市，义体改造、黑客入侵、企业霸权，霓虹灯下谁主沉浮？',
    tagline: '义体不朽，数据永生',
    fullDescription: '2099年，第三次世界大战后，巨型企业掌握了世界的主权。荒坂集团、军用科技、网络监察者……无数庞然大物在名为夜之城的舞台上角逐。雇佣兵V，在一次失败的任务中意外获得了神秘生物芯片，从此他的意识与传奇黑客银翼共享同一个身体。他们必须在企业的追杀下，找到通往自由的道路。',
    genre: '赛博朋克',
    likes: 8432,
    characterCount: 54,
    factionCount: 10,
    timelineCount: 8,
    storyCount: 22,
    regions: ['沃森区', '歌舞伎町', '太平洲', '市政中心', '圣多明戈'],
    powerSystems: ['义体改造', '赛博黑客', '企业科技', '战斗芯片'],
    coreConflicts: ['企业霸权与自由意志', '义体过载与人性挣扎', '数据永生的伦理', '地下秩序的博弈'],
    featuredCharacters: [
      { name: 'V', avatar: '🕶️' },
      { name: '银翼', avatar: '🦾' },
      { name: '幽灵', avatar: '💀' }
    ],
    featuredFactions: [
      { name: '荒坂集团', colorType: 'error' },
      { name: '夜之城佣兵', colorType: 'warning' },
      { name: '网络黑客', colorType: 'info' }
    ],
    authorId: 'user-3',
    authorName: '梦境织者',
    createdAt: '2024-04-10'
  },
  {
    id: 'hall-4',
    name: '锦绣京华',
    cover: '🏯',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    description: '大明风华，皇城巍巍，权谋交织，儿女情长，一卷盛世丹青。',
    tagline: '朱墙之内，风月无边',
    fullDescription: '天启三年，大明王朝正值鼎盛。然而盛世之下，暗流涌动。东宫太子与裕王的储君之争愈演愈烈，朝中世家联盟与锦衣卫的博弈日趋白热化。将门之女苏云裳，在一场宫宴中邂逅了微服出访的皇三子萧景琰，从此两人的命运紧紧交织。权谋、宫斗、爱情、忠义……在这座锦绣皇城中，每个人都在书写自己的传奇。',
    genre: '古风',
    likes: 15230,
    characterCount: 98,
    factionCount: 14,
    timelineCount: 12,
    storyCount: 45,
    regions: ['紫禁皇城', '江南水乡', '漠北边关', '巴蜀天府', '岭南百越'],
    powerSystems: ['儒家理学', '武林绝学', '宫廷权术', '商贾之道'],
    coreConflicts: ['储君之争，骨肉相残', '文臣武将的朝堂博弈', '后宫佳丽的爱恨纠葛', '江湖与庙堂的恩怨'],
    featuredCharacters: [
      { name: '萧景琰', avatar: '👑' },
      { name: '苏云裳', avatar: '🎐' },
      { name: '卫无忌', avatar: '🏮' }
    ],
    featuredFactions: [
      { name: '东宫太子党', colorType: 'primary' },
      { name: '世家联盟', colorType: 'success' },
      { name: '锦衣卫', colorType: 'error' }
    ],
    authorId: 'user-1',
    authorName: '月下独酌',
    createdAt: '2024-01-30'
  },
  {
    id: 'hall-5',
    name: '星穹学院',
    cover: '🎓',
    gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    description: '漂浮于云海之上的魔法学院，来自五湖四海的少年们在此开启青春冒险。',
    tagline: '星辰指路，青春无悔',
    fullDescription: '在云海之巅，有一座漂浮的学院——星穹学院。这里汇聚着来自五湖四海的魔法天才，他们将在这里度过七年的青春岁月。来自偏远小镇的少年夜星尘，以特等生的身份进入学院，却意外发现自己身怀传说中的星辰之体。在室友风间澈和神秘少女林晓月的陪伴下，他将一步步揭开学院千年前的秘密，以及自己身世的真相。',
    genre: '校园',
    likes: 11050,
    characterCount: 67,
    factionCount: 6,
    timelineCount: 10,
    storyCount: 31,
    regions: ['星穹主校区', '试炼之森', '元素之塔', '图书馆迷宫', '夜空竞技场'],
    powerSystems: ['元素魔法', '星辰之力', '召唤契约', '符文炼金术'],
    coreConflicts: ['学院内部的派系斗争', '千年前的灾厄重现', '天才之间的较量', '青春与梦想的抉择'],
    featuredCharacters: [
      { name: '夜星尘', avatar: '⭐' },
      { name: '林晓月', avatar: '🌙' },
      { name: '风间澈', avatar: '🍃' }
    ],
    featuredFactions: [
      { name: '星辰社', colorType: 'primary' },
      { name: '月华会', colorType: 'info' },
      { name: '拂晓骑士团', colorType: 'warning' }
    ],
    authorId: 'user-2',
    authorName: '星河漫步者',
    createdAt: '2024-03-05'
  },
  {
    id: 'hall-6',
    name: '灰烬纪元',
    cover: '☄️',
    gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    description: '大灾变后的废土世界，幸存者们在辐射与变异中寻找文明的火种。',
    tagline: '灰烬之中，希望不灭',
    fullDescription: '天启之日，核弹与天灾同时降临，文明在一夜之间化为灰烬。一百年后，世界被辐射尘与变异生物所统治，幸存者们在废土上建立起一个个小型聚落。流浪者雷烬，在一次拾荒中意外救下了神秘的少女寒霜。她身上携带着大灾变前最尖端科技实验室的钥匙。为了找到传说中的「新伊甸」避难所，他们和铁皮组成的三人小队踏上了跨越整个废土的旅程。',
    genre: '末世',
    likes: 7820,
    characterCount: 45,
    factionCount: 9,
    timelineCount: 6,
    storyCount: 19,
    regions: ['死亡沙漠', '辐射都市', '地下避难所', '山脉要塞', '海岸遗城'],
    powerSystems: ['辐射异能', '基因改造', '机械义体', '生化变异'],
    coreConflicts: ['生存与人性的抉择', '资源争夺的残酷', '变异与进化的边界', '文明火种的延续'],
    featuredCharacters: [
      { name: '雷烬', avatar: '⚡' },
      { name: '寒霜', avatar: '❄️' },
      { name: '铁皮', avatar: '🦾' }
    ],
    featuredFactions: [
      { name: '钢铁兄弟会', colorType: 'default' },
      { name: '新纪元军', colorType: 'warning' },
      { name: '流浪商队', colorType: 'success' }
    ],
    authorId: 'user-3',
    authorName: '梦境织者',
    createdAt: '2024-04-22'
  }
];

const themeHallCharacters = {
  'hall-1': [
    {
      id: 'char-1', hallId: 'hall-1', name: '云凌霄', avatar: '⚔️',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      role: '主角', roleType: 'primary', title: '青云宗首席弟子 · 剑冢传人',
      traits: ['重情重义', '坚韧不拔', '剑心通明'],
      bio: '青云宗外门弟子，身怀上古剑冢传承，以一柄青霜剑踏遍九州。年少时惨遭灭门，被青云宗宗主收养，立志踏破天道，寻回家人真相。',
      relations: [
        { name: '慕清寒', icon: '🌸', relation: '道侣' },
        { name: '炎无极', icon: '🔥', relation: '结义兄弟' },
        { name: '墨千秋', icon: '🗡️', relation: '亦师亦父' }
      ]
    },
    {
      id: 'char-2', hallId: 'hall-1', name: '慕清寒', avatar: '🌸',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      role: '主角', roleType: 'primary', title: '冰心谷圣女 · 上古丹道天才',
      traits: ['外冷内热', '医术通神', '痴情不悔'],
      bio: '冰心谷百年一遇的丹道天才，身具先天道体。初遇云凌霄便芳心暗许，从此相伴天涯，生死与共。',
      relations: [
        { name: '云凌霄', icon: '⚔️', relation: '道侣' },
        { name: '苏灵儿', icon: '🦋', relation: '师姐' }
      ]
    },
    {
      id: 'char-3', hallId: 'hall-1', name: '炎无极', avatar: '🔥',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      role: '主角', roleType: 'warning', title: '焚天阁少主 · 赤炎之体',
      traits: ['豪迈不羁', '热血赤胆', '至情至性'],
      bio: '焚天阁少主，身具赤炎之体，性格豪迈，与云凌霄一见如故，结为异姓兄弟。为兄弟两肋插刀，在所不辞。',
      relations: [
        { name: '云凌霄', icon: '⚔️', relation: '结义兄弟' },
        { name: '铁山', icon: '🔨', relation: '师父' }
      ]
    },
    {
      id: 'char-4', hallId: 'hall-1', name: '血无痕', avatar: '💀',
      gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
      role: '反派', roleType: 'error', title: '天魔殿殿主 · 魔道至尊',
      traits: ['冷酷无情', '城府极深', '杀伐果断'],
      bio: '天魔殿之主，上古魔功盖世，欲一统九界，建立魔道秩序。与青云宗有血海深仇，云凌霄最大的对手。',
      relations: [
        { name: '云凌霄', icon: '⚔️', relation: '宿敌' }
      ]
    },
    {
      id: 'char-5', hallId: 'hall-1', name: '墨千秋', avatar: '🗡️',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      role: '配角', roleType: 'info', title: '青云宗宗主 · 剑道泰斗',
      traits: ['正气凛然', '慧眼识才', '深藏不露'],
      bio: '青云宗宗主，剑道第一人。收养云凌霄，传其衣钵，实为上古剑仙转世，默默守护九霄。',
      relations: [
        { name: '云凌霄', icon: '⚔️', relation: '师徒' }
      ]
    },
    {
      id: 'char-6', hallId: 'hall-1', name: '白无恨', avatar: '🦊',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      role: '中立', roleType: 'success', title: '九尾天狐 · 妖族公主',
      traits: ['聪慧狡黠', '亦正亦邪', '游戏人间'],
      bio: '妖族公主，化形入世游戏红尘。与云凌霄亦敌亦友，时常相助，背后似乎藏着妖族的古老秘密。',
      relations: [
        { name: '云凌霄', icon: '⚔️', relation: '亦敌亦友' }
      ]
    }
  ],
  'hall-2': [
    {
      id: 'char-7', hallId: 'hall-2', name: '阿尔萨斯', avatar: '🗡️',
      gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      role: '主角', roleType: 'primary', title: '圣光骑士团圣剑骑士',
      traits: ['正直勇敢', '荣誉感强', '坚韧不拔'],
      bio: '出生于没落贵族家庭，年少时便展现出惊人的圣光亲和力。以第一名成绩从骑士学院毕业，加入骑士团。',
      relations: [
        { name: '艾蕾娜', icon: '💎', relation: '爱人' },
        { name: '索林', icon: '🔨', relation: '战友' }
      ]
    },
    {
      id: 'char-8', hallId: 'hall-2', name: '艾蕾娜', avatar: '💎',
      gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      role: '主角', roleType: 'primary', title: '银月精灵族公主 · 自然祭司',
      traits: ['优雅高贵', '善良博爱', '精通魔法'],
      bio: '精灵族百年一遇的魔法天才，继承了月光女神的祝福。为阻止黑暗扩散而离开故乡，踏上了冒险之旅。',
      relations: [
        { name: '阿尔萨斯', icon: '🗡️', relation: '爱人' }
      ]
    }
  ]
};

const themeHallFactions = {
  'hall-1': [
    {
      id: 'fact-1', hallId: 'hall-1', name: '青云宗', logo: '🗡️',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      alignment: '正道领袖', alignmentType: 'success',
      description: '正道第一大宗门，位于青云山脉之上，剑道传承千年，弟子遍布天下。以除魔卫道为己任。',
      territory: '青云山脉', leader: '墨千秋', memberCount: 3280,
      keyMembers: [
        { name: '墨千秋', avatar: '🗡️' },
        { name: '云凌霄', avatar: '⚔️' },
        { name: '李长风', avatar: '📜' }
      ]
    },
    {
      id: 'fact-2', hallId: 'hall-1', name: '天魔殿', logo: '💀',
      gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
      alignment: '魔道至尊', alignmentType: 'error',
      description: '魔道第一势力，盘踞西荒魔域。殿主血无痕魔功盖世，欲一统九霄建立魔道秩序。',
      territory: '西荒魔域', leader: '血无痕', memberCount: 5600,
      keyMembers: [
        { name: '血无痕', avatar: '💀' },
        { name: '暗影', avatar: '🌑' }
      ]
    },
    {
      id: 'fact-3', hallId: 'hall-1', name: '冰心谷', logo: '🌸',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      alignment: '正道', alignmentType: 'info',
      description: '女子宗门，以炼丹医术冠绝天下。谷中弟子皆为女子，医术通神，丹道无双。',
      territory: '冰心谷', leader: '苏灵儿', memberCount: 1200,
      keyMembers: [
        { name: '苏灵儿', avatar: '🦋' },
        { name: '慕清寒', avatar: '🌸' }
      ]
    },
    {
      id: 'fact-4', hallId: 'hall-1', name: '焚天阁', logo: '🔥',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      alignment: '正道盟友', alignmentType: 'warning',
      description: '火系功法天下闻名，少主炎无极身具赤炎之体。与青云宗世代交好。',
      territory: '赤炎山脉', leader: '炎霸天', memberCount: 2100,
      keyMembers: [
        { name: '炎霸天', avatar: '🔥' },
        { name: '炎无极', avatar: '🔥' }
      ]
    }
  ],
  'hall-2': [
    {
      id: 'fact-5', hallId: 'hall-2', name: '圣光骑士团', logo: '🛡️',
      gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      alignment: '光明阵营', alignmentType: 'success',
      description: '人类王国最精锐的武装力量，信奉光明之神，以圣光照耀黑暗之地。',
      territory: '圣光城堡', leader: '大团长 塞拉斯', memberCount: 5000,
      keyMembers: [
        { name: '塞拉斯', avatar: '⚔️' },
        { name: '阿尔萨斯', avatar: '🗡️' }
      ]
    },
    {
      id: 'fact-6', hallId: 'hall-2', name: '银月议会', logo: '🌙',
      gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      alignment: '精灵王国', alignmentType: 'info',
      description: '精灵族的最高统治机构，由各大氏族长老组成，守护着世界最古老的魔法秘密。',
      territory: '银月森林', leader: '月之祭司 塞琳娜', memberCount: 8000,
      keyMembers: [
        { name: '塞琳娜', avatar: '🌟' },
        { name: '艾蕾娜', avatar: '💎' }
      ]
    }
  ]
};

const themeHallTimeline = {
  'hall-1': [
    {
      id: 'tl-1', hallId: 'hall-1', era: '上古纪元', icon: '⭐', dotColor: '#ff6b6b',
      title: '仙魔大战', type: 'error',
      description: '上古仙人与魔族展开惊世大战，九天崩碎，无数强者陨落。天道残缺，留下无数秘辛。',
      impacts: ['天道残缺', '仙魔永世对立', '剑冢封印']
    },
    {
      id: 'tl-2', hallId: 'hall-1', era: '太古纪元', icon: '🏔️', dotColor: '#4ecdc4',
      title: '青云宗立派', type: 'success',
      description: '墨剑仙开宗立派，创青云剑道，护佑人族。传承千年，成为正道领袖。',
      impacts: ['正道崛起', '剑道传承']
    },
    {
      id: 'tl-3', hallId: 'hall-1', era: '近古纪元', icon: '💥', dotColor: '#ffe66d',
      title: '天魔殿复兴', type: 'warning',
      description: '血无痕一统魔道，建立天魔殿，西荒魔域成为魔道据点。',
      impacts: ['魔道统一', '正邪对立加剧']
    },
    {
      id: 'tl-4', hallId: 'hall-1', era: '当代 · 三年前', icon: '🔥', dotColor: '#ff9ff3',
      title: '云家灭门', type: 'error',
      description: '云家满门被灭，年幼的云凌霄被墨千秋所救，带入青云宗。',
      impacts: ['云凌霄入青云', '埋下复仇种子']
    },
    {
      id: 'tl-5', hallId: 'hall-1', era: '当代 · 今朝', icon: '⚔️', dotColor: '#9d4edd',
      title: '剑冢开启', type: 'success',
      description: '云凌霄获得上古剑冢传承，踏上修行之路。与慕清寒、炎无极相识。',
      impacts: ['主角团聚首', '上古秘辛初现']
    }
  ],
  'hall-2': [
    {
      id: 'tl-6', hallId: 'hall-2', era: '神话纪元', icon: '🐉', dotColor: '#ff6b6b',
      title: '龙誓之盟', type: 'success',
      description: '巨龙与人类始祖签下永恒誓约，共同守护奥斯特瑞亚大陆。',
      impacts: ['龙族庇护', '魔法传承']
    },
    {
      id: 'tl-7', hallId: 'hall-2', era: '当代 · 今日', icon: '⚔️', dotColor: '#9d4edd',
      title: '黑暗苏醒', type: 'warning',
      description: '死亡骑士率亡灵大军出现在北境，阿尔萨斯受命前去调查。',
      impacts: ['冒险开始', '主线启动']
    }
  ]
};

const themeHallStories = {
  'hall-1': [
    {
      id: 'story-th-1', hallId: 'hall-1', title: '九霄剑歌行', cover: '⚔️',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      type: '主线正篇',
      summary: '少年云凌霄踏入仙门，开启逆天修行之路。剑斩九天，问道长生，红颜相伴，兄弟同行。',
      author: '墨剑书生', wordCount: '128万', likes: 8920,
      protagonists: [
        { name: '云凌霄', avatar: '⚔️' },
        { name: '慕清寒', avatar: '🌸' }
      ]
    },
    {
      id: 'story-th-2', hallId: 'hall-1', title: '冰心照玉壶', cover: '🌸',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      type: '女主视角',
      summary: '慕清寒从冰心谷圣女到与云凌霄相识相知的往事。',
      author: '清寒仙子', wordCount: '45万', likes: 5230,
      protagonists: [
        { name: '慕清寒', avatar: '🌸' }
      ]
    },
    {
      id: 'story-th-3', hallId: 'hall-1', title: '赤炎焚天录', cover: '🔥',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      type: '兄弟篇',
      summary: '炎无极的成长故事，从焚天阁少主到独当一面的强者之路。',
      author: '赤炎', wordCount: '68万', likes: 4560,
      protagonists: [
        { name: '炎无极', avatar: '🔥' }
      ]
    },
    {
      id: 'story-th-4', hallId: 'hall-1', title: '魔血无痕', cover: '💀',
      gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
      type: '反派番外',
      summary: '血无痕的过往，他为何要一统九霄建立魔道秩序的真正原因。',
      author: '魔道观察者', wordCount: '32万', likes: 3890,
      protagonists: [
        { name: '血无痕', avatar: '💀' }
      ]
    }
  ],
  'hall-2': [
    {
      id: 'story-th-5', hallId: 'hall-2', title: '龙誓', cover: '🐉',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      type: '主线正篇',
      summary: '阿尔萨斯与艾蕾娜跨越种族的爱恋，和他们共同面对黑暗威胁的冒险故事。',
      author: '龙语者', wordCount: '98万', likes: 7234,
      protagonists: [
        { name: '阿尔萨斯', avatar: '🗡️' },
        { name: '艾蕾娜', avatar: '💎' }
      ]
    }
  ]
};

const creationTasks = [
  {
    id: 'task-1',
    title: '「盛夏恋歌」主题创作',
    description: '夏日炎炎，正是恋爱的季节！以"盛夏"为背景，创作一段甜蜜或遗憾的恋爱故事。让读者在文字中感受到夏日的热烈与悸动。',
    cover: '☀️',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    theme: '盛夏恋歌',
    type: 'themed',
    difficulty: 'medium',
    status: 'active',
    tags: ['恋爱', '夏日', '现代'],
    requirements: {
      minWordCount: 3000,
      minEndings: 2,
      mustIncludeTags: ['夏日', '恋爱'],
      forbiddenTags: ['恐怖', '血腥']
    },
    rewards: {
      points: 500,
      badge: '夏日恋曲',
      badgeIcon: '🌻',
      featured: true,
      cashReward: null
    },
    stages: [
      {
        id: 'stage-1-1',
        name: '第一阶段：人设构建',
        description: '创建故事的主要角色，设计他们的性格、背景和关系。',
        requirements: '提交至少2个主要角色的人设，包含姓名、性格、外貌、背景故事',
        deadline: '2024-07-01',
        reward: { points: 100, description: '100积分' },
        order: 1
      },
      {
        id: 'stage-1-2',
        name: '第二阶段：开篇创作',
        description: '完成故事的开篇章节，引入主要角色和夏日背景。',
        requirements: '完成至少3000字的开篇内容，包含2个以上的选择分支',
        deadline: '2024-07-15',
        reward: { points: 200, description: '200积分 + 解锁专属徽章' },
        order: 2
      },
      {
        id: 'stage-1-3',
        name: '第三阶段：结局完成',
        description: '完成所有故事线和结局，让故事完整呈现。',
        requirements: '完成至少2个不同结局，总字数不少于8000字',
        deadline: '2024-07-31',
        reward: { points: 200, description: '200积分 + 作品首页推荐' },
        order: 3
      }
    ],
    totalParticipants: 156,
    completedCount: 45,
    startDate: '2024-06-01',
    endDate: '2024-07-31',
    createdBy: 'platform',
    createdAt: '2024-05-25'
  },
  {
    id: 'task-2',
    title: '「浮城回声」官方同人创作',
    description: '基于官方世界观「浮城」进行同人创作，可以扩展原有故事，也可以创作全新的人物和剧情。让浮城的世界更加丰富多彩！',
    cover: '🏰',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    theme: '浮城同人',
    type: 'fanfic',
    difficulty: 'easy',
    status: 'active',
    tags: ['奇幻', '浮城', '同人'],
    requirements: {
      minWordCount: 2000,
      minEndings: 1,
      mustIncludeTags: ['浮城'],
      forbiddenTags: []
    },
    rewards: {
      points: 300,
      badge: '浮城建造师',
      badgeIcon: '🏰',
      featured: true,
      cashReward: null
    },
    stages: [
      {
        id: 'stage-2-1',
        name: '第一阶段：选题确认',
        description: '确定你的同人故事主题，是续写原作还是创作全新角色？',
        requirements: '提交故事大纲，说明与官方世界观的关联',
        deadline: '2024-06-20',
        reward: { points: 50, description: '50积分' },
        order: 1
      },
      {
        id: 'stage-2-2',
        name: '第二阶段：作品完成',
        description: '完成你的同人作品并发布。',
        requirements: '完成至少2000字的完整故事，包含至少1个结局',
        deadline: '2024-07-20',
        reward: { points: 250, description: '250积分 + 「浮城建造师」徽章' },
        order: 2
      }
    ],
    totalParticipants: 234,
    completedCount: 89,
    startDate: '2024-06-01',
    endDate: '2024-07-20',
    createdBy: 'platform',
    createdAt: '2024-05-20'
  },
  {
    id: 'task-3',
    title: '「星际迷航」长期创作计划',
    description: '参与官方大型科幻世界观「星际时代」的共建！这是一个长期创作任务，你将与其他作者一起构建一个宏大的星际世界。',
    cover: '🚀',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    theme: '星际共建',
    type: 'worldbuilding',
    difficulty: 'hard',
    status: 'active',
    tags: ['科幻', '星际', '世界共建'],
    requirements: {
      minWordCount: 5000,
      minEndings: 3,
      mustIncludeTags: ['科幻', '星际'],
      forbiddenTags: ['仙侠', '古风']
    },
    rewards: {
      points: 1000,
      badge: '星际开拓者',
      badgeIcon: '🌟',
      featured: true,
      cashReward: 500
    },
    stages: [
      {
        id: 'stage-3-1',
        name: '第一阶段：设定提交',
        description: '为星际世界贡献一个原创设定，可以是星球、种族、科技或历史事件。',
        requirements: '提交一份详细的设定文档，不少于1000字，附相关视觉描述',
        deadline: '2024-07-05',
        reward: { points: 200, description: '200积分' },
        order: 1
      },
      {
        id: 'stage-3-2',
        name: '第二阶段：故事创作',
        description: '基于你提交的设定，创作一个完整的互动故事。',
        requirements: '完成至少5000字的故事，包含3个以上不同结局',
        deadline: '2024-08-15',
        reward: { points: 400, description: '400积分 + 「星际开拓者」徽章' },
        order: 2
      },
      {
        id: 'stage-3-3',
        name: '第三阶段：跨作品联动',
        description: '与其他参与作者的故事进行联动，让世界观更加统一。',
        requirements: '在故事中至少引用2个其他作者的设定，并获得对方确认',
        deadline: '2024-09-30',
        reward: { points: 400, description: '400积分 + 500元现金奖励 + 永久署名' },
        order: 3
      }
    ],
    totalParticipants: 78,
    completedCount: 12,
    startDate: '2024-06-01',
    endDate: '2024-09-30',
    createdBy: 'platform',
    createdAt: '2024-05-15'
  },
  {
    id: 'task-4',
    title: '「古风新韵」短篇挑战',
    description: '用现代视角重新诠释古典故事，可以是改编传统神话，也可以是原创古风作品。让古老的韵味在新时代焕发光彩！',
    cover: '🏮',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    theme: '古风新韵',
    type: 'themed',
    difficulty: 'easy',
    status: 'upcoming',
    tags: ['古风', '创新', '短篇'],
    requirements: {
      minWordCount: 1500,
      minEndings: 1,
      mustIncludeTags: ['古风'],
      forbiddenTags: []
    },
    rewards: {
      points: 200,
      badge: '古韵新声',
      badgeIcon: '🎐',
      featured: true,
      cashReward: null
    },
    stages: [
      {
        id: 'stage-4-1',
        name: '第一阶段：创意构思',
        description: '构思你的故事创意，说明如何将古典元素与现代视角结合。',
        requirements: '提交300字以内的创意说明',
        deadline: '2024-08-01',
        reward: { points: 50, description: '50积分' },
        order: 1
      },
      {
        id: 'stage-4-2',
        name: '第二阶段：作品提交',
        description: '完成并提交你的短篇作品。',
        requirements: '完成1500-3000字的短篇故事',
        deadline: '2024-08-20',
        reward: { points: 150, description: '150积分 + 「古韵新声」徽章' },
        order: 2
      }
    ],
    totalParticipants: 0,
    completedCount: 0,
    startDate: '2024-08-01',
    endDate: '2024-08-20',
    createdBy: 'platform',
    createdAt: '2024-05-10'
  }
];

const userTaskProgress = [
  {
    id: 'progress-1',
    taskId: 'task-1',
    userId: 'user-1',
    username: '月下独酌',
    avatar: '🌸',
    storyId: 'story-1',
    storyTitle: '浮城之恋',
    currentStage: 2,
    overallProgress: 66,
    status: 'in_progress',
    joinedAt: '2024-06-02',
    stages: [
      {
        stageId: 'stage-1-1',
        status: 'completed',
        submittedAt: '2024-06-10',
        reviewedAt: '2024-06-11',
        reviewStatus: 'approved',
        reviewComment: '人设立体，角色关系设计巧妙',
        rewardClaimed: true
      },
      {
        stageId: 'stage-1-2',
        status: 'in_review',
        submittedAt: '2024-06-25',
        reviewedAt: null,
        reviewStatus: 'pending',
        reviewComment: null,
        rewardClaimed: false
      },
      {
        stageId: 'stage-1-3',
        status: 'pending',
        submittedAt: null,
        reviewedAt: null,
        reviewStatus: null,
        reviewComment: null,
        rewardClaimed: false
      }
    ],
    totalPointsEarned: 100,
    badgesEarned: []
  },
  {
    id: 'progress-2',
    taskId: 'task-2',
    userId: 'user-1',
    username: '月下独酌',
    avatar: '🌸',
    storyId: null,
    storyTitle: null,
    currentStage: 1,
    overallProgress: 50,
    status: 'in_progress',
    joinedAt: '2024-06-05',
    stages: [
      {
        stageId: 'stage-2-1',
        status: 'completed',
        submittedAt: '2024-06-08',
        reviewedAt: '2024-06-09',
        reviewStatus: 'approved',
        reviewComment: '创意新颖，期待完整作品',
        rewardClaimed: true
      },
      {
        stageId: 'stage-2-2',
        status: 'in_progress',
        submittedAt: null,
        reviewedAt: null,
        reviewStatus: null,
        reviewComment: null,
        rewardClaimed: false
      }
    ],
    totalPointsEarned: 50,
    badgesEarned: []
  },
  {
    id: 'progress-3',
    taskId: 'task-3',
    userId: 'user-2',
    username: '星河漫步者',
    avatar: '⭐',
    storyId: 'story-2',
    storyTitle: '星海彼端的约定',
    currentStage: 2,
    overallProgress: 66,
    status: 'in_progress',
    joinedAt: '2024-06-01',
    stages: [
      {
        stageId: 'stage-3-1',
        status: 'completed',
        submittedAt: '2024-06-03',
        reviewedAt: '2024-06-04',
        reviewStatus: 'approved',
        reviewComment: '设定精彩，为星际世界增色不少',
        rewardClaimed: true
      },
      {
        stageId: 'stage-3-2',
        status: 'completed',
        submittedAt: '2024-06-20',
        reviewedAt: '2024-06-21',
        reviewStatus: 'approved',
        reviewComment: '故事感人，科幻设定严谨',
        rewardClaimed: true
      },
      {
        stageId: 'stage-3-3',
        status: 'in_progress',
        submittedAt: null,
        reviewedAt: null,
        reviewStatus: null,
        reviewComment: null,
        rewardClaimed: false
      }
    ],
    totalPointsEarned: 600,
    badgesEarned: ['星际开拓者']
  },
  {
    id: 'progress-4',
    taskId: 'task-1',
    userId: 'user-3',
    username: '梦境织者',
    avatar: '🌙',
    storyId: 'story-3',
    storyTitle: '妖狐与书生',
    currentStage: 3,
    overallProgress: 100,
    status: 'completed',
    joinedAt: '2024-06-03',
    stages: [
      {
        stageId: 'stage-1-1',
        status: 'completed',
        submittedAt: '2024-06-08',
        reviewedAt: '2024-06-09',
        reviewStatus: 'approved',
        reviewComment: '角色鲜活，狐妖设定尤其出彩',
        rewardClaimed: true
      },
      {
        stageId: 'stage-1-2',
        status: 'completed',
        submittedAt: '2024-06-18',
        reviewedAt: '2024-06-19',
        reviewStatus: 'approved',
        reviewComment: '开篇引人入胜，古风韵味十足',
        rewardClaimed: true
      },
      {
        stageId: 'stage-1-3',
        status: 'completed',
        submittedAt: '2024-06-28',
        reviewedAt: '2024-06-29',
        reviewStatus: 'approved',
        reviewComment: '结局多样，情感真挚，完美诠释主题',
        rewardClaimed: true
      }
    ],
    totalPointsEarned: 500,
    badgesEarned: ['夏日恋曲']
  }
];

const taskSubmissions = [
  {
    id: 'submission-task-1',
    taskId: 'task-1',
    stageId: 'stage-1-1',
    userId: 'user-1',
    username: '月下独酌',
    avatar: '🌸',
    content: '主要角色：\n1. 林小雨 - 22岁，浮城中央图书馆管理员，性格温柔善良，热爱读书。外表普通但眼神灵动。\n2. 辰 - 神秘的银发少年，外表看起来18岁左右，实际是天空守护者。性格清冷疏离，但内心温柔。\n背景设定：在漂浮于云端的浮城，一个普通的夏日午后，两人在图书馆相遇...',
    attachments: [],
    submittedAt: '2024-06-10 14:30',
    status: 'approved',
    reviewedBy: 'admin-1',
    reviewedAt: '2024-06-11 09:00',
    reviewComment: '人设立体，角色关系设计巧妙'
  },
  {
    id: 'submission-task-2',
    taskId: 'task-1',
    stageId: 'stage-1-2',
    userId: 'user-1',
    username: '月下独酌',
    avatar: '🌸',
    content: '已完成故事开篇，共3500字，包含2个选择分支。故事讲述了夏日午后，林小雨在图书馆偶遇神秘银发少年辰的故事...',
    attachments: [{ type: 'story', id: 'story-1' }],
    submittedAt: '2024-06-25 16:20',
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null,
    reviewComment: null
  }
];

const taskRewards = [
  {
    id: 'reward-1',
    userId: 'user-1',
    taskId: 'task-1',
    stageId: 'stage-1-1',
    type: 'points',
    value: 100,
    description: '完成「盛夏恋歌」第一阶段奖励',
    claimedAt: '2024-06-11 10:00'
  },
  {
    id: 'reward-2',
    userId: 'user-3',
    taskId: 'task-1',
    type: 'badge',
    value: '夏日恋曲',
    description: '获得「夏日恋曲」专属徽章',
    claimedAt: '2024-06-29 15:00'
  },
  {
    id: 'reward-3',
    userId: 'user-2',
    taskId: 'task-3',
    type: 'badge',
    value: '星际开拓者',
    description: '获得「星际开拓者」专属徽章',
    claimedAt: '2024-06-21 11:30'
  }
];

const nodeReadingEvents = {
  'story-1': (function generateEvents() {
    const events = [];
    const nodes = [
      { id: 'node-1-1', visitors: 1024, dropOffRate: 23.2, avgTime: 125 },
      { id: 'node-1-2a', visitors: 620, dropOffRate: 18.5, avgTime: 142 },
      { id: 'node-1-2b', visitors: 404, dropOffRate: 25.8, avgTime: 98 },
      { id: 'node-1-3a', visitors: 342, dropOffRate: 0, avgTime: 180 },
      { id: 'node-1-3b', visitors: 278, dropOffRate: 0, avgTime: 165 },
      { id: 'node-1-3c', visitors: 256, dropOffRate: 12.5, avgTime: 110 },
      { id: 'node-1-3d', visitors: 148, dropOffRate: 0, avgTime: 85 },
      { id: 'node-1-4a', visitors: 130, dropOffRate: 0, avgTime: 200 },
      { id: 'node-1-4b', visitors: 126, dropOffRate: 0, avgTime: 190 }
    ];

    nodes.forEach(node => {
      for (let i = 0; i < node.visitors; i++) {
        const dropOff = i < node.visitors * (node.dropOffRate / 100);
        const event = {
          id: `event-${node.id}-${i}`,
          userId: `reader-${i % 200}`,
          nodeId: node.id,
          enteredAt: `2024-05-20 ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`,
          leftAt: null,
          selectedChoiceId: null,
          nextNodeId: null,
          timeSpent: Math.floor(node.avgTime + (Math.random() - 0.5) * 40)
        };

        if (!dropOff) {
          event.leftAt = `2024-05-20 ${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:00`;
          if (node.id === 'node-1-1') {
            const choseA = i < 620;
            event.selectedChoiceId = choseA ? 'choice-1-1-1' : 'choice-1-1-2';
            event.nextNodeId = choseA ? 'node-1-2a' : 'node-1-2b';
          } else if (node.id === 'node-1-2a') {
            const choseA = i < 342;
            event.selectedChoiceId = choseA ? 'choice-1-2a-1' : 'choice-1-2a-2';
            event.nextNodeId = choseA ? 'node-1-3a' : 'node-1-3b';
          } else if (node.id === 'node-1-2b') {
            const choseA = i < 256;
            event.selectedChoiceId = choseA ? 'choice-1-2b-1' : 'choice-1-2b-2';
            event.nextNodeId = choseA ? 'node-1-3c' : 'node-1-3d';
          } else if (node.id === 'node-1-3c') {
            const choseA = i < 130;
            event.selectedChoiceId = choseA ? 'choice-1-3c-1' : 'choice-1-3c-2';
            event.nextNodeId = choseA ? 'node-1-4a' : 'node-1-4b';
          }
        }

        events.push(event);
      }
    });

    return events;
  })()
};

const reports = [
  {
    id: 'report-1',
    targetType: 'story',
    targetId: 'story-3',
    targetTitle: '妖狐与书生',
    targetAuthorId: 'user-3',
    targetAuthorName: '梦境织者',
    reason: 'inappropriate',
    reasonLabel: '不当内容',
    description: '故事中包含不适合未成年读者的内容',
    reporterId: 'user-2',
    reporterName: '星河漫步者',
    reporterAvatar: '⭐',
    status: 'pending',
    reviewRemark: '',
    reviewerId: null,
    reviewerName: null,
    reviewedAt: null,
    createdAt: '2024-05-20 14:30:00'
  },
  {
    id: 'report-2',
    targetType: 'comment',
    targetId: 'comment-mock-1',
    targetTitle: '这条评论包含攻击性语言...',
    targetAuthorId: 'user-2',
    targetAuthorName: '星河漫步者',
    reason: 'harassment',
    reasonLabel: '骚扰/霸凌',
    description: '评论中存在人身攻击',
    reporterId: 'user-1',
    reporterName: '月下独酌',
    reporterAvatar: '🌸',
    status: 'pending',
    reviewRemark: '',
    reviewerId: null,
    reviewerName: null,
    reviewedAt: null,
    createdAt: '2024-05-21 10:15:00'
  },
  {
    id: 'report-3',
    targetType: 'world_entry',
    targetId: 'entry-9',
    targetTitle: '九尾狐',
    targetAuthorId: 'user-3',
    targetAuthorName: '梦境织者',
    reason: 'misinformation',
    reasonLabel: '虚假信息',
    description: '该设定条目中的描述与故事设定前后矛盾',
    reporterId: 'user-2',
    reporterName: '星河漫步者',
    reporterAvatar: '⭐',
    status: 'pending',
    reviewRemark: '',
    reviewerId: null,
    reviewerName: null,
    reviewedAt: null,
    createdAt: '2024-05-22 09:45:00'
  },
  {
    id: 'report-4',
    targetType: 'story',
    targetId: 'story-11',
    targetTitle: '赛博朋克夜曲',
    targetAuthorId: 'user-1',
    targetAuthorName: '月下独酌',
    reason: 'violence',
    reasonLabel: '暴力/血腥',
    description: '部分章节描写过于暴力',
    reporterId: 'user-3',
    reporterName: '梦境织者',
    reporterAvatar: '🌙',
    status: 'dismissed',
    reviewRemark: '经审核，内容在PG-13范围内，未构成违规',
    reviewerId: 'admin-1',
    reviewerName: '管理员',
    reviewedAt: '2024-05-18 16:00:00',
    createdAt: '2024-05-17 11:20:00'
  }
];

module.exports = {
  users,
  stories,
  storyNodes,
  comments,
  worldSettings,
  readingHistory,
  favorites,
  notifications,
  collaborators,
  invitations,
  changeRequests,
  versionHistory,
  storyDrafts,
  storyVersions,
  activities,
  activityRegistrations,
  activitySubmissions,
  activityRankings,
  activityShares,
  activityVotes,
  storyPerformance,
  readerProfiles,
  branchConversions,
  endingAchievements,
  popularBranches,
  readerEndingDistribution,
  settingReferenceTrends,
  auditLogs,
  auditStats,
  themeHalls,
  themeHallCharacters,
  themeHallFactions,
  themeHallTimeline,
  themeHallStories,
  creationTasks,
  userTaskProgress,
  taskSubmissions,
  taskRewards,
  featuredTopics,
  nodeReadingEvents,
  reports
};
