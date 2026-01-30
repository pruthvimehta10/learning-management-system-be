import Link from 'next/link'
import { Folder } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CategoriesIndexPage() {
    const supabase = await createClient()
    const { data: categories } = await supabase
        .from('categories')
        .select('*, courses(count)')
        .order('name')

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-foreground">Course Categories</h1>
                    <p className="text-muted-foreground text-lg mt-2">Browse courses by topic</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories?.map((category) => (
                        <Link
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            className="group relative bg-card border-4 border-border rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <Folder className="h-8 w-8 text-primary" />
                                </div>
                                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                    {category.courses?.[0]?.count || 0} Courses
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                                {category.name}
                            </h3>
                            <p className="text-muted-foreground line-clamp-2">
                                {category.description}
                            </p>
                        </Link>
                    ))}

                    {categories?.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                            <Folder className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="font-bold">No categories defined yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
