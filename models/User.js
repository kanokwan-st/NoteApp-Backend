import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt'

// Create MongoDB document schema (สร้างแปลน)
const UserSchema = new Schema({
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  createdOn: { type: Date, default: new Date().getTime() },
});

// Hash password before saving 
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10)
  next();
});


// User Schema to create model (เอาแปลนมาสร้าง model)
// Mongoose will automatically name our collection as users ("User" to "users")
export const User = model("User", UserSchema);
