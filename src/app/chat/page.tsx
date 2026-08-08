import { Suspense } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Ask Shop product - AI Shopping Assistant",
  description: "Conversational AI Shopping Assistant powered by semantic RAG vectors.",
};

export default function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-grow flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full border-4 border-accent border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-muted-foreground">Initializing Shop product Chat Environment...</p>
            </div>
          </div>
        }
      >
        <ChatWindow />
      </Suspense>
    </div>
  );
}
