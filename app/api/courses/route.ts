import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const query = supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)

    const { data: courses, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(courses)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get('id')
    
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    console.log('Deleting course:', courseId)

    // Since CASCADE DELETE is enabled in Supabase, we only need to delete the course
    // The database will automatically handle deleting:
    // - All lessons associated with this course
    // - All quiz questions associated with those lessons
    // - All enrollments associated with this course
    const { error: courseError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (courseError) {
      console.error('Error deleting course:', courseError)
      return NextResponse.json(
        { error: 'Failed to delete course', details: courseError.message },
        { status: 400 }
      )
    }

    console.log('Course and all related data deleted successfully')
    return NextResponse.json({ 
      success: true, 
      message: 'Course deleted successfully' 
    })

  } catch (error: any) {
    console.error('Unexpected error during course deletion:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}