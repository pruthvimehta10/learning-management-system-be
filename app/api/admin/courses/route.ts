import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use Service Role Key to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        // Get user ID from middleware headers (already verified JWT)
        const userId = req.headers.get('x-user-id')
        const userRole = req.headers.get('x-user-role')

        if (!userId || userRole !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized: Admin access required' },
                { status: 403 }
            )
        }

        const body = await req.json()
        const { title, description, category_id, is_published } = body

        if (!title) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            )
        }

        const { data: course, error } = await supabase
            .from('courses')
            .insert({
                title,
                description,
                category_id: category_id || null,
                instructor_id: userId,
                is_published: is_published !== undefined ? is_published : true,
            })
            .select()
            .single()

        if (error) {
            console.error('Course creation error:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(course, { status: 201 })
    } catch (error: any) {
        console.error('Server error creating course:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
