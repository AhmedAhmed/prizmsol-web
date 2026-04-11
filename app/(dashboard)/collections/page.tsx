import PaneHeader from "@/components/PaneHeader";
import { Button } from "@/components/ui/button";
import { getCollections } from "@/lib/db/queries";
import { Collection } from "@/lib/db/schema";
import { isEmpty } from "lodash";
import { BookmarkIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import CollectionItem from "./collection-item";

export default async function CollectionsPage() {

    const collections = await getCollections();

    const renderCollections = () => {
        if (isEmpty(collections)) {
            return (
                <div className="flex flex-col flex-1 gap-5 justify-center items-center">
                    <BookmarkIcon size={40} className="text-neutral-500" />
                    <h1 className="text-xl font-semibold text-neutral-500">Looks like you haven't saved anything yet</h1>
                </div>
            );
        }

        return (
            <ul className="flex flex-col gap-2.5 p-5">
                {collections.map((collection: Collection, index: number) => <CollectionItem key={index} collection={collection} />)}
            </ul>
        );
    }

    return (
        <div className="flex flex-col flex-1">
            <PaneHeader>
                <div className="flex flex-1 items-center justify-between">
                    <h2 className="text-sm font-bold">Collections</h2>
                    <Button variant="outline" className="group text-sm  w-fit px-1.5 py-0.5 h-auto" asChild>
                        <Link href="/collections/create">
                            <PlusIcon className="h-2.5 w-2.5 opacity-50 group-hover:opacity-100 transition-all" />
                            <span className="text-sm">New Collection</span>
                        </Link>
                    </Button>
                </div>
            </PaneHeader>
            <div className="flex flex-col flex-1">
                {renderCollections()}
            </div>
        </div>
    );
}
