import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    uId: {
      type: String,
      required: true,
      unique: true
    },
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;
