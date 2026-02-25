import { useEffect, useRef } from "react";
import { Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingDots from "./LoadingDots";
// 1. Import the Markdown Library & GFM Plugin
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ChatMessages = ({ messages, isTyping }) => {
  // 1. Create a reference to the bottom of the chat list
  const bottomRef = useRef(null);

  // 2. Automatically scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl overflow-y-auto px-4 py-10 custom-scrollbar">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={cn(
            "flex w-full animate-in fade-in slide-in-from-bottom-4 duration-700",
            msg.role === "user" ? "justify-end" : "justify-start"
          )}
        >
          {msg.role === "user" ? (
            /* USER MESSAGE: Glassmorphism Bubble + Icon */
            <div className="flex gap-4 max-w-[85%] justify-end group">
              <div className="flex flex-col items-end gap-2">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-5 py-3 rounded-2xl rounded-tr-none shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:border-cyan-500/30 transition-colors duration-500">
                  <p className="text-white text-sm md:text-base font-light leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
              
              {/* User Icon Side - Cyan Theme */}
              <div className="mt-1 shrink-0 bg-cyan-500/20 p-2.5 h-fit rounded-full border border-cyan-500/30 self-start shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <User size={18} className="text-cyan-400" />
              </div>
            </div>
          ) : (
            /* AI MESSAGE: Clean, Direct Text + Sparkle Icon */
            <div className="flex gap-4 max-w-[90%] justify-start">
              <div className="mt-1 shrink-0 bg-cyan-500/20 p-2.5 h-fit rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Sparkles size={18} className="text-cyan-400" />
              </div>
              <div className="flex flex-col gap-2 w-full">
                
                {/* 🔥 THE INVISIBLE FIRST CHUNK FIX 🔥 */}
                {(!msg.content || msg.content.trim() === "") ? (
                  <div className="py-2 flex items-center h-full mt-2">
                    <LoadingDots />
                  </div>
                ) : (
                  <div className="py-2">
                    {/* Markdown Renderer with smaller text and softer bolding */}
                    <div className="text-white/90 text-sm md:text-base font-light leading-relaxed tracking-wide">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // Style the paragraphs
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                            // Style the Bold text (Make it Cyan but softer font-medium)
                            strong: ({node, ...props}) => <span className="font-medium text-cyan-300" {...props} />,
                            // Style the Lists (Bullets)
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1 pl-2 marker:text-cyan-500" {...props} />,
                            // Style Numbered Lists
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1 pl-2 marker:text-cyan-500" {...props} />,
                            // Style List Items
                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                            // Style Headings
                            h1: ({node, ...props}) => <h1 className="text-xl font-light text-cyan-200 mb-4 mt-6" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-lg font-light text-cyan-200 mb-3 mt-5" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-base font-medium text-cyan-100 mb-2 mt-4" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
                
                {/* Visual subtle divider to separate answers */}
                <div className="w-16 h-[1px] bg-gradient-to-r from-cyan-500/50 to-transparent mt-2" />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* LOADING STATE - Shown when AI is thinking before the message object is created */}
      {isTyping && (
        <div className="flex gap-4 w-full justify-start animate-in fade-in duration-300">
          <div className="mt-1 shrink-0 bg-cyan-500/20 p-2.5 h-fit rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Sparkles size={18} className="text-cyan-400" />
          </div>
          <div className="flex items-center">
            <LoadingDots />
          </div>
        </div>
      )}

      {/* 3. The Invisible Anchor - Forces scroll to here */}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;