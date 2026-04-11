import LogoIcon from '@/components/logoIcon';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function NotFound() {
    return (
        <div className='flex flex-col gap-5 flex-1 justify-center items-center'>
            <LogoIcon className="h-[40px]" />
            <h2 className='text-4xl font-bold mt-5'>404 Not Found</h2>
            <p className='text-xl'>
                The page you are looking for no longer exists
            </p>
            <Button className='mt-5' asChild>
                <Link href="/">Go Back</Link>
            </Button>
        </div>
    )
}
