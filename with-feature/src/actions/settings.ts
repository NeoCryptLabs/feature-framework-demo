"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { getAuth } from "@/lib/auth"

export async function updateProfile(formData: FormData) {
  const session = await getAuth()
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  const name = formData.get("name") as string
  const email = formData.get("email") as string

  if (!name || !email) {
    return { error: "Name and email are required" }
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing && existing.id !== session.user.id) {
    return { error: "Email already in use" }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { name, email },
  })

  revalidatePath("/settings")
  return { success: "Profile updated" }
}

export async function changePassword(formData: FormData) {
  const session = await getAuth()
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } })
  if (!user) {
    return { error: "User not found" }
  }

  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) {
    return { error: "Current password is incorrect" }
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await db.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  })

  return { success: "Password changed" }
}

export async function getUsers() {
  const session = await getAuth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return []
  }

  return db.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })
}

export async function updateUserRole(userId: string, role: string) {
  const session = await getAuth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  if (userId === session.user.id) {
    return { error: "Cannot change your own role" }
  }

  if (role !== "ADMIN" && role !== "VIEWER") {
    return { error: "Invalid role" }
  }

  const targetUser = await db.user.findUnique({ where: { id: userId } })
  if (!targetUser) {
    return { error: "User not found" }
  }

  await db.user.update({
    where: { id: userId },
    data: { role },
  })

  revalidatePath("/settings")
  return { success: "Role updated" }
}
