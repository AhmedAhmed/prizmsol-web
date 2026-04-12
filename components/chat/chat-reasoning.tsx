"use client"
import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ThinkingMessages } from "@/app/(dashboard)/(chat)/chat/[id]/messages"

interface ChatReasoningProps {
  reasoning: string
  duration?: string
  isStreaming?: boolean
  className?: string
}

export function ChatReasoning({
  reasoning,
  duration = "a moment",
  isStreaming = false,
  className,
}: ChatReasoningProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isStreaming) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [isStreaming])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger className="group flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer">
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        {isStreaming ? (
          <ThinkingMessages />
        ) : (
          <span>Thought for {duration}</span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="mt-2 pl-5.5 border-l-2 border-neutral-200 dark:border-neutral-700 ml-2">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap leading-relaxed py-2 pl-3">
            {reasoning}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
