"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export interface SlashCommand {
    name: string
    description: string
    action: (setInput: (value: string) => void, currentPrompt: string) => void
}

interface SlashCommandMenuProps {
    commands: SlashCommand[]
    open: boolean
    onClose: () => void
    onSelect: (command: SlashCommand) => void
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
    selectedIndex: number
    onSelectedIndexChange: (index: number) => void
}

export function SlashCommandMenu({
    commands,
    open,
    onClose,
    onSelect,
    textareaRef,
    selectedIndex,
    onSelectedIndexChange,
}: SlashCommandMenuProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [menuPosition, setMenuPosition] = useState({ top: 0, width: 0, left: 0 })

    // Calculate position based on textarea dimensions
    useEffect(() => {
        const updatePosition = () => {
            if (textareaRef.current) {
                const rect = textareaRef.current.getBoundingClientRect()
                setMenuPosition({
                    top: rect.top - 16, // Position above textarea
                    width: rect.width,  // Match textarea width
                    left: rect.left,    // Align with textarea left edge
                })
            }
        }

        if (open) {
            updatePosition()
            window.addEventListener("resize", updatePosition)
            return () => window.removeEventListener("resize", updatePosition)
        }
    }, [open, textareaRef])

    // Keyboard navigation (Enter to select is handled by parent)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return
            if (e.key === "ArrowDown") {
                e.preventDefault()
                onSelectedIndexChange((selectedIndex + 1) % commands.length)
            } else if (e.key === "ArrowUp") {
                e.preventDefault()
                onSelectedIndexChange((selectedIndex - 1 + commands.length) % commands.length)
            } else if (e.key === "Escape") {
                e.preventDefault()
                onClose()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [open, commands.length, selectedIndex, onClose, onSelectedIndexChange])

    // scroll selected item into view
    useEffect(() => {
        if (containerRef.current) {
            const el = containerRef.current.children[selectedIndex] as HTMLElement
            el?.scrollIntoView({ block: "nearest" })
        }
    }, [selectedIndex])

    if (!open || commands.length === 0) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
                position: "fixed",
                bottom: `calc(100vh - ${menuPosition.top}px)`,
                left: menuPosition.left,
                width: menuPosition.width,
                zIndex: 50,
                pointerEvents: "auto",
            }}
            className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden"
        >
            <div ref={containerRef} className="max-h-64 overflow-y-auto">
                {commands.map((cmd, i) => (
                    <div
                        key={cmd.name}
                        onMouseEnter={() => onSelectedIndexChange(i)}
                        onClick={() => onSelect(cmd)}
                        className={`flex flex-col gap-0.5 px-4 py-2.5 cursor-pointer transition-colors ${i === selectedIndex
                            ? "bg-neutral-200 dark:bg-neutral-800"
                            : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            }`}
                    >
                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                            /{cmd.name}
                        </span>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {cmd.description}
                        </span>
                    </div>
                ))}
            </div>
        </motion.div>
    )
}
