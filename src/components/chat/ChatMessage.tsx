import React from "react";
import Link from "next/link";
import { MessageSquare, User, Sparkles } from "lucide-react";

export interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  // Parse [Product Title](file:///product/PRODUCT_ID) into Link tags
  const parseMessageContent = (text: string) => {
    const parts = [];
    const regex = /\[([^\]]+)\]\(file:\/\/\/product\/([a-f\d]{24}|[a-zA-Z\d\-_]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const [fullMatch, title, id] = match;
      const index = match.index;

      if (index > lastIndex) {
        parts.push({ type: "text", content: text.substring(lastIndex, index) });
      }

      parts.push({ type: "link", title, id });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ type: "text", content: text.substring(lastIndex) });
    }

    if (parts.length === 0) {
      parts.push({ type: "text", content: text });
    }

    return parts;
  };

  // Compile formatting elements (lists, bold elements, headers)
  const renderFormattedText = (txt: string) => {
    const lines = txt.split("\n");
    let inList = false;
    const renderedElements: React.ReactNode[] = [];

    lines.forEach((line, lIdx) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ");
      const isHeader = trimmed.startsWith("### ");
      
      // Handle list tags opening and closing
      if (isBullet && !inList) {
        inList = true;
      } else if (!isBullet && inList) {
        inList = false;
      }

      // Extract raw text
      let cleanLine = trimmed;
      if (isBullet) cleanLine = trimmed.substring(2);
      if (isHeader) cleanLine = trimmed.substring(4);

      // Handle **bold** strings
      const boldRegex = /\*\*([^*]+)\*\?/g; // standard match
      const lineParts: React.ReactNode[] = [];
      let lastIdx = 0;
      
      // We will parse standard **bold** matches manually
      const splitBold = cleanLine.split(/\*\*([^*]+)\*\*/g);
      splitBold.forEach((chunk, cIdx) => {
        if (cIdx % 2 === 1) {
          lineParts.push(
            <strong key={cIdx} className="font-bold text-amber-500 dark:text-amber-400">
              {chunk}
            </strong>
          );
        } else {
          // Parse internal link tags for chunks
          const parsedChunks = parseMessageContent(chunk);
          parsedChunks.forEach((part, pIdx) => {
            if (part.type === "link") {
              lineParts.push(
                <Link
                  key={`${cIdx}-${pIdx}`}
                  href={`/product/${part.id}`}
                  className="font-semibold text-amber-500 dark:text-amber-400 underline hover:text-amber-600 transition-colors"
                >
                  {part.title}
                </Link>
              );
            } else {
              lineParts.push(<React.Fragment key={`${cIdx}-${pIdx}`}>{part.content}</React.Fragment>);
            }
          });
        }
      });

      const content = lineParts.length > 0 ? lineParts : cleanLine;

      if (isHeader) {
        renderedElements.push(
          <h4 key={lIdx} className="text-base font-bold text-foreground mt-4 mb-2 first:mt-1">
            {content}
          </h4>
        );
      } else if (isBullet) {
        renderedElements.push(
          <li key={lIdx} className="ml-5 list-disc text-sm text-foreground/90 leading-relaxed mb-1.5">
            {content}
          </li>
        );
      } else if (trimmed === "") {
        renderedElements.push(<div key={lIdx} className="h-2" />);
      } else {
        renderedElements.push(
          <p key={lIdx} className="text-sm text-foreground/90 leading-relaxed mb-2.5">
            {content}
          </p>
        );
      }
    });

    return renderedElements;
  };

  return (
    <div
      className={`flex w-full items-start gap-3 my-4 chat-bubble-animation ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg shadow-sm border ${
          isUser
            ? "bg-accent text-accent-foreground border-amber-500"
            : "bg-secondary text-secondary-foreground border-border/80"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4 text-amber-400" />
        )}
      </div>

      {/* Bubble Panel */}
      <div
        className={`flex flex-col max-w-[82%] px-4 py-3 rounded-2xl shadow-sm border ${
          isUser
            ? "bg-amber-500/10 text-foreground border-amber-500/20 rounded-tr-none"
            : "bg-card text-foreground border-border rounded-tl-none"
        }`}
      >
        <div className="text-xs font-semibold text-muted-foreground/80 mb-1">
          {isUser ? "You" : "Rufus AI Advisor"}
        </div>
        <div className="prose dark:prose-invert max-w-none">
          {renderFormattedText(content)}
        </div>
      </div>
    </div>
  );
}
