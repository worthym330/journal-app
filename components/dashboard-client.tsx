"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { EntryPreviewModal } from "@/components/entry-preview-modal"
import { BookOpen, Plus, Search, Calendar, Tag, Download, LogOut, Edit, Trash2, Eye, ImageIcon } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import Image from "next/image"

interface JournalEntry {
  _id: string
  title: string
  content: string
  image?: string
  tags: string[]
  customFields: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface DashboardClientProps {
  entries: JournalEntry[]
  totalEntries: number
  thisWeekEntries: number
  user: {
    name?: string | null
    email?: string | null
  }
}

export function DashboardClient({
  entries: initialEntries,
  totalEntries,
  thisWeekEntries,
  user,
}: DashboardClientProps) {
  const [entries, setEntries] = useState(initialEntries)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [previewEntry, setPreviewEntry] = useState<JournalEntry | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (selectedTag) params.append("tag", selectedTag)

      const response = await fetch(`/api/entries?${params}`)
      const data = await response.json()

      if (response.ok) {
        setEntries(data.entries)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search entries",
        variant: "destructive",
      })
    }
  }

  const handlePreview = (entry: JournalEntry) => {
    setPreviewEntry(entry)
    setIsPreviewOpen(true)
  }

  const handleDelete = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) {
      return
    }

    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEntries(entries.filter((entry) => entry._id !== entryId))
        toast({
          title: "Success",
          description: "Entry deleted successfully",
        })
      } else {
        throw new Error("Failed to delete entry")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      })
    }
  }

  const handleExport = async (format: "json" | "markdown") => {
    try {
      const response = await fetch(`/api/entries/export?format=${format}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `journal-entries.${format === "json" ? "json" : "md"}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: `Entries exported as ${format.toUpperCase()}`,
        })
      } else {
        throw new Error("Failed to export entries")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export entries",
        variant: "destructive",
      })
    }
  }

  const allTags = Array.from(new Set(entries.flatMap((entry) => entry.tags)))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Journal</h1>
                <p className="text-gray-600">Welcome back, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => handleExport("json")} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button onClick={() => handleExport("markdown")} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export MD
              </Button>
              <Button onClick={() => signOut()} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisWeekEntries}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/dashboard/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Entry
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                >
                  <option value="">All Tags</option>
                  {allTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entries */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Entries</h2>
            <Button asChild>
              <Link href="/dashboard/new">
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Link>
            </Button>
          </div>

          {entries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No entries yet</h3>
                <p className="text-gray-600 mb-4">Start your journaling journey by creating your first entry.</p>
                <Button asChild>
                  <Link href="/dashboard/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Entry
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {entries.map((entry) => (
                <Card key={entry._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 flex items-center gap-2">
                          {entry.title}
                          {entry.image && <ImageIcon className="h-4 w-4 text-gray-500" />}
                        </CardTitle>
                        <CardDescription>{format(new Date(entry.createdAt), "PPP")}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handlePreview(entry)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/entry/${entry._id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(entry._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      {entry.image && (
                        <div className="flex-shrink-0">
                          <Image
                            src={entry.image || "/placeholder.svg"}
                            alt="Entry image"
                            width={120}
                            height={80}
                            className="rounded-md object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-gray-700 mb-4 line-clamp-3">{entry.content.substring(0, 200)}...</p>

                        {entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {entry.tags.map((tag) => (
                              <Badge key={tag} variant="secondary">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {Object.keys(entry.customFields).length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Custom Fields:</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {Object.entries(entry.customFields).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="font-medium text-gray-600">{key}:</span>{" "}
                                  <span className="text-gray-800">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <EntryPreviewModal entry={previewEntry} isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
    </div>
  )
}
