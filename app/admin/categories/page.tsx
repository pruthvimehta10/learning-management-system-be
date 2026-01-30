'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Folder, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Category {
    id: string
    name: string
    description: string
    slug: string
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const { toast } = useToast()

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    async function fetchCategories() {
        try {
            setLoading(true)
            const res = await fetch('/api/categories')
            if (!res.ok) throw new Error('Failed to fetch categories')
            const data = await res.json()
            setCategories(data)
        } catch (error) {
            console.error(error)
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load categories'
            })
        } finally {
            setLoading(false)
        }
    }

    function handleOpenDialog(category?: Category) {
        if (category) {
            setEditingCategory(category)
            setFormData({
                name: category.name,
                description: category.description || ''
            })
        } else {
            setEditingCategory(null)
            setFormData({ name: '', description: '' })
        }
        setIsDialogOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
            const method = editingCategory ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to save category')
            }

            toast({
                title: 'Success',
                description: `Category ${editingCategory ? 'updated' : 'created'} successfully`
            })

            setIsDialogOpen(false)
            fetchCategories()
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message
            })
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this category?')) return

        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete category')

            toast({
                title: 'Success',
                description: 'Category deleted successfully'
            })
            fetchCategories()
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message
            })
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-foreground">Categories</h1>
                    <p className="text-xl text-muted-foreground mt-2">
                        Manage course categories and groupings
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="font-bold gap-2">
                    <Plus className="h-4 w-4" /> Add New Category
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-card border-4 border-dashed border-border rounded-3xl">
                        <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-bold mb-2">No Categories Found</h3>
                        <p className="text-muted-foreground mb-4">Create your first category to get started</p>
                        <Button onClick={() => handleOpenDialog()} variant="outline" className="font-bold">
                            Create Category
                        </Button>
                    </div>
                ) : (
                    categories.map((category) => (
                        <div key={category.id} className="group relative bg-card border-4 border-border rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-100 rounded-2xl">
                                    <Folder className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(category)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(category.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-1">{category.name}</h3>
                            <code className="text-xs font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground">
                                slug: {category.slug}
                            </code>

                            {category.description && (
                                <p className="mt-4 text-muted-foreground line-clamp-2">
                                    {category.description}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] border-4 border-foreground shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">
                            {editingCategory ? 'Edit Category' : 'Create New Category'}
                        </DialogTitle>
                        <DialogDescription>
                            Organize courses into logical groups.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="font-bold">Category Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Web Development"
                                className="font-medium border-2 focus-visible:ring-offset-0"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description" className="font-bold">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description..."
                                className="font-medium border-2 focus-visible:ring-offset-0 resize-none"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="w-full font-bold h-12 text-lg">
                                {editingCategory ? 'Save Changes' : 'Create Category'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
