import mongoose from "mongoose";
import { CreateUserInput } from "../schemas/user.schema";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

export const privateFields = [
  "password",
  "passwordResetCode",
  "verificationCode",
  "__v",
];

type TUser = Omit<
  CreateUserInput["body"] & {
    role: "user" | "admin";
    verified: boolean;
    verificationCode: string | null;
    passwordResetCode: string | null;
    profilePicture: string;
    createdAt: Date;
    updatedAt: Date;
  },
  "passwordConfirmation"
>;

type TUserMethods = {
  comparePasswords: (
    candidatePassword: string,
    hashedPassword: string
  ) => Promise<boolean>;
};

type TUserModel = mongoose.Model<TUser, {}, TUserMethods>;

const userSchema = new mongoose.Schema<TUser, TUserModel, TUserMethods>(
  {
    name: String,
    email: {
      type: String,
      unique: true,
    },
    password: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profilePicture: String,
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: () => uuid(),
    },
    passwordResetCode: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePasswords = async function (
  candidatePassword: string,
  hashedPassword: string
): Promise<boolean> {
  const valid = await bcrypt.compare(candidatePassword, hashedPassword);
  return valid;
};

const User = mongoose.model<TUser, TUserModel>("User", userSchema);

export default User;
