import mongoose from "mongoose";

const subjectStatusSchema = new mongoose.Schema(
  {
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  { _id: false }
);

const difficultySchema = new mongoose.Schema({
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  date: { type: Date, default: Date.now },
  totalQuestions: { type: Number, required: true },
  notAttempted : { type: Number, required: true },
  correct: { type: Number, required: true },
  wrong: { type: Number, required: true },
  score: { type: Number, required: true },
  accuracy: { type: Number, required: true, min: 0, max: 100 },
  timeTaken: { type: Number, required: true },

 subjectStatus: {
  type: Map,
  of: new mongoose.Schema({
    correct: Number,
    wrong: Number,
    notAttempted: Number,
    total: Number
  }, { _id: false })
},

  difficultyStatus: {
    Easy: { type: difficultySchema, default: () => ({}) },
    Medium: { type: difficultySchema, default: () => ({}) },
    Hard: { type: difficultySchema, default: () => ({}) }
  }
});

export default mongoose.model("QuizAttempt",quizAttemptSchema);