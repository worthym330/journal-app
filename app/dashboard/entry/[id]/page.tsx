import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { JournalEntry } from "@/lib/models/JournalEntry"
import { EditEntryForm } from "@/components/edit-entry-form"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EntryPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  await connectToDatabase()

  const entry = await JournalEntry.findOne({
    _id: params.id,
    userId: session.user.id,
  }).lean()

  if (!entry) {
    notFound()
  }

  const serializedEntry = {
    ...entry,
    _id: entry._id.toString(),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Entry</h1>
            <p className="text-gray-600 mt-2">Update your journal entry</p>
          </div>
          <EditEntryForm entry={serializedEntry} />
        </div>
      </div>
    </div>
  )
}
