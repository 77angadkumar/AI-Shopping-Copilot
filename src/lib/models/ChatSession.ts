import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  productsRetrieved?: mongoose.Types.ObjectId[] | string[];
}

export interface IChatSession extends Document {
  sessionId: string;
  userId: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  productsRetrieved: [{ type: Schema.Types.ObjectId, ref: "Product" }],
});

const ChatSessionSchema: Schema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, default: "anonymous" },
    messages: [MessageSchema],
  },
  { timestamps: true }
);

export default mongoose.models.ChatSession || mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);
