'use client'
import Highlight from '@tiptap/extension-highlight'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useRef } from 'react'
import mentionList from './mention-list'

const AIEditor = ({
    defaultValue,
    content,
    isEditable = false
}: {
    defaultValue?: string;
    content?: string;
    isEditable?: boolean;
}) => {

    const wrapperRef = useRef<HTMLDivElement>(null)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    HTMLAttributes: {
                        class: "list-disc list-outside leading-3",
                    },
                },
                paragraph: {
                    HTMLAttributes: {
                        class: "m-2 text-base"
                    }
                },
                orderedList: {
                    HTMLAttributes: {
                        class: " list-outside leading-3",
                    },
                },
                listItem: {
                    HTMLAttributes: {
                        class: "leading-normal",
                    },
                },
                heading: {
                    HTMLAttributes: {
                        class: "m-2",
                    },
                },
                blockquote: {
                    HTMLAttributes: {
                        class: "border-l-4 border-blue-300 pl-4",
                    },
                },
                codeBlock: {
                    HTMLAttributes: {
                        class: "rounded-md bg-blue-200 p-5 font-mono font-medium text-blue-800",
                    },
                },
                code: {
                    HTMLAttributes: {
                        class:
                            "rounded-md bg-neutral-200 px-1.5 py-1 font-mono font-medium text-black",
                    },
                },
            }),
            Highlight,
            Typography,
            Placeholder.configure({
                placeholder: 'Thinking...',
            }),
            Mention.configure({
                HTMLAttributes: {
                    class: 'mention',
                },
                suggestion: mentionList
            })
        ],
        content: defaultValue,
        editable: isEditable,
        immediatelyRender: false
    })

    const focusEditor = () => {
        editor?.commands.focus()
    }

    useEffect(() => {
        if (editor && content) {
            editor.commands.setContent(content)
        }
    }, [content])

    useEffect(() => {
        if (editor && content) {
            editor.commands.setContent(content || defaultValue || '');
        }
    }, []);

    useEffect(() => {
        if (editor && defaultValue) {
            editor.commands.setContent(defaultValue)
        }
    }, [defaultValue])

    return (
        <div ref={wrapperRef} onClick={focusEditor} className='flex flex-1'>
            <EditorContent editor={editor} className='flex flex-1 text-sm w-full' />
        </div>
    );
}

export default AIEditor;
