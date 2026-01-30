import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use Service Role Key to bypass RLS, relying on Middleware for AuthZ
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('CRITICAL ERROR: Missing Supabase Environment Variables in /api/labs')
    console.error('NEXT_PUBLIC_SUPABASE_URL exists:', !!supabaseUrl)
    console.error('SUPABASE_SERVICE_ROLE_KEY exists:', !!supabaseServiceKey)
}

const supabase = createClient(
    supabaseUrl || '',
    supabaseServiceKey || ''
)

export async function GET(req: NextRequest) {
    try {
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
