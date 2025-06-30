import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { JournalEntry } from "@/lib/models/JournalEntry"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  await connectToDatabase()

  const entries = await JournalEntry.find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(10).lean()

  const serializedEntries = entries.map((entry) => ({
    ...entry,
    _id: entry._id.toString(),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }))

  const totalEntries = await JournalEntry.countDocuments({ userId: session.user.id })
  const thisWeekEntries = await JournalEntry.countDocuments({
    userId: session.user.id,
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  })

  return (
    <DashboardClient
      entries={serializedEntries}
      totalEntries={totalEntries}
      thisWeekEntries={thisWeekEntries}
      user={session.user}
    />
  )
}
