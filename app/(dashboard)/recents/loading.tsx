export default function RecentLoading() {
    const renderItem = () => {
        return [...Array(10)].map((_, index: number) => (
            <div key={index} className="flex flex-col justify-between gap-2 h-[66px] border border-neutral-300 dark:border-neutral-900 w-full rounded-lg animate-pulse p-2">
                <span className="flex w-full bg-neutral-300 dark:bg-neutral-700 h-[20px] rounded-md animate-pulse"></span>
                <span className="flex w-1/4 bg-neutral-300 h-[15px] dark:bg-neutral-700 p-1 rounded-md animate-pulse"></span>
            </div>
        ));
    }

    return (
        <>
            <div className="flex flex-col flex-1 gap-2 w-full">
                {renderItem()}
            </div>
        </>
    );
}
