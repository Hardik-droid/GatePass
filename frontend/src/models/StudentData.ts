import mongoose from "mongoose";

const StudentDataSchema = new mongoose.Schema(
  {
    fName: String,
    lName: String,
    email: String,
    password: String,
    userType: String,
    hName: String,
    rNo: Number,
    mode: String,
    pov: String,
    time: Date,
    Status: String,
  },
  {
    timestamps: true,
    collection: "studentdatas",
  },
);

export default mongoose.models.StudentData ||
  mongoose.model("StudentData", StudentDataSchema);
