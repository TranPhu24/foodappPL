import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    actorName: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
      uppercase: true,
    },

    resourceType: {
      type: String,
      required: true,
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    ipAddress: String,
    userAgent: String,

    status: {
      type: String,
      enum: ["SUCCESS", "FAILURE"],
      default: "SUCCESS",
    },
  },
  {
    collection: "audit_logs",
    timestamps: false,
  }
);

export default mongoose.model("AuditLog", auditLogSchema);
