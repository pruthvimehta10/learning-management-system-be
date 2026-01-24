import Link from 'next/link'
import { ArrowRight, Play, BookOpen, Award, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()

  // Fetch featured courses
  const { data: featuredCourses, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .limit(4)

  if (error) {
    console.error('Supabase Error fetching courses:', error)
  }

  const courses = featuredCourses || []

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Featured Courses Section */}
      <section id="courses" className="max-w-7xl mx-auto px-4 py-12 border-t-4 border-foreground">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-5xl font-black text-foreground">Featured Courses</h2>
            <p className="text-lg font-semibold text-foreground">
              Start with these popular courses and develop in-demand skills
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.length > 0 ? (
              courses.map((course, idx) => {
                const colors = [
                  { bg: 'bg-primary', text: 'text-primary-foreground', label: 'bg-secondary' },
                  { bg: 'bg-secondary', text: 'text-secondary-foreground', label: 'bg-accent' },
                  { bg: 'bg-accent', text: 'text-accent-foreground', label: 'bg-primary' },
                  { bg: 'bg-primary', text: 'text-primary-foreground', label: 'bg-secondary' },
                ]
                const color = colors[idx % 4]
                return (
                  <div key={course.id} className="border-4 border-foreground overflow-hidden transition-all" style={{ boxShadow: '6px 6px 0px rgba(0,0,0,0.15)' }}>
                    {/* Course Image Placeholder */}
                    <div className={`h-40 ${color.bg} flex items-center justify-center border-b-4 border-foreground`}>
                      {course.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className={`h-12 w-12 ${color.text}`} />
                      )}
                    </div>

                    <div className="p-6 bg-background">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className={`text-xs font-black border-2 border-foreground ${color.label} px-3 py-1`}>
                          {course.category}
                        </span>
                        <span className="text-xs font-black border-2 border-foreground bg-muted px-3 py-1">
                          {course.level || 'Beginner'}
                        </span>
                      </div>
                      <h3 className="font-black text-lg text-foreground leading-tight mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-sm font-semibold text-foreground/70 line-clamp-2 mb-4">{course.description}</p>

                      <div className="space-y-2 text-sm mb-4 border-t-2 border-foreground pt-3">
                        <div className="flex justify-between font-semibold">
                          <span>Rating</span>
                          <span className="text-foreground">⭐ {course.rating || 'New'}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Students</span>
                          <span className="text-foreground">{course.total_students?.toLocaleString() || 0}</span>
                        </div>
                      </div>

                      <Button asChild className={`w-full border-4 border-foreground ${color.bg} ${color.text} font-black`}>
                        <Link href={`/courses/${course.id}`}>View Course</Link>
                      </Button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-4 text-center py-12">
                <p className="text-xl font-bold text-foreground">No courses found. Seed the database to see content.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
