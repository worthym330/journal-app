import mongoose from "mongoose"

const JournalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    tags: [
      {
        type: String,
      },
    ],
    customFields: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
JournalEntrySchema.index({ userId: 1, createdAt: -1 })
JournalEntrySchema.index({ userId: 1, tags: 1 })

export const JournalEntry = mongoose.models.JournalEntry || mongoose.model("JournalEntry", JournalEntrySchema)
