// lib/ai.ts
import OpenAI from "openai";

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

// 根据功能类型生成提示词（Prompt Engineering）
const generatePrompt = (inputText: string, functionType: any) => {
  switch (functionType) {
    case "function-expand":
      return `用户需求：${inputText}
    请基于该需求，从「核心功能+体验升级」「进阶技术优化」两个核心维度，生成全面的落地方案，要求如下：

    1. 核心功能+体验升级维度（覆盖基础需求+超出预期体验）：
    - 先列出小红书首页必备核心功能（如瀑布流布局、笔记卡片交互、顶部导航、搜索功能、点赞/收藏/评论基础交互），每个功能说明极简实现思路（具体到UI结构/基础交互逻辑）
    - 再补充4-5个体验升级延展功能（如智能推荐、场景化交互反馈、离线缓存、夜间模式、笔记草稿自动保存），每个功能说明「用户价值」+「简易实现路径」

    2. 进阶技术优化维度（解决性能瓶颈，用户未考虑的技术痛点）：
    - 针对大数据量、弱网等场景，提供3-4个关键性能优化方案（必须包含虚拟列表、图片懒加载技术）
    - 每个优化方案需明确「适用场景」「技术选型」「核心作用」（例：虚拟列表选用react-window，解决千条笔记渲染卡顿问题，仅渲染可视区域内容）

    3. 输出格式要求：
    - 分两大维度清晰呈现，每个维度下用「数字+中文顿号」分点，逻辑连贯
    - 技术术语准确，优先推荐前端主流、易落地的方案（如React/Vue生态常用库、原生API）
    - 语言简洁精炼，每个要点控制在2-3句话，聚焦「做什么」「怎么落地」「解决什么问题」`;

    case "analysis":
      return `用户论点：${inputText}

请围绕该论点，从「核心价值拆解」「行动落地路径」两个核心维度，生成结构化分析方案，要求如下：

1. 核心价值拆解（解答“为什么要尽早实习”“实习的核心目的”）：
- 从个人成长、职业发展、竞争力提升、认知升级4个角度，分点说明尽早实习的核心价值
- 每个价值点需结合大学生实际场景（如校园与职场衔接、简历背书、能力验证等），用具体场景化描述替代笼统表述
- 需点出“尽早”的独特优势（如试错成本低、时间弹性大等），区别于毕业前集中实习

2. 行动落地路径（解答“如何朝着实习目标奋斗”）：
- 按时间线（大一/大二/大三）拆解阶段性目标，每个阶段明确“核心任务”“具体行动”“可落地方法”
- 包含关键准备动作：简历优化、技能提升、渠道选择、面试准备、实习过程中的成长技巧
- 每个行动点需具体可操作（例：技能提升需明确“学习XX工具”“完成XX项目”，而非“提升专业能力”）

3. 输出格式要求：
- 分两大维度清晰呈现，每个维度下用「数字+中文顿号」分点，逻辑从“为什么”到“怎么做”层层递进
- 语言贴近大学生认知，避免职场专业术语堆砌，每个要点控制在2-3句话，聚焦“实际价值”“具体动作”
- 增加1-2个避坑提醒（如避免盲目跟风实习、如何平衡实习与学业），提升分析的实用性`;
  }
};

const parseAiResponse = (rawText: string) => {
  const sections: { title: string; items: string[] }[] = [];
  // 过滤开头的“用户需求/论点”行
  const lines = rawText.split("\n").filter(line => line.trim() && !line.match(/^用户(需求|论点)：/));

  let currentSection: { title: string; items: string[] } | null = null;

  for (const line of lines) {
    // 匹配章节标题（兼容“一、”“二、”和“1. 2.”两种格式）
    const titleMatch = line.match(/^(一|二|三|四|五)、\s+[\u4e00-\u9fa5\w\s]+/) || 
                      line.match(/^\d+\.\s+[\u4e00-\u9fa5\w\s]+/);
    if (titleMatch) {
      if (currentSection) sections.push(currentSection);
      // 提取标题文本（去掉序号前缀）
      const title = line.replace(/^(一|二|三|四|五)、\s+/, '').replace(/^\d+\.\s+/, '');
      currentSection = { title, items: [] };
    } 
    // 匹配列表项（兼容“1、”“2、”“•”“-”四种前缀）
    else if (line.match(/^(?:\d+、|\•|-|\d+\.)\s+/)) {
      if (currentSection) {
        // 提取列表项文本（去掉前缀符号）
        const item = line.replace(/^(?:\d+、|\•|-|\d+\.)\s+/, '').trim();
        if (item) currentSection.items.push(item);
      }
    }
  }

  // 兜底：如果解析失败，直接把原始文本作为一个章节
  if (!currentSection || currentSection.items.length === 0) {
    sections.push({ title: "分析结果", items: [rawText] });
  } else {
    sections.push(currentSection);
  }

  return { sections };
};

// 调用 AI 生成分析结果
export const getAiAnalysis = async (
  inputText: string,
  functionType: any
) => {
  try {
    const prompt = generatePrompt(inputText, functionType);

    // 调用 OpenAI API
    const response = await openai.chat.completions.create({
      model: "qwen-plus",  // 可选 gpt-4 提升质量
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,  // 控制创造性（0-1）
      max_tokens: 1000,  // 限制响应长度
    });

    const rawResult = response.choices[0].message.content;
    if (!rawResult) throw new Error("AI 未返回结果");

    // 结构化结果并返回
    return parseAiResponse(rawResult);
  } catch (error) {
    console.error("AI 调用失败：", error);
    throw new Error("分析失败，请重试");
  }
};