"use client"

import { useTransition } from "react"
import { updateUserRole } from "@/actions/settings"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
}

interface UsersTableProps {
  users: User[]
  currentUserId: string
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const [isPending, startTransition] = useTransition()

  function handleRoleChange(userId: string, role: string) {
    startTransition(async () => {
      await updateUserRole(userId, role)
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={user.role === "ADMIN" ? "default" : "secondary"}
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                {user.id === currentUserId ? (
                  <span className="text-sm text-muted-foreground">
                    Current user
                  </span>
                ) : (
                  <Select
                    defaultValue={user.role}
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
