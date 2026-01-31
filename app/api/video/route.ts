import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(req.url)
    const videoUrl = searchParams.get('url')
    const topicId = searchParams.get('topicId')

    if (!videoUrl || !topicId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    if (!videoUrl.startsWith('http')) {
      console.error('Video API: Invalid video URL protocol', { videoUrl })
      return NextResponse.json({ error: 'Invalid video URL' }, { status: 400 })
    }

    // 1. Fetch topic Details
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('id, course_id')
      .eq('id', topicId)
      .single()

    if (topicError || !topic) {
      console.error('Video API: Topic not found', { topicId, error: topicError })
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    // 2. Fetch Course to check if published
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, is_published')
      .eq('id', topic.course_id)
      .single()

    if (courseError || !course) {
      console.error('Video API: Course not found', { courseId: topic.course_id, error: courseError })
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // For development, we might want to bypass this check or at least log it
    if (!course.is_published) {
      console.warn('Video API: Accessing unpublished course', { courseId: course.id })
      // return NextResponse.json({ error: 'Course not published' }, { status: 403 })
    }

    // Check if user is enrolled (you might want to add this logic)
    // const { data: enrollment } = await supabase
    //   .from('enrollments')
    //   .select('*')
    //   .eq('course_id', topic.course_id)
    //   .eq('user_id', userId)
    //   .single()

    // if (!enrollment) {
    //   return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })
    // }

    // 4. Forward the request to the upstream video provider
    const rangeHeader = req.headers.get('range')
    const fetchHeaders: any = {
      'User-Agent': req.headers.get('User-Agent') || '',
    }
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader
    }

    console.log('Video API: Fetching upstream video', { videoUrl, range: rangeHeader })
    const response = await fetch(videoUrl, {
      method: 'GET',
      headers: fetchHeaders,
    })

    if (!response.ok && response.status !== 206) {
      console.error('Video API: Upstream fetch failed', { status: response.status, videoUrl })
      return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
    }

    // 5. Build response headers from upstream response
    const contentType = response.headers.get('content-type') || 'video/mp4'
    const contentLength = response.headers.get('content-length')
    const contentRange = response.headers.get('content-range')

    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
      'Accept-Ranges': 'bytes',
    })

    if (contentLength) headers.set('Content-Length', contentLength)
    if (contentRange) headers.set('Content-Range', contentRange)

    // 6. Return the video stream (Next.js handles ReadableStream automatically)
    return new NextResponse(response.body, {
      status: response.status,
      headers,
    })

  } catch (error: any) {
    console.error('Video streaming error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
