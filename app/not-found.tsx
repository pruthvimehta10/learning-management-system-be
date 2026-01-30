import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="flex justify-center">
                    <div className="bg-secondary/30 p-6 rounded-full">
                        <FileQuestion className="h-16 w-16 text-foreground" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight">Page Not Found</h1>
                    <p className="text-xl text-muted-foreground font-medium">
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="pt-4">
                    <Button asChild className="h-12 px-8 text-lg font-bold border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <Link href="/">
                            Return Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
