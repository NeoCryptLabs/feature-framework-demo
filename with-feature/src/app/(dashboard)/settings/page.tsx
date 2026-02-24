import { redirect } from "next/navigation"
import { getAuth } from "@/lib/auth"
import { getUsers } from "@/actions/settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/settings/profile-form"
import { UsersTable } from "@/components/settings/users-table"

export default async function SettingsPage() {
  const session = await getAuth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const users = await getUsers()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and users.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <ProfileForm
            user={{
              name: session.user.name ?? "",
              email: session.user.email ?? "",
            }}
          />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UsersTable users={users} currentUserId={session.user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
