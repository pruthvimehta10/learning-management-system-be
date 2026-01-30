import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const supabase = await createClient()

    // 1. Fetch course only
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (courseError) {
      return NextResponse.json({ error: courseError.message }, { status: 400 })
    }

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // 2. Fetch lessons separately
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*, quiz_questions(*)')
      .eq('course_id', id)
      .order('order_index') // Using order() here is fine for direct table query

    if (lessonsError) {
      // We log but don't fail the whole request? Or maybe we should.
      // Let's fail for consistency.
      console.error("Error fetching lessons:", lessonsError)
      return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 400 })
    }

    // Combine manually
    const result = {
      ...course,
      lessons: lessons || []
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}