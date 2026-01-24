import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default async function AdminCoursesPage() {
    const supabase = await createClient()

    const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground">Courses</h2>
                    <p className="text-muted-foreground font-bold">
                        Manage your course content and lessons.
                    </p>
                </div>
                <Button asChild className="border-4 border-foreground bg-primary text-primary-foreground font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <Link href="/admin/courses/new">
                        <Plus className="mr-2 h-4 w-4" /> Add Course
                    </Link>
                </Button>
            </div>

            <div className="border-4 border-foreground rounded-lg overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-background">
                <Table>
                    <TableHeader className="bg-secondary/50 border-b-4 border-foreground">
                        <TableRow>
                            <TableHead className="font-black text-foreground">Title</TableHead>
                            <TableHead className="font-black text-foreground">Category</TableHead>
                            <TableHead className="font-black text-foreground">Level</TableHead>
                            <TableHead className="font-black text-foreground">Students</TableHead>
                            <TableHead className="font-black text-foreground">Status</TableHead>
                            <TableHead className="text-right font-black text-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses?.map((course) => (
                            <TableRow key={course.id} className="font-medium border-b-2 border-slate-100 last:border-0 hover:bg-slate-50">
                                <TableCell>{course.title}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-2 border-foreground font-bold">
                                        {course.category}
                                    </Badge>
                                </TableCell>
                                <TableCell>{course.level}</TableCell>
                                <TableCell>{course.total_students || 0}</TableCell>
                                <TableCell>
                                    {/* Mock status based on field potentially? Or add status to schema later. Using published flag if exists (not in printed schema but common) */}
                                    <Badge className="bg-green-600 border-2 border-foreground text-white font-bold">Published</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:bg-primary/20 hover:text-primary">
                                            <Link href={`/admin/courses/${course.id}`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!courses || courses.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No courses found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
