import NavLink from "../NavLink";

export default function ChatItem({ item }: { item: any; }) {
    const renderTitle = () => {
        return item.title;
    }
    return (
        <div className="hidden lg:flex flex-1 items-center gap-2">
            <NavLink
                href={`/chat/${item.id}`}
                baseUrl="/"
                inactiveClassName="flex flex-1 cursor-default h-full items-center p-2 lg:px-2.5 lg:py-2 gap-2 w-full text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-50 border border-transparent hover:bg-neutral-200 dark:hover:bg-neutral-700/30 hover:border-neutral-300 dark:hover:border-neutral-800/30 rounded-md"
                activeClassName="flex flex-1 cursor-default h-full items-center p-2 lg:px-2.5 lg:py-2 gap-2 w-full bg-neutral-200 hover:bg-neutral-300/60 dark:bg-neutral-600/30 dark:hover:bg-neutral-500/30 border border-neutral-300 dark:border-neutral-700/30 rounded-md"
                title={item.title}
            >
                <span className="flex-1 text-sm font-medium line-clamp-1">{renderTitle()}</span>
            </NavLink>
        </div>
    );
}