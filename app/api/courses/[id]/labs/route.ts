import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use Service Role Key to bypass RLS for Admin actions
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Get labs assigned to a course
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        // Join course_labs with labs
        const { data: courseLabs, error } = await supabase
            .from('course_labs')
            .select(`
        *,
        labs (*)
      `)
            .eq('course_id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        // Flatten structure for easier consumption
        const labs = courseLabs.map((cl: any) => cl.labs)

        return NextResponse.json(labs)
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Update labs for a course (Assign/Unassign)
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const { labIds } = await req.json() // Expects array of lab IDs

        // Transaction-like approach: 
        // 1. Delete existing assignments for this course
        // 2. Insert new ones

        // Note: Supabase doesn't support complex transactions in client library easily without RPC.
        // We will do it in two steps. It's not atomic but sufficient for now.

        // 1. Delete all
        const { error: deleteError } = await supabase
            .from('course_labs')
            .delete()
            .eq('course_id', id)

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 400 })
        }

        // 2. Insert new
        if (labIds && labIds.length > 0) {
            const rows = labIds.map((labId: string) => ({
                course_id: id,
                lab_id: labId
            }))

            const { error: insertError } = await supabase
                .from('course_labs')
                .insert(rows)

            if (insertError) {
                return NextResponse.json({ error: insertError.message }, { status: 400 })
            }
        }

        return NextResponse.json({ success: true, message: 'Labs updated' })
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
