// app/api/analysis/route.ts
import { NextResponse } from "next/server";
import { getAiAnalysis } from "@/lib/ai";

// 处理 POST 请求（接收用户输入）
export async function POST(request: Request) {
  try {
    const { inputText, functionType } = await request.json(); // 移除 userId 相关接收

    // 1. 验证输入
    if (!inputText || !functionType) {
      return NextResponse.json(
        { success: false, error: "缺少输入内容或功能类型" },
        { status: 400 }
      );
    }

    if (!["function-expand", "analysis"].includes(functionType)) {
      return NextResponse.json(
        { success: false, error: "功能类型无效" },
        { status: 400 }
      );
    }

    // 2. 调用 AI 生成分析结果（仅保留 AI 调用逻辑）
    const aiResult = await getAiAnalysis(inputText, functionType as any);

    // 3. 直接返回 AI 结果（不存储到数据库）
    return NextResponse.json({
      success: true,
      data: {
        inputText,
        result: aiResult,
        createdAt: new Date().toISOString(), // 用当前时间作为响应时间
      },
    });
  } catch (error) {
    console.error("分析接口错误：", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}