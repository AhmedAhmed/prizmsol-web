import Link from 'next/link';
import { ComponentPropsWithoutRef } from 'react';
import { highlight } from 'sugar-high';

type HeadingProps = ComponentPropsWithoutRef<'h1'>;
type ParagraphProps = ComponentPropsWithoutRef<'p'>;
type ListProps = ComponentPropsWithoutRef<'ul'>;
type ListItemProps = ComponentPropsWithoutRef<'li'>;
type AnchorProps = ComponentPropsWithoutRef<'a'>;
type BlockquoteProps = ComponentPropsWithoutRef<'blockquote'>;

const components = {
  h1: (props: HeadingProps) => (
    <h1 className="font-bold mb-0 text-3xl py-5" {...props} />
  ),
  h2: (props: HeadingProps) => (
    <h2
      className="font-bold mt-8 mb-3 py-2 text-2xl"
      {...props}
    />
  ),
  h3: (props: HeadingProps) => (
    <h3
      className="font-bold mt-8 mb-3 py-2 text-xl"
      {...props}
    />
  ),
  h4: (props: HeadingProps) => <h4 className="font-medium" {...props} />,
  p: (props: ParagraphProps) => (
    <p className="leading-snug pb-2" {...props} />
  ),
  ol: (props: ListProps) => (
    <ol
      className="text-neutral-800 dark:text-neutral-300 list-decimal pl-5 space-y-2"
      {...props}
    />
  ),
  ul: (props: ListProps) => (
    <ul
      className="text-neutral-800 dark:text-neutral-300 list-disc pl-5 space-y-1"
      {...props}
    />
  ),
  li: (props: ListItemProps) => <li className="pl-1 pb-5" {...props} />,
  em: (props: ComponentPropsWithoutRef<'em'>) => (
    <em className="font-medium" {...props} />
  ),
  strong: (props: ComponentPropsWithoutRef<'strong'>) => (
    <strong className="font-semibold text-neutral-800 dark:text-neutral-100" {...props} />
  ),
  a: ({ href, children, ...props }: AnchorProps) => {
    const className =
      'text-blue-500 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 dark:underline dark:underline-offset-2';
    if (href?.startsWith('/')) {
      return (
        <Link href={href} className={className} {...props}>
          {children}
        </Link>
      );
    }
    if (href?.startsWith('#')) {
      return (
        <a href={href} className={className} {...props}>
          {children}
        </a>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  },
  code: ({ children, ...props }: ComponentPropsWithoutRef<'code'>) => {
    const codeHTML = highlight(children as string);
    return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
  },
  Table: ({ data }: { data: { headers: string[]; rows: string[][] } }) => (
    <table>
      <thead>
        <tr>
          {data.headers.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row, index) => (
          <tr key={index}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  blockquote: (props: BlockquoteProps) => (
    <blockquote
      className="ml-[0.075em] border-l-3 border-neutral-300 pl-4 text-neutral-700 dark:border-neutral-600 dark:text-neutral-300"
      {...props}
    />
  ),
};

declare global {
  type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
  return components;
}
