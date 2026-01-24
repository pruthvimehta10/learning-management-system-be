import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MoreHorizontal } from 'lucide-react'

export default async function AdminUsersPage() {
    const supabase = await createClient()

    const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-foreground">Users</h2>
                    <p className="text-muted-foreground font-bold">
                        Manage student accounts and permissions.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search users..."
                        className="pl-8 border-2 border-foreground"
                    />
                </div>
                <Button variant="outline" className="border-2 border-foreground font-bold">Export CSV</Button>
            </div>

            <div className="border-4 border-foreground rounded-lg overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-background">
                <Table>
                    <TableHeader className="bg-secondary/50 border-b-4 border-foreground">
                        <TableRow>
                            <TableHead className="font-black text-foreground">User</TableHead>
                            <TableHead className="font-black text-foreground">Email</TableHead>
                            <TableHead className="font-black text-foreground">Role</TableHead>
                            <TableHead className="font-black text-foreground">Joined</TableHead>
                            <TableHead className="text-right font-black text-foreground"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user) => (
                            <TableRow key={user.id} className="font-medium border-b-2 border-slate-100 last:border-0 hover:bg-slate-50">
                                <TableCell className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8 border-2 border-foreground">
                                        <AvatarImage src={user.avatar_url} />
                                        <AvatarFallback className="font-bold bg-primary text-primary-foreground">
                                            {user.full_name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-bold text-foreground">{user.full_name || 'Unknown'}</span>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-2 border-foreground font-bold bg-muted">
                                        Student
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!users || users.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
