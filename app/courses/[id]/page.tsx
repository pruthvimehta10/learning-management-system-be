import { createClient } from '@/lib/supabase/server'
import { CoursePlayer } from '@/components/course-player'
import { redirect } from 'next/navigation'

export default async function CoursePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch course details first (without join to avoid FK error)
    const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()

    if (courseError) {
        console.error("Error fetching course:", courseError);
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4">404</h1>
                    <p className="text-xl">Course not found</p>
                    {courseError && (
                        <pre className="text-left bg-gray-100 p-4 rounded mt-4 text-xs text-red-500 overflow-auto max-w-lg mx-auto">
                            DEBUG INFO:
                            ID: {id}
                            Error: {JSON.stringify(courseError, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        )
    }

    // 2. Fetch lessons separately
    // We try to fetch deeply rooted questions too. 
    // If this fails due to lessons -> quiz_questions FK missing (unlikely?), we might need another split.
    // Assuming only courses -> lessons FK is missing based on error 'courses' and 'lessons'.
    const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select(`
            *,
            quiz_questions (
                *,
                quiz_options (*)
            )
        `)
        .eq('course_id', id)
        .order('order_index')

    if (lessonsError) {
        console.error("Error fetching lessons:", lessonsError)
    }

    // Verify labid from JWT matches course's lab_id
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const userLabId = headersList.get('x-lab-id') || '';

    // If course has a lab_id, verify it matches the user's lab_id
    if (course.lab_id && course.lab_id !== userLabId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-foreground">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-4">Access Denied</h1>
                    <p className="text-xl">This course is not available for your lab.</p>
                </div>
            </div>
        )
    }

    // Process lessons to match CoursePlayer interface
    const lessons = (lessonsData || [])
        .map((lesson: any, index: number) => ({
            ...lesson,
            videoUrl: lesson_url_safe(lesson),
            duration: lesson.duration || 10,
            completed: false, // In a real app, fetch 'lesson_completions'
            isLocked: index !== 0, // Unlock first lesson only for demo
            questions: (lesson.quiz_questions || [])
                .sort((a: any, b: any) => a.question_order - b.question_order)
                .map((q: any) => ({
                    id: q.id,
                    question: q.question_text,
                    correctAnswer: q.correct_answer_index,
                    options: (q.quiz_options || [])
                        .sort((a: any, b: any) => a.option_order - b.option_order)
                        .map((o: any) => o.option_text)
                })),
        }));

    return (
        <CoursePlayer
            courseTitle={course.title}
            lessons={lessons}
            initialLessonId={lessons[0]?.id || ''}
        />
    )
}

function lesson_url_safe(lesson: any) {
    if (lesson.video_url) return lesson.video_url
    return ""
}
