import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentData",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      index: true,
    },

    rNo: Number,
    hName: String,

    eventId: {
      type: String,
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "used", "expired", "cancelled"],
      default: "active",
      index: true,
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    usedAt: Date,
    usedByScanner: String,

    scanCount: {
      type: Number,
      default: 0,
    },

    paymentId: String,
    purchaseId: String,
  },
  {
    timestamps: true,
    collection: "tickets",
  },
);

export default mongoose.models.Ticket ||
  mongoose.model("Ticket", TicketSchema);
