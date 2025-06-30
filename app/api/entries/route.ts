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
    const search = searchParams.get("search")
    const tag = searchParams.get("tag")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    await connectToDatabase()

    const query: any = { userId: session.user.id }

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }]
    }

    if (tag) {
      query.tags = { $in: [tag] }
    }

    const entries = await JournalEntry.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await JournalEntry.countDocuments(query)

    const serializedEntries = entries.map((entry) => ({
      ...entry,
      _id: entry._id.toString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      entries: serializedEntries,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Get entries error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, content, tags, customFields, image } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ message: "Title and content are required" }, { status: 400 })
    }

    await connectToDatabase()

    const entry = await JournalEntry.create({
      userId: session.user.id,
      title,
      content,
      tags: tags || [],
      customFields: customFields || {},
      image: image || null,
    })

    const serializedEntry = {
      ...entry.toObject(),
      _id: entry._id.toString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedEntry, { status: 201 })
  } catch (error) {
    console.error("Create entry error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
