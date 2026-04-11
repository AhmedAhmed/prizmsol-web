import { ArrowUpIcon, Loader2Icon, SquareIcon } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';

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

    return (
        <Button
            type="submit"
            size="icon"
            className="rounded-xl bg-blue-500 hover:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-white h-8 w-8"
            disabled={status?.pending || disabled}
        >
            {renderIcon()}
            <span className="sr-only">Send</span>
        </Button>
    );
}
