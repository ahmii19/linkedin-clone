import mongoose, { Schema, model, models } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "connection_request",
        "connection_accepted",
        "new_comment",
        "new_like",
      ],
      required: true,
    },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification =
  models.Notification || model("Notification", notificationSchema);
export default Notification;
