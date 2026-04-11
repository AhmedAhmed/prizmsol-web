"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { getPlanLimits } from "@/lib/constants"
import { Collection } from "@/lib/db/schema"
import { isEmpty } from "lodash"
import { MicIcon, PaperclipIcon, FileTextIcon, XIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { aiModels, pills } from "./constants"
import EmptyDialog from "./empty-dialog"
import LimitDialog from "./limit-dialog"
import PromptCollection from "./prompt-collection"
import PromptSubmit from "./prompt-submit"
import PromptTextarea from "./prompt-textarea"

// ─── Waveform icon (animated bars shown while recording) ───────────────────
function WaveformIcon() {
    const bars = [
        { delay: "0s",    dur: "0.70s", minH: 6,  maxH: 20 },
        { delay: "0.1s",  dur: "0.80s", minH: 8,  maxH: 28 },
        { delay: "0.05s", dur: "0.60s", minH: 4,  maxH: 16 },
        { delay: "0.15s", dur: "0.75s", minH: 7,  maxH: 26 },
        { delay: "0s",    dur: "0.65s", minH: 5,  maxH: 20 },
    ]
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            {bars.map(({ dur, delay, minH, maxH }, i) => {
                const x = i * 3
                const midY = 8
                return (
                    <rect key={i} x={x} y={midY - maxH / 2} width="2" height={maxH} rx="1">
                        <animate attributeName="height" values={`${maxH};${minH};${maxH}`} dur={dur} begin={delay} repeatCount="indefinite" />
                        <animate attributeName="y" values={`${midY - maxH / 2};${midY - minH / 2};${midY - maxH / 2}`} dur={dur} begin={delay} repeatCount="indefinite" />
                    </rect>
                )
            })}
        </svg>
    )
}

// ─── Pasted text chip ──────────────────────────────────────────────────────
interface PastedChip {
    id: string
    preview: string
    fullText: string
}

// Only intercept pastes longer than this many characters
const PASTE_THRESHOLD = 200

function PastedTextChip({ chip, onRemove }: { chip: PastedChip; onRemove: (id: string) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex items-center gap-2 max-w-[260px] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2.5 py-1.5"
        >
            {/* doc icon */}
            <div className="flex-shrink-0 w-7 h-7 rounded-md bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                <FileTextIcon className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
            </div>
            {/* labels */}
            <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-700 dark:text-neutral-200 truncate leading-tight">
                    Pasted text
                </p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate leading-tight">
                    {chip.preview}
                </p>
            </div>
            {/* remove button */}
            <button
                type="button"
                onClick={() => onRemove(chip.id)}
                className="flex-shrink-0 w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 flex items-center justify-center transition-colors"
                aria-label="Remove pasted text"
            >
                <XIcon className="w-2.5 h-2.5 text-neutral-500 dark:text-neutral-400" />
            </button>
        </motion.div>
    )
}

// ─── Main component ────────────────────────────────────────────────────────
export default function PromptInput({
    placeholder,
    showPills,
    className,
    action,
    onSubmit,
    input,
    handleInputChange,
    onModelChange,
    clearOnSubmit = true,
    projectId,
    messagesCount = 0,
    defaultValue,
    collections
}: {
    placeholder?: string
    showPills?: boolean
    className?: string
    action?: (formData: FormData) => Promise<void>
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
    clearOnSubmit?: boolean
    projectId?: string
    input?: string
    handleInputChange?: (input: string) => void
    onModelChange?: (model: string) => void
    messagesCount?: number
    defaultValue?: string
    collections?: Array<Collection>
}) {
    const showModelSwitcher = false

    const formRef = useRef<HTMLFormElement>(null)
    const [prompt, setPrompt] = useState(defaultValue ?? "")
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
    const [emptyDialog, setEmptyDialog] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [pastedChips, setPastedChips] = useState<PastedChip[]>([])
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ── height auto-grow ────────────────────────────────────────────────────
    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = `${textarea.scrollHeight}px`
        }
    }, [])

    useEffect(() => { adjustHeight() }, [adjustHeight, prompt])

    // ── keyboard submit ────────────────────────────────────────────────────
    const enterToSend = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (prompt.trim() === "" && pastedChips.length === 0) {
                setEmptyDialog(true)
                return
            }
            formRef.current?.requestSubmit()
            if (clearOnSubmit) {
                setPrompt("")
                handleInputChange?.("")
            }
        }
    }

    // ── paste handler ──────────────────────────────────────────────────────
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const pasted = e.clipboardData.getData("text/plain")
        if (!pasted || pasted.length < PASTE_THRESHOLD) return

        // Prevent raw text from landing in the textarea
        e.preventDefault()

        const trimmed = pasted.trim()
        const previewRaw = trimmed.slice(0, 60).replace(/\s+/g, " ").trim()
        const preview = previewRaw.length < trimmed.length ? `${previewRaw}…` : previewRaw

        setPastedChips(prev => [
            ...prev,
            { id: crypto.randomUUID(), preview, fullText: pasted },
        ])
    }

    const removePastedChip = (id: string) =>
        setPastedChips(prev => prev.filter(c => c.id !== id))

    // ── file upload ────────────────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (f) setFile(f)
    }

    const triggerFileUpload = () => fileInputRef.current?.click()


    // ── plan check ─────────────────────────────────────────────────────────
    const canSend = async () => {
        const count = await getPlanLimits()
        return messagesCount >= count
    }

    // ── merge pasted chips into the prompt payload ─────────────────────────
    const buildMergedPrompt = () => {
        const chipTexts = pastedChips.map(c => c.fullText).join("\n\n")
        return chipTexts ? `${chipTexts}\n\n${prompt}`.trim() : prompt
    }

    // ── form submission ────────────────────────────────────────────────────
    const handleAction = async (formData: FormData) => {
        if (await canSend()) { setUpgradeDialogOpen(true); return }
        formData.set("prompt", buildMergedPrompt())
        if (action) await action(formData)
        if (clearOnSubmit) setPastedChips([])
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        if (await canSend()) { setUpgradeDialogOpen(true); return }
        if (onSubmit) onSubmit(e)
        if (clearOnSubmit) setPastedChips([])
    }

    // ── text change ────────────────────────────────────────────────────────
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        handleInputChange?.(e.target.value)
        setPrompt(e.target.value)
    }

    const handleCollectionSelect = () => console.log("Selected collection")

    // ── suggestion pills ───────────────────────────────────────────────────
    const renderPills = () =>
        pills.map((pill, index: number) => (
            <motion.div
                key={index}
                animate={{ opacity: 1, y: 0 }}
                className="min-w-[200px] shrink-0 sm:min-w-0 sm:shrink"
                exit={{ opacity: 0, y: 16 }}
                initial={{ opacity: 0, y: 16 }}
                transition={{ delay: 0.06 * index, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
                <Button
                    variant="outline"
                    size="sm"
                    className="relative cursor-pointer transition-all duration-200 group/pill overflow-hidden rounded-xl px-5 w-full hover:-translate-y-0.5"
                    onClick={() => {
                        setPrompt(pill.prompt)
                        textareaRef.current?.focus()
                        textareaRef.current!.value = pill.prompt
                    }}
                >
                    <div className="absolute left-0 top-0 z-10 h-[72px] w-full -translate-x-full bg-linear-to-r from-transparent via-white/50 dark:via-neutral-800 to-transparent group-hover/pill:animate-[shimmer_1s]" />
                    <pill.Icon className="h-4 w-4" />
                    <span>{pill.name}</span>
                </Button>
            </motion.div>
        ))

    // ── render ─────────────────────────────────────────────────────────────
    return (
        <div className="w-full max-w-3xl mx-auto">
            <form ref={formRef} action={handleAction} onSubmit={handleSubmit} className="relative">
                <input type="file" ref={fileInputRef} accept="*/*" className="hidden" onChange={handleFileChange} />
                {projectId && <input type="hidden" name="projectId" value={projectId} />}

                <div
                    className="relative rounded-2xl cursor-text transition-all border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 hover:border-neutral-400 hover:focus-within:border-neutral-500 focus-within:border-neutral-500 dark:hover:border-neutral-700 dark:hover:focus-within:border-neutral-500 dark:focus-within:border-neutral-500 border-input bg-background focus-within:ring-4 ring-neutral-500/40"
                    onClick={() => textareaRef.current?.focus()}
                >
                    {/* ── Pasted text chips ───────────────────────────── */}
                    <AnimatePresence>
                        {pastedChips.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex flex-wrap gap-2 px-3 pt-3"
                            >
                                {pastedChips.map(chip => (
                                    <PastedTextChip key={chip.id} chip={chip} onRemove={removePastedChip} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Textarea ─────────────────────────────────────── */}
                    <PromptTextarea
                        textareaRef={textareaRef}
                        className={className}
                        placeholder={placeholder || "Assign a task or ask anything..."}
                        name="prompt"
                        value={input}
                        onChange={handleTextChange}
                        onPaste={handlePaste}
                        enterToSend={enterToSend}
                        rows={1}
                        defaultValue={defaultValue}
                    />

                    {/* ── Toolbar ──────────────────────────────────────── */}
                    <div className="flex items-center justify-between p-3 pt-0">
                        <div className="flex items-center gap-2">
                            {/* Attach file */}
                            <Button
                                type="button" size="icon" variant="ghost"
                                className="cursor-pointer text-neutral-500 hover:bg-neutral-300 dark:hover:bg-neutral-700 h-8 w-8 rounded-xl"
                                onClick={triggerFileUpload}
                            >
                                <PaperclipIcon className="h-4 w-4" />
                                <span className="sr-only">Attach file</span>
                            </Button>

                            {/* Model switcher (hidden by default) */}
                            {showModelSwitcher && (
                                <Select onValueChange={onModelChange} name="model" defaultValue="gpt-4.1-mini">
                                    <SelectTrigger className="bg-transparent dark:bg-transparent border-transparent hover:bg-transparent focus:bg-transparent focus:ring-0 focus:border-transparent">
                                        <SelectValue placeholder="" />
                                    </SelectTrigger>
                                    <SelectContent defaultValue="gpt">
                                        <SelectGroup>
                                            {aiModels.map((model, index) => (
                                                <SelectItem key={index} value={model.name} className="text-sm">
                                                    {model.displayName}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}

                            {collections && (
                                <PromptCollection collections={collections} onSelect={handleCollectionSelect} />
                            )}
                        </div>

                        <div className="flex flex-1 justify-end items-center gap-2">
                            {/* Send button is enabled when there's a prompt OR at least one chip */}
                            <PromptSubmit disabled={isEmpty(prompt) && pastedChips.length === 0} />
                        </div>
                    </div>
                </div>
            </form>

            {showPills && (
                <div className="flex flex-wrap gap-2.5 justify-center mt-6">
                    {renderPills()}
                </div>
            )}

            <LimitDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />
            <EmptyDialog open={emptyDialog} onOpenChange={setEmptyDialog} />
        </div>
    )
}