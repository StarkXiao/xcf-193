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
    startNodeId: 'node-1-1'
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
    startNodeId: 'node-2-1'
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
    startNodeId: 'node-3-1'
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
      isEnding: false
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
      isEnding: false
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
      endingType: 'good'
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
      isEnding: false
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
      isEnding: false
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
      isEnding: false
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
      isEnding: false
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
      isEnding: false
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
      endingType: 'good'
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
  ]
};

const comments = {
  'story-1': [
    {
      id: 'comment-1',
      storyId: 'story-1',
      nodeId: 'node-1-1',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      content: '第一章就很有画面感！银发少年好神秘~',
      likes: 23,
      createdAt: '2024-04-05 10:30'
    },
    {
      id: 'comment-2',
      storyId: 'story-1',
      nodeId: 'node-1-1',
      userId: 'user-3',
      username: '梦境织者',
      avatar: '🌙',
      content: '浮城的设定好棒，好想住在云上面！',
      likes: 15,
      createdAt: '2024-04-06 14:20'
    },
    {
      id: 'comment-3',
      storyId: 'story-1',
      nodeId: 'node-1-3a',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      content: '天空的守护者！这个结局好甜~',
      likes: 45,
      createdAt: '2024-04-10 09:15'
    }
  ],
  'story-2': [
    {
      id: 'comment-4',
      storyId: 'story-2',
      nodeId: 'node-2-1',
      userId: 'user-1',
      username: '月下独酌',
      avatar: '🌸',
      content: '科幻百合！太对我胃口了！',
      likes: 34,
      createdAt: '2024-03-20 16:45'
    },
    {
      id: 'comment-5',
      storyId: 'story-2',
      nodeId: 'node-2-4a',
      userId: 'user-3',
      username: '梦境织者',
      avatar: '🌙',
      content: '星河旅人这个结局太浪漫了！一起探索宇宙什么的...',
      likes: 56,
      createdAt: '2024-04-01 11:30'
    }
  ],
  'story-3': [
    {
      id: 'comment-6',
      storyId: 'story-3',
      nodeId: 'node-3-1',
      userId: 'user-1',
      username: '月下独酌',
      avatar: '🌸',
      content: '九尾狐！古风恋爱我的最爱！',
      likes: 67,
      createdAt: '2024-02-15 08:00'
    },
    {
      id: 'comment-7',
      storyId: 'story-3',
      nodeId: 'node-3-4a',
      userId: 'user-2',
      username: '星河漫步者',
      avatar: '⭐',
      content: '京城烟火这个结局太圆满了！为了爱人放弃功名什么的...',
      likes: 89,
      createdAt: '2024-03-01 20:10'
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
    entries: [
      {
        id: 'entry-1',
        title: '浮城',
        category: '地理',
        content: '浮城是一座漂浮在万米高空之上的城市，依靠神秘的天空之力悬浮。城市分为多层，最上层是贵族区，中间是商业区，最下层是平民区。浮城的能源来自天空晶石，这是一种稀有的矿石，蕴含着强大的能量。'
      },
      {
        id: 'entry-2',
        title: '天空之境',
        category: '传说',
        content: '天空之境是传说中的圣地，据说在云层之上的更高处。那里是天空守护者的居所，有着无穷无尽的天空之力。没有人真正到达过天空之境，只有传说流传下来。'
      },
      {
        id: 'entry-3',
        title: '天空守护者',
        category: '种族',
        content: '天空守护者是一群神秘的存在，他们守护着天空之境和天空之力。他们有着银色的头发和紫色的眼眸，能够操控风和云。天空守护者通常不与凡人接触，但偶尔也会有守护者来到浮城。'
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
    entries: [
      {
        id: 'entry-4',
        title: '星际联邦',
        category: '政治',
        content: '星际联邦是人类星际殖民地的联合政府，成立于公元2500年。联邦的首都是地球，但实际权力中心在火星城。星际联邦负责管理人类的所有殖民地，维护星际秩序。'
      },
      {
        id: 'entry-5',
        title: '超光速航行',
        category: '科技',
        content: '超光速航行技术是星际时代的基石，于公元2300年被发明。通过曲速引擎，飞船可以进入亚空间进行超光速旅行。然而，超光速航行仍然有风险，每年都有飞船在航行中失踪。'
      },
      {
        id: 'entry-6',
        title: '北辰号空间站',
        category: '地点',
        content: '北辰号是一座建造于公元2800年的科研空间站，位于猎户座小行星带。两百年前，这座空间站突然与联邦失去联系，成为了一座废弃空间站。关于它的废弃原因，有很多传闻。'
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
    entries: [
      {
        id: 'entry-7',
        title: '大靖王朝',
        category: '政治',
        content: '大靖王朝是一个传承了三百年的王朝，国力强盛，文化繁荣。王朝的都城是长安，那里是天下最繁华的地方。王朝崇尚儒学，但也兼容并包，各种思想都能找到立足之地。'
      },
      {
        id: 'entry-8',
        title: '妖族',
        category: '种族',
        content: '妖族是一群拥有智慧和法力的精怪，它们通常隐居在深山老林之中，不与人类接触。妖族修炼成人形需要很长时间，通常需要几百年。妖族中有善有恶，不能一概而论。'
      },
      {
        id: 'entry-9',
        title: '九尾狐',
        category: '种族',
        content: '九尾狐是妖族中比较高贵的种族，它们天生就有强大的法力，化形也比其他妖族容易。九尾狐通常有着白色的毛发和金色的眼眸，九条尾巴是它们力量的象征。九尾狐大多住在深山古寺之中。'
      }
    ],
    createdAt: '2024-01-05'
  }
];

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

module.exports = {
  users,
  stories,
  storyNodes,
  comments,
  worldSettings,
  favorites,
  notifications,
  collaborators,
  invitations,
  changeRequests,
  versionHistory
};
