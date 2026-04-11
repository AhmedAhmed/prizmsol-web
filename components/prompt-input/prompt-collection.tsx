import { Collection } from "@/lib/db/schema";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../ui/select";

export default function PromptCollection({
    collections,
    onSelect,
    defaultValue
}: {
    collections: Array<Collection>;
    onSelect: (value: string) => void;
    defaultValue?: string;
}) {
    const renderItems = () => {
        return collections.map((collection: Collection, index: number) => {
            return <SelectItem key={index} value={collection.id}>{collection.name}</SelectItem>
        });
    }
    return (
        <Select defaultValue={defaultValue || "0"} onValueChange={onSelect} name="collection">
            <SelectTrigger className="w-fit h-8 gap-2 cursor-pointer outline-none border-none bg-transparent dark:bg-transparent hover:bg-neutral-200/80 dark:hover:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400">
                <SelectValue placeholder="Choose a collection" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={"0"} className="text-neutral-500 font-semibold">Collection</SelectItem>
                {renderItems()}
            </SelectContent>
        </Select>
    );
}
