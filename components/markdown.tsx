import Link from 'next/link';
import { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeTag from './code-tag';

const components: Partial<Components> = {
    code: CodeTag as any,
    pre: ({ children }: any) => <>{children}</>,
    ol: ({ node, children, ...props }: any) => {
        return (
            <ol className="list-decimal list-outside ml-4" {...props}>
                {children}
            </ol>
        );
    },
    li: ({ node, children, ...props }: any) => {
        return (
            <li className="py-1 ml-5 text-sm marker:text-black/60 dark:marker:text-white/60" {...props}>
                {children}
            </li>
        );
    },
    ul: ({ node, children, ...props }: any) => {
        return (
            <ul className="list-disc list-outside ml-1 py-2.5" {...props}>
                {children}
            </ul>
        );
    },
    strong: ({ node, children, ...props }: any) => {
        return (
            <span className="text-md font-semibold" {...props}>
                {children}
            </span>
        );
    },
    a: ({ node, children, ...props }: any) => {
        return (
            <Link
                className="text-blue-700 dark:text-blue-500 font-semibold hover:underline"
                target="_blank"
                rel="noreferrer"
                {...props}
            >
                {children}
            </Link>
        );
    },
    h1: ({ node, children, ...props }: any) => {
        return (
            <h1 className="text-3xl font-semibold my-2.5" {...props}>
                {children}
            </h1>
        );
    },
    h2: ({ node, children, ...props }: any) => {
        return (
            <h2 className="text-2xl font-semibold my-2.5" {...props}>
                {children}
            </h2>
        );
    },
    h3: ({ node, children, ...props }: any) => {
        return (
            <h3 className="text-xl font-semibold my-2.5" {...props}>
                {children}
            </h3>
        );
    },
    h4: ({ node, children, ...props }: any) => {
        return (
            <h4 className="text-lg font-semibold my-2.5" {...props}>
                {children}
            </h4>
        );
    },
    h5: ({ node, children, ...props }: any) => {
        return (
            <h5 className="text-base font-semibold my-2.5" {...props}>
                {children}
            </h5>
        );
    },
    h6: ({ node, children, ...props }: any) => {
        return (
            <h6 className="text-sm font-semibold my-2.5" {...props}>
                {children}
            </h6>
        );
    },
    p: ({ node, children, ...props }: any) => {
        return (
            <p className="text-sm" {...props}>
                {children}
            </p>
        );
    },
    hr: ({ node, children, ...props }: any) => {
        return <hr className="my-6 border-neutral-300 dark:border-neutral-700" {...props} />;
    },
    i: ({ node, children, ...props }: any) => {
        return (
            <span className="italic" {...props}>
                {children}
            </span>
        );
    },
    table: ({ node, children, ...props }: any) => {
        return (
            <table className='border border-neutral-300 dark:border-neutral-600' {...props}>
                {children}
            </table>
        );
    },
    th: ({ node, children, ...props }: any) => {
        return (
            <th className='border-r border-neutral-300 dark:border-neutral-700 p-1.5' {...props}>
                {children}
            </th>
        );
    },
    td: ({ node, children, ...props }: any) => {
        return (
            <td className='border-r border-neutral-300 dark:border-neutral-700 p-1.5' {...props}>
                {children}
            </td>
        );
    },
    tr: ({ node, children, ...props }: any) => {
        return (
            <tr className='border-b border-neutral-300 dark:border-neutral-700' {...props}>
                {children}
            </tr>
        );
    },
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
    return (
        <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
            {children}
        </ReactMarkdown>
    );
};

export const Markdown = memo(
    NonMemoizedMarkdown,
    (prevProps, nextProps) => prevProps.children === nextProps.children,
);

