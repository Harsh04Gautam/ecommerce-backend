import mongoose from "mongoose";

type TSession = {
  userId: mongoose.Schema.Types.ObjectId;
  valid: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const sessionSchema = new mongoose.Schema<TSession>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    valid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ userId: 1 });

const Session = mongoose.model<TSession>("Session", sessionSchema);

export default Session;
