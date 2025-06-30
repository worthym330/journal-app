import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { NewEntryForm } from "@/components/new-entry-form"

export default async function NewEntryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">New Journal Entry</h1>
            <p className="text-gray-600 mt-2">Capture your thoughts and memories</p>
          </div>
          <NewEntryForm />
        </div>
      </div>
    </div>
  )
}
