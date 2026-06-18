"use client";

import React from "react";
import { MessageSquare, Plus, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ChatSessionMeta {
  sessionId: string;
  updatedAt: string | Date;
  messageCount: number;
  lastMessageText: string;
  lastMessageRole: string;
}

interface ChatHistorySidebarProps {
  sessions: ChatSessionMeta[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
}

export default function ChatHistorySidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
}: ChatHistorySidebarProps) {
  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full md:w-64 shrink-0 bg-card border-r border-border flex flex-col h-full overflow-hidden">
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border/80 flex items-center justify-between gap-2 bg-muted/20">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Conversations
        </h3>
        <Button
          variant="accent"
          size="sm"
          onClick={onNewChat}
          className="flex items-center gap-1 text-[11px] h-7 px-2.5 cursor-pointer font-bold shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Chat</span>
        </Button>
      </div>

      {/* History Items Scroll list */}
      <div className="flex-grow overflow-y-auto p-2 space-y-1.5">
        {sessions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No recent conversations. Start chatting now!</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.sessionId === activeSessionId;
            return (
              <div
                key={session.sessionId}
                className={`group relative flex items-start justify-between p-3 rounded-lg border transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "bg-amber-500/10 border-amber-500/30 shadow-sm"
                    : "bg-transparent border-transparent hover:bg-muted/50"
                }`}
                onClick={() => onSelectSession(session.sessionId)}
              >
                <div className="flex flex-col gap-1 w-[82%] text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                    <span className="truncate">Chat session</span>
                  </div>
                  
                  {/* Truncated message snippet */}
                  <p className="text-[11px] text-muted-foreground truncate leading-normal">
                    {session.lastMessageText || "No messages yet"}
                  </p>

                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground/80 mt-1">
                    <Calendar className="h-2.5 w-2.5 shrink-0" />
                    <span>{formatDate(session.updatedAt)}</span>
                  </div>
                </div>

                {/* Delete button (displays on item hover or if active) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.sessionId);
                  }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted-foreground/10 text-muted-foreground hover:text-destructive transition-opacity duration-150 cursor-pointer ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  title="Delete chat session"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
