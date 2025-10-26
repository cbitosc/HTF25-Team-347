"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, MoreHorizontal, Edit2, Trash2 } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth/AuthContext"
import { getUsers } from "@/lib/supabase/operations"
import { toast } from 'sonner'

export default function ManageUsersPage() {
  const router = useRouter()
  const { userRole, loading } = useAuth()
  const [showDialog, setShowDialog] = useState(false)
  const [dialogAction, setDialogAction] = useState<"add" | "edit" | "delete" | null>(null)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [newUserForm, setNewUserForm] = useState({ name: "", email: "", role: "citizen" })
  const [users, setUsers] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && userRole !== "admin") {
      router.push("/dashboard")
    }
  }, [userRole, loading, router])

  useEffect(() => {
    if (userRole === "admin") {
      fetchUsers()
    }
  }, [userRole])

  const fetchUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setDataLoading(false)
    }
  }

  if (loading || userRole !== "admin") {
    return null
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "collector":
        return "bg-green-100 text-green-800"
      case "ngo":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddUser = () => {
    if (dialogAction === "add") {
      const newUser = {
        id: `U${String(users.length + 1).padStart(3, "0")}`,
        name: newUserForm.name,
        email: newUserForm.email,
        role: newUserForm.role,
        dateJoined: new Date().toISOString().split("T")[0],
      }
      setUsers([...users, newUser])
    } else if (dialogAction === "edit" && selectedUser) {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? { ...u, name: newUserForm.name, email: newUserForm.email, role: newUserForm.role }
            : u,
        ),
      )
    }
    setNewUserForm({ name: "", email: "", role: "citizen" })
    setShowDialog(false)
  }

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id))
    }
    setShowDialog(false)
  }

  const handleUserAction = (user: (typeof users)[0], action: "edit" | "delete") => {
    setSelectedUser(user)
    setDialogAction(action === "edit" ? "edit" : "delete")
    if (action === "edit") {
      setNewUserForm({ name: user.name, email: user.email, role: user.role })
    }
    setShowDialog(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn userRole="admin" />
      <div className="flex">
        <Sidebar userRole="admin" />

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pt-20 md:pt-0">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold mb-2">Manage Users</h1>
              <p className="text-muted-foreground">Add, edit, or remove users from the system.</p>
            </motion.div>

            {/* Add New User Button */}
            <div className="mb-6 flex justify-end">
              <Button
                onClick={() => {
                  setDialogAction("add")
                  setNewUserForm({ name: "", email: "", role: "citizen" })
                  setShowDialog(true)
                }}
                className="btn-hover"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New User
              </Button>
            </div>

            {/* Users Table Card */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date Joined</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user, idx) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <TableCell className="font-medium font-mono text-sm">{user.id?.substring(0, 8)}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">
                              View Only
                            </Badge>
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </main>
      </div>

      {/* User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "add" ? "Add New User" : dialogAction === "edit" ? "Edit User" : "Delete User"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "add"
                ? "Create a new user account"
                : dialogAction === "edit"
                  ? `Edit user ${selectedUser?.name}`
                  : `Delete user ${selectedUser?.name}?`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {(dialogAction === "add" || dialogAction === "edit") && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Full Name</label>
                  <Input
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="Email address"
                    type="email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Role</label>
                  <Select
                    value={newUserForm.role}
                    onValueChange={(value) => setNewUserForm({ ...newUserForm, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="citizen">Citizen</SelectItem>
                      <SelectItem value="collector">Collector</SelectItem>
                      <SelectItem value="ngo">NGO</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {dialogAction === "delete" && (
              <div className="bg-destructive/10 p-4 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1 btn-hover bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={dialogAction === "delete" ? handleDeleteUser : handleAddUser}
                className="flex-1 btn-hover"
                variant={dialogAction === "delete" ? "destructive" : "default"}
              >
                {dialogAction === "add" ? "Add User" : dialogAction === "edit" ? "Save Changes" : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
