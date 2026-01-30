'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Save, FileQuestion, Edit, Trash2, Loader2, Video } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TopicEditDialog } from '@/components/admin/topic-edit-dialog'
import { CourseLabsSelector } from '@/components/admin/course-labs-selector'

interface Topic {
    id: string
    title: string
    description?: string
    video_url?: string
    video_duration_seconds?: number
    order_index: number
    created_at?: string
    quiz_questions: { count: number }[]
}

interface Course {
    id: string
    title: string
    description: string
    level: string
    topics: Topic[]
}

export default function AdminCourseEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: courseId } = use(params)
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [course, setCourse] = useState<Course | null>(null)
    const [topics, setTopics] = useState<Topic[]>([])
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [level, setLevel] = useState('')
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

    useEffect(() => {
        fetchCourse()
        fetchCategories()
    }, [courseId])

    async function fetchCategories() {
        const { data } = await supabase.from('categories').select('id, name').order('name')
        if (data) setCategories(data)
    }

    async function fetchCourse() {
        console.log('Fetching course data for:', courseId)
        try {
            // Fetch Course Only
            const { data: courseData, error: courseError } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single()

            if (courseError) {
                console.error('Fetch course error:', courseError)
                throw courseError
            }

            // Fetch Topics separately
            const { data: topicsData, error: topicsError } = await supabase
                .from('topics')
                .select(`
                    id,
                    title,
                    description,
                    video_url,
                    video_duration_seconds,
                    order_index,
                    quiz_questions (count)
                `)
                .eq('course_id', courseId)
                .order('order_index')

            if (topicsError) {
                // Ignore missing table error for topics if it happens, just array empty
                console.error('Fetch topics error:', topicsError)
            }

            if (courseData) {
                setCourse(courseData as Course)
                setTitle(courseData.title)
                setDescription(courseData.description || '')
                setLevel(courseData.level || '')
                setSelectedCategoryId(courseData.category_id || '')

                setTopics((topicsData || []) as any[])
                console.log('Course data loaded successfully')
            }
        } catch (err: any) {
            console.error('Failed to fetch course:', err)
            // Don't alert blocking error, just log it. Data might be partial.
        }
    }

    async function handleSaveCourse() {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('courses')
                .update({
                    title,
                    description,
                    level,
                    category_id: selectedCategoryId || null
                })
                .eq('id', courseId)

            if (error) {
                console.error('Update error:', error)
                alert('Error saving course: ' + error.message)
            } else {
                console.log('Course saved successfully, refreshing data...')
                await fetchCourse()
                alert('Course saved successfully!')
            }
        } catch (err: any) {
            console.error('Save error:', err)
            alert('An unexpected error occurred while saving: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleDeleteTopic(topicId: string) {
        if (!confirm('Are you sure you want to delete this topic? This will also delete all associated quizzes.')) {
            return
        }

        const { error } = await supabase
            .from('topics')
            .delete()
            .eq('id', topicId)

        if (error) {
            alert('Error deleting topic: ' + error.message)
        } else {
            fetchCourse()
        }
    }

    function openEditDialog(topic: Topic) {
        setEditingTopic(topic)
        setDialogOpen(true)
    }

    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent -ml-2">
                    <Link href="/admin/courses" className="flex items-center gap-2 font-bold text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" /> Back to Courses
                    </Link>
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black tracking-tight text-foreground">Edit Course</h2>
                <Button
                    onClick={handleSaveCourse}
                    disabled={loading}
                    className="border-4 border-foreground bg-primary text-primary-foreground font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="font-black">Course Details</CardTitle>
                            <Button size="sm" variant="outline" asChild className="border-2 border-foreground font-bold">
                                <Link href={`/admin/courses/${courseId}/topics/new`}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Topic
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="font-bold">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border-2 border-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="font-bold">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="border-2 border-foreground min-h-[100px]"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="font-black">Topics & Videos</CardTitle>
                            <Badge variant="outline" className="border-2 border-foreground font-bold">
                                {topics.length} Topics
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="font-black text-foreground">#</TableHead>
                                        <TableHead className="font-black text-foreground">Title</TableHead>
                                        <TableHead className="font-black text-foreground">Video</TableHead>
                                        <TableHead className="font-black text-foreground">Quiz</TableHead>
                                        <TableHead className="text-right font-black text-foreground">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topics.map((topic, idx) => (
                                        <TableRow key={topic.id} className="font-medium">
                                            <TableCell>{idx + 1}</TableCell>
                                            <TableCell className="font-semibold">{topic.title}</TableCell>
                                            <TableCell>
                                                {topic.video_url ? (
                                                    <Badge variant="outline" className="border-2 border-foreground bg-blue-100 text-blue-800">
                                                        <Video className="h-3 w-3 mr-1" />
                                                        {topic.video_duration_seconds ? `${Math.round(topic.video_duration_seconds / 60)}m` : 'Video'}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">No video</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {topic.quiz_questions && topic.quiz_questions[0]?.count > 0 ? (
                                                    <Badge variant="outline" className="border-2 border-foreground bg-green-100 text-green-800">
                                                        {topic.quiz_questions[0].count} Qs
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">No Quiz</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => openEditDialog(topic)}
                                                        className="h-8 w-8"
                                                        title="Edit Topic"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        asChild
                                                        className="h-8 w-8"
                                                        title="Manage Quiz"
                                                    >
                                                        <Link href={`/admin/courses/${courseId}/topics/${topic.id}/quiz`}>
                                                            <FileQuestion className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteTopic(topic.id)}
                                                        className="h-8 w-8 hover:text-destructive"
                                                        title="Delete Topic"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {topics.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No topics yet. Click "Add Topic" to get started.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <Card className="border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                        <CardHeader>
                            <CardTitle className="font-black">Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="font-bold">Level</Label>
                                <Input
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="border-2 border-foreground"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold">Category</Label>
                                <select 
                                    className="flex h-10 w-full rounded-md border-2 border-foreground bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={selectedCategoryId}
                                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                                >
                                    <option value="">No Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <CourseLabsSelector courseId={courseId} />

                    <Card className="border-4 border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-blue-50">
                        <CardHeader>
                            <CardTitle className="font-black text-sm">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                asChild
                                variant="outline"
                                className="w-full border-2 border-foreground font-bold justify-start"
                            >
                                <Link href={`/admin/courses/${courseId}/topics/new`}>
                                    <Plus className="mr-2 h-4 w-4" /> Add Topic
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full border-2 border-foreground font-bold justify-start"
                            >
                                <Link href={`/courses/${courseId}`} target="_blank">
                                    <Video className="mr-2 h-4 w-4" /> Preview Course
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <TopicEditDialog
                topic={editingTopic}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSuccess={fetchCourse}
            />
        </div>
    )
}
