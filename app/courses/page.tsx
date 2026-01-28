import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CoursesPage() {
    const supabase = await createClient()
    // 2. Build the query
    const query = supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)

    const { data: courses, error } = await query.order('created_at', { ascending: false })

    if (error) console.error('Supabase Error:', error)

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="space-y-10">
                    {/* Header */}
                    <div className="space-y-4">
                        <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight">
                            All Courses
                        </h1>
                        <p className="text-lg font-medium text-muted-foreground max-w-2xl">
                            Browse our complete catalog of professional courses and start your learning journey today.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses && courses.length > 0 ? (
                            courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="group flex flex-col overflow-hidden rounded-3xl bg-card shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
                                >
                                    <div className="aspect-video w-full relative bg-muted/20 flex items-center justify-center">
                                        {course.thumbnail_url ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <BookOpen className="h-12 w-12 text-muted-foreground/30" />
                                        )}

                                    </div>

                                    <div className="flex flex-1 flex-col p-8">
                                        <div className="mb-6">
                                            <h3 className="text-2xl font-bold leading-tight mb-2 text-card-foreground line-clamp-1">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                                                {course.description}
                                            </p>
                                        </div>

                                        <div className="mt-auto space-y-5">
                                            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-yellow-500">⭐</span> {course.rating || 'New'}
                                                </div>
                                                <div>
                                                    {course.total_students?.toLocaleString() || 0} enrolled
                                                </div>
                                            </div>

                                            <Button
                                                asChild
                                                className="w-full h-14 rounded-2xl text-base font-bold bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/95 group-hover:bg-primary/90 active:scale-[0.98]"
                                            >
                                                <Link href={`/courses/${course.id}`}>
                                                    Start Learning <ArrowRight className="ml-2 h-5 w-5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center space-y-6">
                                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted/30">
                                    <BookOpen className="h-10 w-10 text-muted-foreground/50" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-foreground">No courses found</h3>
                                    <p className="text-muted-foreground mt-2 font-medium">We're still developing content. Check back soon!</p>
                                </div>
                                <Button asChild variant="outline" className="rounded-xl px-8 h-12">
                                    <Link href="/courses">View All Courses</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
