'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Monitor } from 'lucide-react'
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

interface Lab {
    id: string
    name: string
    code: string
    description: string
    created_at: string
}

export default function LabsPage() {
    const [labs, setLabs] = useState<Lab[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingLab, setEditingLab] = useState<Lab | null>(null)
    const { toast } = useToast()

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: ''
    })

    useEffect(() => {
        fetchLabs()
    }, [])

    async function fetchLabs() {
        try {
            setLoading(true)
            const res = await fetch('/api/labs')
            if (!res.ok) throw new Error('Failed to fetch labs')
            const data = await res.json()
            setLabs(data)
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load labs'
            })
        } finally {
            setLoading(false)
        }
    }

    function handleOpenDialog(lab?: Lab) {
        if (lab) {
            setEditingLab(lab)
            setFormData({
                name: lab.name,
                code: lab.code,
                description: lab.description || ''
            })
        } else {
            setEditingLab(null)
            setFormData({ name: '', code: '', description: '' })
        }
        setIsDialogOpen(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        try {
            const url = editingLab ? `/api/labs/${editingLab.id}` : '/api/labs'
            const method = editingLab ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to save lab')
            }

            toast({
                title: 'Success',
                description: `Lab ${editingLab ? 'updated' : 'created'} successfully`
            })

            setIsDialogOpen(false)
            fetchLabs()
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message
            })
        }
    }



    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this lab?')) return

        try {
            const res = await fetch(`/api/labs/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete lab')

            toast({
                title: 'Success',
                description: 'Lab deleted successfully'
            })
            fetchLabs()
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
                    <h1 className="text-4xl font-black text-foreground">Labs</h1>
                    <p className="text-xl text-muted-foreground mt-2">
                        Manage physical labs and learning centers
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="font-bold gap-2">
                    <Plus className="h-4 w-4" /> Add New Lab
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">Loading labs...</div>
                ) : labs.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-card border-4 border-dashed border-border rounded-3xl">
                        <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-bold mb-2">No Labs Found</h3>
                        <p className="text-muted-foreground mb-4">Create your first lab to get started</p>
                        <Button onClick={() => handleOpenDialog()} variant="outline" className="font-bold">
                            Create Lab
                        </Button>
                    </div>
                ) : (
                    labs.map((lab) => (
                        <div key={lab.id} className="group relative bg-card border-4 border-border rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <Monitor className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(lab)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(lab.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-1">{lab.name}</h3>
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground">
                                ID: {lab.code}
                            </code>

                            {lab.description && (
                                <p className="mt-4 text-muted-foreground line-clamp-2">
                                    {lab.description}
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
                            {editingLab ? 'Edit Lab' : 'Create New Lab'}
                        </DialogTitle>
                        <DialogDescription>
                            Details about the physical lab location.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="font-bold">Lab Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Computer Lab 1"
                                className="font-medium border-2 focus-visible:ring-offset-0"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="code" className="font-bold">Lab ID / Code</Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g. LAB-001"
                                className="font-medium border-2 focus-visible:ring-offset-0"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                This ID will be used to map devices to this lab.
                            </p>
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
                                {editingLab ? 'Save Changes' : 'Create Lab'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
