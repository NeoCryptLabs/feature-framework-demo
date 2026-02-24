"use client"

import { useActionState } from "react"
import { updateProfile, changePassword } from "@/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ProfileFormProps {
  user: { name: string; email: string }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [profileState, profileAction, profilePending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      return updateProfile(formData)
    },
    null
  )

  const [passwordState, passwordAction, passwordPending] = useActionState(
    async (_prev: { error?: string; success?: string } | null, formData: FormData) => {
      return changePassword(formData)
    },
    null
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your name and email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={profileAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={user.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
              />
            </div>
            {profileState?.error && (
              <p className="text-sm text-destructive">{profileState.error}</p>
            )}
            {profileState?.success && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {profileState.success}
              </p>
            )}
            <Button type="submit" disabled={profilePending}>
              {profilePending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password. You must provide your current password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
              />
            </div>
            {passwordState?.error && (
              <p className="text-sm text-destructive">{passwordState.error}</p>
            )}
            {passwordState?.success && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {passwordState.success}
              </p>
            )}
            <Button type="submit" disabled={passwordPending}>
              {passwordPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
