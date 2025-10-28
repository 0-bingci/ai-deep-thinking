import { NextResponse } from "next/server";
import { getAiAnalysis } from "@/lib/ai";
import db from "@/lib/db";
import { FunctionType } from "@/types";

// 处理 POST 请求（接收用户输入）
export async function POST(request: Request) {
  try {
    const { inputText, functionType, userId } = await request.json();

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

    // 2. 调用 AI 生成分析结果
    const aiResult = await getAiAnalysis(inputText, functionType as FunctionType);

    // 3. 存储结果到数据库
    const record = await db.analysisRecord.create({
      data: {
        inputText,
        functionType,
        result: aiResult,
        userId: userId || "anonymous",  // 匿名用户用固定标识
      },
    });

    // 4. 返回结果给前端
    return NextResponse.json({
      success: true,
      data: {
        recordId: record.id,
        inputText: record.inputText,
        result: record.result,
        createdAt: record.createdAt,
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