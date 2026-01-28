import { createClient } from '@/lib/supabase/server'
import { ExamInterface } from '@/components/exam-interface'

export default async function ExamPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch course
    const { data: course } = await supabase
        .from('courses')
        .select('id, title')
        .eq('id', id)
        .single()

    // Fetch exam questions linked to lessons in this course
    // Note: Schema requires questions to be linked to a lesson to identify the course.
    // We filter by lessons belonging to this course.
    const { data: examQuestions } = await supabase
        .from('quiz_questions')
        .select(`
      *,
      quiz_options (*),
      lessons!inner (
        course_id
      )
    `)
        .eq('lessons.course_id', id)
        .eq('is_final_exam', true)

    if (!course) return <div>Course not found</div>

    // Transform for Interface
    const questions = (examQuestions || []).map((q: any) => ({
        id: q.id,
        question_text: q.question_text,
        correct_answer: q.correct_answer_index,
        options: (q.quiz_options || [])
            .sort((a: any, b: any) => a.option_order - b.option_order)
            .map((o: any) => o.option_text)
    }))

    return <ExamInterface course={course} questions={questions} />
}
