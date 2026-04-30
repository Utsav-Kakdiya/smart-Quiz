import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String,
  subject: String,
  difficulty: String,
});

export default mongoose.model("Question", questionSchema);
