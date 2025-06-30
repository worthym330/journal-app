"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Tag, Calendar, ImageIcon } from "lucide-react"
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

interface EntryPreviewModalProps {
  entry: JournalEntry | null
  isOpen: boolean
  onClose: () => void
}

export function EntryPreviewModal({ entry, isOpen, onClose }: EntryPreviewModalProps) {
  if (!entry) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-2">{entry.title}</DialogTitle>
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(entry.createdAt), "PPP")}
                  </div>
                  {entry.updatedAt !== entry.createdAt && (
                    <div className="text-xs text-gray-500">Updated: {format(new Date(entry.updatedAt), "PPP")}</div>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Image */}
              {entry.image && (
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-gray-700">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Image
                  </div>
                  <div className="relative w-full max-w-2xl mx-auto">
                    <Image
                      src={entry.image || "/placeholder.svg"}
                      alt="Journal entry image"
                      width={800}
                      height={600}
                      className="rounded-lg object-cover w-full h-auto"
                      priority
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Content</h3>
                <div className="prose prose-gray max-w-none">
                  <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">{entry.content}</div>
                </div>
              </div>

              {/* Tags */}
              {entry.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Fields */}
              {Object.keys(entry.customFields).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Custom Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(entry.customFields).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-600">{key}</div>
                        <div className="text-gray-900">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
