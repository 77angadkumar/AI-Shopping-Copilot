import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ChatSession from "@/lib/models/ChatSession";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId") || undefined;
    const userId = searchParams.get("userId") || "anonymous";

    // Scenario A: Get details of a single session
    if (sessionId) {
      const session = await ChatSession.findOne({ sessionId, userId })
        .populate("messages.productsRetrieved");
        
      if (!session) {
        return NextResponse.json({
          success: false,
          error: "Chat session not found",
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        session,
      }, { status: 200 });
    }

    // Scenario B: Get list of all sessions for a user
    const sessions = await ChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .select("sessionId messages createdAt updatedAt");

    const sessionList = sessions.map(s => {
      const lastMsg = s.messages[s.messages.length - 1];
      return {
        sessionId: s.sessionId,
        updatedAt: s.updatedAt,
        createdAt: s.createdAt,
        messageCount: s.messages.length,
        lastMessageText: lastMsg ? lastMsg.content : "Empty Chat",
        lastMessageRole: lastMsg ? lastMsg.role : "system",
      };
    });

    return NextResponse.json({
      success: true,
      sessions: sessionList,
    }, { status: 200 });

  } catch (error: any) {
    console.error("History API error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error",
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId") || undefined;
    const userId = searchParams.get("userId") || "anonymous";

    if (sessionId) {
      await ChatSession.deleteOne({ sessionId, userId });
      return NextResponse.json({
        success: true,
        message: `Session ${sessionId} deleted successfully`,
      }, { status: 200 });
    }

    // Delete all sessions for the user
    await ChatSession.deleteMany({ userId });
    return NextResponse.json({
      success: true,
      message: "All chat sessions deleted successfully",
    }, { status: 200 });

  } catch (error: any) {
    console.error("History API DELETE error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Internal Server Error",
    }, { status: 500 });
  }
}
