'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { use } from 'react'

export default function NewLessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: courseId } = use(params)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const video_url = formData.get('video_url') as string
        const duration = parseInt(formData.get('duration') as string) || 0

        // 1. Get current max order to append to end
        const { data: existingLessons } = await supabase
            .from('lessons')
            .select('order_index')
            .eq('course_id', courseId)
            .order('order_index', { ascending: false })
            .limit(1)

        const nextOrder = (existingLessons?.[0]?.order_index ?? -1) + 1

        // 2. Insert new lesson
        const { error } = await supabase.from('lessons').insert({
            course_id: courseId,
            title,
            description,
            video_url,
            video_duration_seconds: duration * 60, // convert minutes to seconds
            order_index: nextOrder,
        })

        if (error && error.code === '42703') {
            alert('Error creating lesson (Column mismatch?): ' + error.message)
        } else if (error) {
            alert('Error creating lesson: ' + error.message)
        } else {
            router.push(`/admin/courses/${courseId}`)
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent -ml-2">
                    <Link href={`/admin/courses/${courseId}`} className="flex items-center gap-2 font-bold text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" /> Back to Course
                    </Link>
                </Button>
            </div>

            <div>
                <h2 className="text-3xl font-black tracking-tight text-foreground">Add New Lesson</h2>
                <p className="text-muted-foreground font-bold">
                    Add a video lesson to your course.
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-8 border-4 border-foreground p-8 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
                <div className="space-y-2">
                    <Label htmlFor="title" className="font-bold">Lesson Title</Label>
                    <Input id="title" name="title" required placeholder="e.g. Introduction to React" className="border-2 border-foreground" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="font-bold">Description</Label>
                    <Textarea id="description" name="description" placeholder="Brief summary of what this lesson covers..." className="border-2 border-foreground min-h-[100px]" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="video_url" className="font-bold">Video URL</Label>
                    <Input id="video_url" name="video_url" required placeholder="https://..." className="border-2 border-foreground" />
                    <p className="text-xs text-muted-foreground">Direct link to mp4 or supported video host.</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="duration" className="font-bold">Duration (minutes)</Label>
                    <Input id="duration" name="duration" type="number" min="0" placeholder="10" className="border-2 border-foreground" />
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <Button type="button" variant="ghost" asChild className="font-bold">
                        <Link href={`/admin/courses/${courseId}`}>Cancel</Link>
                    </Button>
                    <Button
                        type="submit"
                        name="action"
                        value="save"
                        disabled={loading}
                        className="border-4 border-foreground bg-white text-foreground hover:bg-gray-100 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Lesson
                    </Button>
                    <Button
                        type="submit"
                        name="action"
                        value="save-quiz"
                        disabled={loading}
                        className="border-4 border-foreground bg-primary text-primary-foreground font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save & Add Quiz
                    </Button>
                </div>
            </form>
        </div>
    )
}
