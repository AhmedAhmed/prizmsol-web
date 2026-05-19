export default function PaneHeader(props: { children: React.ReactNode }) {
    const className = `flex sticky top-0 z-10 p-2.5 bg-neutral-50/80 dark:bg-neutral-950 backdrop-blur-lg border-b-[0.5px] border-neutral-300 dark:border-neutral-800 h-[40px]`;
    return (
        <div className={className}>
            {props.children}
        </div>
    );
}
