import OpenAI from "openai";
import { FunctionType } from "@/types";  // 定义功能类型的枚举

// 初始化 OpenAI 客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 根据功能类型生成提示词（Prompt Engineering）
const generatePrompt = (inputText: string, functionType: FunctionType) => {
  switch (functionType) {
    case "function-expand":
      return `请针对以下需求提供功能拓展建议和技术方案：
        需求：${inputText}
        输出格式：
        1. 核心拓展方向（分点列出5-8个）
        2. 技术实现建议（分点列出3-5个，包含具体技术）
        语言简洁，避免冗余。`;
    
    case "analysis":
      return `请深度分析以下观点，包含原因和建议：
        观点：${inputText}
        输出格式：
        1. 背后逻辑（分点列出4-6个原因）
        2. 可行建议（分点列出4-6个具体行动）
        分析需客观有深度。`;
  }
};

// 解析 AI 响应为结构化数据（前端可直接渲染）
const parseAiResponse = (rawText: string) => {
  const sections: { title: string; items: string[] }[] = [];
  const lines = rawText.split("\n").filter(line => line.trim());

  let currentSection: { title: string; items: string[] } | null = null;

  for (const line of lines) {
    // 匹配章节标题（如 "1. 核心拓展方向"）
    if (line.match(/^\d+\.\s+[\u4e00-\u9fa5\w]+/)) {
      if (currentSection) sections.push(currentSection);
      currentSection = {
        title: line.replace(/^\d+\.\s+/, ""),
        items: [],
      };
    }
    // 匹配列表项（如 "• 实现虚拟列表优化"）
    else if (line.match(/^[•-]\s+/)) {
      if (currentSection) {
        currentSection.items.push(line.replace(/^[•-]\s+/, ""));
      }
    }
  }

  // 添加最后一个章节
  if (currentSection) sections.push(currentSection);

  return { sections };
};

// 调用 AI 生成分析结果
export const getAiAnalysis = async (
  inputText: string,
  functionType: FunctionType
) => {
  try {
    const prompt = generatePrompt(inputText, functionType);
    
    // 调用 OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // 可选 gpt-4 提升质量
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