import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient()

        const { data: labs, error } = await supabase
            .from('labs')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(labs)
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, code, description } = body

        if (!name || !code) {
            return NextResponse.json(
                { error: 'Name and Code are required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // Check auth/permissions? usage of this API implies admin or similar.
        // For now we rely on RLS or just general auth. 
        // Ideally we should check if user is admin.

        const { data: lab, error } = await supabase
            .from('labs')
            .insert({ name, code, description })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json(lab)
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
