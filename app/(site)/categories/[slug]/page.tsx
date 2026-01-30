import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const supabase = await createClient()

    // Fetch category
    const { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single()

    if (!category) {
        notFound()
    }

    // Fetch courses in category
    // Note: We also want to apply lab filtering here ideally, but for now let's show all in category
    // or apply the same x-lab-id logic if critical.
    const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('category_id', category.id)
        .eq('is_published', true)

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="bg-primary/5 border-b-4 border-foreground py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <Button variant="ghost" asChild className="mb-6 -ml-4 font-bold text-muted-foreground hover:text-foreground">
                        <Link href="/categories">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
                        </Link>
                    </Button>
                    <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">
                        {category.name}
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl font-medium">
                        {category.description}
                    </p>
                </div>
            </div>

            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses && courses.length > 0 ? (
                        courses.map((course) => (
                            <div
                                key={course.id}
                                className="group flex flex-col overflow-hidden rounded-3xl bg-card shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 border-2 border-transparent hover:border-foreground"
                            >
                                <div className="aspect-video w-full relative bg-muted/20 flex items-center justify-center border-b-2 border-muted/50">
                                    {course.thumbnail_url ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col p-6">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold leading-tight mb-2 text-card-foreground line-clamp-1">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                                            {course.description}
                                        </p>
                                    </div>

                                    <div className="mt-auto pt-4">
                                        <Button
                                            asChild
                                            className="w-full h-12 rounded-2xl text-sm font-bold bg-foreground text-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                                        >
                                            <Link href={`/courses/${course.id}`}>
                                                View Course <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center">
                            <p className="text-xl font-bold text-muted-foreground">No courses found in this category.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
