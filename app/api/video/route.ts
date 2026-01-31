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

    // Verify user has access to this topic
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select(`
        id,
        course_id,
        courses (
          id,
          is_published
        )
      `)
      .eq('id', topicId)
      .single()

    if (topicError || !topic) {
      return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
    }

    if (!topic.courses?.is_published) {
      return NextResponse.json({ error: 'Course not published' }, { status: 403 })
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

    // Fetch the video with proper headers
    const response = await fetch(videoUrl, {
      method: 'GET',
      headers: {
        'User-Agent': req.headers.get('User-Agent') || '',
        'Referer': process.env.NEXT_PUBLIC_APP_URL || '',
        'Origin': process.env.NEXT_PUBLIC_APP_URL || '',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
    }

    // Get video content type
    const contentType = response.headers.get('content-type') || 'video/mp4'

    // Create headers to prevent caching and direct access
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline', // Prevents download prompt
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Range',
      'Accept-Ranges': 'bytes',
    })

    // Handle range requests for video streaming
    const range = req.headers.get('range')
    if (range) {
      const videoBuffer = await response.arrayBuffer()
      const videoSize = videoBuffer.byteLength
      
      const [start, end] = range.replace(/bytes=/, '').split('-')
      const startByte = parseInt(start, 10)
      const endByte = end ? parseInt(end, 10) : videoSize - 1
      const chunkSize = (endByte - startByte) + 1

      headers.set('Content-Range', `bytes ${startByte}-${endByte}/${videoSize}`)
      headers.set('Content-Length', chunkSize.toString())
      headers.set('Accept-Ranges', 'bytes')

      const videoChunk = videoBuffer.slice(startByte, endByte + 1)
      
      return new NextResponse(videoChunk, {
        status: 206, // Partial content
        headers,
      })
    }

    // Stream the video content
    const videoBuffer = await response.arrayBuffer()
    headers.set('Content-Length', videoBuffer.byteLength.toString())

    return new NextResponse(videoBuffer, {
      status: 200,
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
