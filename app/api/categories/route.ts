import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name')

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, description } = body
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

        const supabase = await createClient()
        const { data, error } = await supabase
            .from('categories')
            .insert({ name, description, slug })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 400 })

        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
