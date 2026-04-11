"use client";

import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import rangeParser from 'parse-numeric-range';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import asm6502 from 'react-syntax-highlighter/dist/cjs/languages/prism/asm6502';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import go from 'react-syntax-highlighter/dist/cjs/languages/prism/go';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss';
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('assembly', asm6502);

export default function CodeTag({ node, inline, className, ...props }) {
    const { theme, systemTheme } = useTheme();

    const getSyntaxTheme = () => {
        if (theme === 'dark') {
            return oneDark;
        } else if (theme === 'light') {
            return oneLight;
        } else if (theme === "system") {
            return systemTheme === 'dark' ? oneDark : oneLight;
        }
    }

    const syntaxTheme = getSyntaxTheme();

    const hasLang = /language-(\w+)/.exec(className || '');
    const hasMeta = node?.data?.meta;

    const applyHighlights = (applyHighlights) => {
        if (hasMeta) {
            const RE = /{([\d,-]+)}/;
            const metadata = node.data.meta?.replace(/\s/g, '');
            const strlineNumbers = RE?.test(metadata)
                ? RE?.exec(metadata)[1]
                : '0';
            const highlightLines = rangeParser(strlineNumbers);
            const highlight = highlightLines;
            const data = highlight.includes(applyHighlights)
                ? 'highlight'
                : null;
            return { data };
        } else {
            return {};
        }
    };

    return hasLang ? (
        <SyntaxHighlighter
            style={syntaxTheme}
            language={hasLang[1]}
            PreTag="div"
            codeTagProps={{
                className: 'text-sm inline-block h-fit',
                style: { textWrapMode: "wrap" },
            }}
            customStyle={{
                background: '#020618 !important',
            }}
            className="min-h-52 dark:bg-neutral-950 !m-0"
            showLineNumbers={true}
            wrapLines={hasMeta}
            useInlineStyles={true}
            lineProps={applyHighlights}
        >
            {props.children}
        </SyntaxHighlighter>
    ) : (
        <code className={cn("h-fit break-all", className)} {...props} />
    )
}

