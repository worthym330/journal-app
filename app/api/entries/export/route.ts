import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { JournalEntry } from "@/lib/models/JournalEntry"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"

    await connectToDatabase()

    const entries = await JournalEntry.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean()

    if (format === "json") {
      const serializedEntries = entries.map((entry) => ({
        ...entry,
        _id: entry._id.toString(),
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      }))

      return new NextResponse(JSON.stringify(serializedEntries, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="journal-entries.json"',
        },
      })
    } else if (format === "markdown") {
      let markdown = "# My Journal Entries\n\n"

      entries.forEach((entry) => {
        markdown += `## ${entry.title}\n\n`
        markdown += `**Date:** ${entry.createdAt.toDateString()}\n\n`

        if (entry.tags && entry.tags.length > 0) {
          markdown += `**Tags:** ${entry.tags.join(", ")}\n\n`
        }

        if (entry.customFields && Object.keys(entry.customFields).length > 0) {
          markdown += `**Custom Fields:**\n`
          Object.entries(entry.customFields).forEach(([key, value]) => {
            markdown += `- ${key}: ${value}\n`
          })
          markdown += "\n"
        }

        markdown += `${entry.content}\n\n---\n\n`
      })

      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": 'attachment; filename="journal-entries.md"',
        },
      })
    }

    return NextResponse.json({ message: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("Export entries error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
