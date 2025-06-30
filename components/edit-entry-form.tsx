"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/image-upload"
import { useToast } from "@/hooks/use-toast"
import { Plus, X, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

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

interface EditEntryFormProps {
  entry: JournalEntry
}

export function EditEntryForm({ entry }: EditEntryFormProps) {
  const [title, setTitle] = useState(entry.title)
  const [content, setContent] = useState(entry.content)
  const [image, setImage] = useState(entry.image || "")
  const [tags, setTags] = useState<string[]>(entry.tags)
  const [newTag, setNewTag] = useState("")
  const [customFields, setCustomFields] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(entry.customFields).map(([key, value]) => [key, String(value)])),
  )
  const [newFieldKey, setNewFieldKey] = useState("")
  const [newFieldValue, setNewFieldValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const addCustomField = () => {
    if (newFieldKey.trim() && newFieldValue.trim()) {
      setCustomFields({
        ...customFields,
        [newFieldKey.trim()]: newFieldValue.trim(),
      })
      setNewFieldKey("")
      setNewFieldValue("")
    }
  }

  const removeCustomField = (keyToRemove: string) => {
    const updatedFields = { ...customFields }
    delete updatedFields[keyToRemove]
    setCustomFields(updatedFields)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Title and content are required.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/entries/${entry._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          image: image || null,
          tags,
          customFields,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Entry updated successfully!",
        })
        router.push("/dashboard")
      } else {
        const data = await response.json()
        throw new Error(data.message || "Failed to update entry")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update the essential details for your journal entry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for your entry..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your thoughts here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Image</CardTitle>
            <CardDescription>Add or update the image for your journal entry</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload value={image} onChange={setImage} onRemove={() => setImage("")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Add tags to organize and categorize your entry</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Fields</CardTitle>
            <CardDescription>Add custom fields like mood, weather, gratitude, or anything else</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Field name (e.g., Mood)"
                value={newFieldKey}
                onChange={(e) => setNewFieldKey(e.target.value)}
              />
              <Input
                placeholder="Field value (e.g., Happy)"
                value={newFieldValue}
                onChange={(e) => setNewFieldValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomField())}
              />
              <Button type="button" onClick={addCustomField} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
            {Object.keys(customFields).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Custom Fields:</h4>
                <div className="grid gap-2">
                  {Object.entries(customFields).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        <strong>{key}:</strong> {value}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCustomField(key)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              "Updating..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Entry
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
