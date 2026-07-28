import mongoose, { Schema, model, models } from "mongoose";

const experienceSchema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: String,
  current: { type: Boolean, default: false },
  description: String,
});

const educationSchema = new Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: String,
});

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: String,
    headline: String,
    location: String,
    skills: [String],
    experience: [experienceSchema],
    education: [educationSchema],
    profilePhoto: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = models.User || model("User", userSchema);
export default User;
