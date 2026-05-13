import { ArrowUpIcon, Loader2Icon, SquareIcon } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Button } from '../../ui/button';

export default function PromptSubmit({ disabled, streaming = false }: { disabled?: boolean, streaming?: boolean }) {
    const status = useFormStatus();

    const renderIcon = () => {
        if (status.pending && streaming) {
            return <SquareIcon className='fill-white h-4 w-4' />;
        }

        if (status.pending && !streaming) {
            return <Loader2Icon className='animate-spin h-4 w-4' />;
        }

        return <ArrowUpIcon className="h-4 w-4" />;
    }

    const isDisabled = status?.pending || disabled

    return (
        <Button
            type="submit"
            size="icon"
            className={
                isDisabled
                    ? "rounded-full bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed h-8 w-8"
                    : "rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white dark:text-white h-8 w-8"
            }
            disabled={isDisabled}
        >
            {renderIcon()}
            <span className="sr-only">Send</span>
        </Button>
    );
}
