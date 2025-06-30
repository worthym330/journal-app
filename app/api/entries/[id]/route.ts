import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { JournalEntry } from "@/lib/models/JournalEntry"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const entry = await JournalEntry.findOne({
      _id: params.id,
      userId: session.user.id,
    }).lean()

    if (!entry) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 })
    }

    const serializedEntry = {
      ...entry,
      _id: entry._id.toString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedEntry)
  } catch (error) {
    console.error("Get entry error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const entry = await JournalEntry.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      {
        title,
        content,
        tags: tags || [],
        customFields: customFields || {},
        image: image || null,
        updatedAt: new Date(),
      },
      { new: true },
    ).lean()

    if (!entry) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 })
    }

    const serializedEntry = {
      ...entry,
      _id: entry._id.toString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }

    return NextResponse.json(serializedEntry)
  } catch (error) {
    console.error("Update entry error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const entry = await JournalEntry.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    })

    if (!entry) {
      return NextResponse.json({ message: "Entry not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Entry deleted successfully" })
  } catch (error) {
    console.error("Delete entry error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
