import mongoose from "mongoose";
import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import User from "./models/users.js";
import Question from "./models/Question.js";
import QuizAttempt from "./models/quizAttemps.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Temporary OTP storage (in-memory)
const otpStore = new Map();

await mongoose.connect(process.env.MONGO_URL);
console.log("MongoDB connected");

// Sign Up the User
app.post("/register", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // Check whether the user already registerd or not.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists. Please login.",
      });
    }

    // Convert the normal password into the hashedpassword for security
    const hashedPassword = await bcrypt.hash(password, 10);

    const otp_code = Math.floor(100000 + Math.random() * 999999);
    otpStore.set(email, {
      otp: otp_code,
      expires: Date.now() + 10 * 60 * 1000,
      userData: {
        name,
        phone,
        email,
        password: hashedPassword,
      },
    }); // 10 min expiry

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.HOST_EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.HOST_EMAIL,
      to: email,
      subject: "Your Smart Quiz OTP Verification Code",
      text: `Hello,

      Thank you for signing up with Smart Quiz 🎯

      To complete your verification, please use the One-Time Password (OTP) below:

      🔐 Your OTP Code: ${otp_code}

      This OTP is valid for the next 10 minutes.
      For security reasons, please do not share this code with anyone.

      If you did not request this verification, you can safely ignore this email.

      Happy learning and best of luck with your quizzes! 🚀

      Warm regards,
      Smart Quiz Team
      Smart Quiz – Learn • Practice • Succeed`,
    };

    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: "Failed to send OTP",
        });
      } else {
        res.json({
          success: true,
          message: "OTP sent to email",
        });
      }
    });
  } catch (error) {
    res.status(500).send("Error in saving user ");
  }
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore.has(email)) {
    return res.json({ success: false, message: "OTP not found or expired" });
  }

  const record = otpStore.get(email);

  if (record.expires < Date.now()) {
    otpStore.delete(email);
    return res.json({ success: false, message: "OTP expired" });
  }

  if (record.otp != otp) {
    return res.json({ success: false, message: "Invalid OTP" });
  }

  const newUser = new User({
    ...record.userData,
    isVerified: false,
  });

  await newUser.save();

  // OTP is valid, remove from store
  otpStore.delete(email);

  // Update user verified status
  User.findOneAndUpdate({ email }, { isVerified: true })
    .then(() =>
      res.json({ success: true, message: "Account verified successfully" }),
    )
    .catch((err) =>
      res.status(500).json({ success: false, message: "Server error" }),
    );
});

// Log In the User

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const ifUserPresent = await User.findOne({ name: username });
    if (!ifUserPresent) {
      res.json({
        success: false,
        message: "User not found. Please Sign Up.",
      });
    }

    const ifPasswordMatched = await bcrypt.compare(
      password,
      ifUserPresent.password,
    );
    if (!ifPasswordMatched) {
      res.json({
        success: false,
        message: "Incorrect Password.",
      });
    }

    res.json({
      success: true,
      message: "User Successfully Logged In.",
      userId: ifUserPresent._id,
      userName: ifUserPresent.name,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

app.listen(process.env.PORT, function () {
  console.log("app.js is listening.");
});

// Send questions
app.post("/start_quiz", async (req, res) => {
  try {
    const { subjects, level, questionCount } = req.body;

    let finalCount = 0;

    if (questionCount === "30+") {
      finalCount = 40;
    } else {
      finalCount = Number(questionCount);
    }

    let finalQuestions = [];

    if (subjects.length > 1) {
      const subjectCount = subjects.length;
      const baseCount = Math.floor(finalCount / subjectCount);
      const extraCount = finalCount % subjectCount;

      for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];

        // Give +1 question to first `extraCount` subjects
        let totalQuestions = baseCount + (i < extraCount ? 1 : 0);

        const questionsPerSubject = await Question.aggregate([
          { $match: { subject, difficulty: level } },
          { $sample: { size: Number(totalQuestions) } },
        ]);

        finalQuestions.push(...questionsPerSubject);
      }
    } else {
      const subject = subjects[0];

      finalQuestions = await Question.aggregate([
        { $match: { subject, difficulty: level } },
        { $sample: { size: finalCount } },
      ]);
    }
    finalQuestions.sort(() => Math.random() - 0.5);

    res.json({ questions: finalQuestions });
  } catch (err) {
    res.status(500).json({ error: "Failed to start quiz" });
  }
});

app.post("/submit_quiz", async (req, res) => {
  try {
    const {
      userEmail,
      date,
      totalQuestions,
      notAttempted,
      correct,
      wrong,
      score,
      accuracy,
      timeTaken,
      subjectStatus,
      difficultyStatus,
    } = req.body;

    const newQuizSubmit = new QuizAttempt({
      userEmail,
      date,
      totalQuestions,
      notAttempted,
      correct,
      wrong,
      score,
      accuracy,
      timeTaken,
      subjectStatus,
      difficultyStatus,
    });

    await newQuizSubmit.save();

    res.status(201).json({
      success: true,
      message: "Quiz submitted successfully!!",
    });
  } catch (error) {
    console.log("Failed to submit quiz!!" + error);
    res.status(500).json({
      success: false,
      message: "Error in submitting the quiz!!",
    });
  }
});

app.get("/analytics-dashboard/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const totalSessions = await QuizAttempt.countDocuments({
      userEmail: email,
    });

    const stats = await QuizAttempt.aggregate([
      {
        $match: { userEmail: email },
      },
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: "$totalQuestions" },
          totalCorrect: { $sum: "$correct" },
          totalWrong: { $sum: "$wrong" },
          totalNotAttempted: { $sum: "$notAttempted" },
          totalTimeTaken: { $sum: "$timeTaken" },
        },
      },
    ]);

    const result =
      stats.length > 0
        ? stats[0]
        : {
            totalQuestions: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalNotAttempted: 0,
            totalTimeTaken: 0,
          };

    const attempts = await QuizAttempt.find(
      { userEmail: email },
      { subjectStatus: 1 },
    );

    let mergedSubjects = {};

    attempts.forEach((attempt) => {
      const subjectStatus = attempt.subjectStatus;

      if (!subjectStatus || !(subjectStatus instanceof Map)) return;

      subjectStatus.forEach((value, subject) => {
        if (!mergedSubjects[subject]) {
          mergedSubjects[subject] = { correct: 0, total: 0 };
        }

        mergedSubjects[subject].correct += value.correct || 0;
        mergedSubjects[subject].total += value.total || 0;
      });
    });

    let mergedDifficulty = {};

    const difficultyAttempts = await QuizAttempt.find(
      { userEmail: email },
      { difficultyStatus: 1 },
    ).lean(); // To return plain JS objects;

    difficultyAttempts.forEach((attempt) => {
      const difficultyStatus = attempt.difficultyStatus;

      if (!difficultyStatus) return;

      for (const level in difficultyStatus) {
        if (!mergedDifficulty[level]) {
          mergedDifficulty[level] = { correct: 0, total: 0 };
        }

        mergedDifficulty[level].correct += difficultyStatus[level].correct || 0;
        mergedDifficulty[level].total += difficultyStatus[level].total || 0;
      }
    });

    for (let level in mergedDifficulty) {
      const correct = mergedDifficulty[level].correct;
      const total = mergedDifficulty[level].total;

      mergedDifficulty[level].percentage =
        total > 0 ? ((correct / total) * 100).toFixed(2) : 0;
    }

    res.json({
      success: true,
      sessions: totalSessions,
      totalQuestions: result.totalQuestions,
      totalCorrect: result.totalCorrect,
      totalWrong: result.totalWrong,
      totalNotAttempted: result.totalNotAttempted,
      totalTimeTaken: result.totalTimeTaken,
      subjects: mergedSubjects,
      difficulty: mergedDifficulty,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erron in sending dashboard data.",
    });
  }
});

app.get("/profile-dateHistory/:email", async (req, res) => {
  try {
    const email = req.params.email;

    const attempts = await QuizAttempt.find({ userEmail: email })
      .sort({ date: -1 }) // latest first
      .limit(5);

    const historyData = attempts.map((attempt) => {
     const subject = [...attempt.subjectStatus.keys()][0];

      let difficulty = "";
      for (let level in attempt.difficultyStatus) {
        if (attempt.difficultyStatus[level].total > 0) {
          difficulty = level;
          break;
        }
      }
      return {
        date: attempt.date,
        subject: subject,
        difficulty: difficulty,
        score: `${attempt.accuracy}% `,
        time: attempt.timeTaken,
      };
    });
    res.status(200).json({
      success: true,
      history: historyData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erron in sending history data.",
    });
  }
});

app.get("/profile-performance-status/:email" , async (req,res) => {
  try {
    
    const email = req.params.email;

    const attempts = await QuizAttempt.find({ userEmail: email });

    const totalQuizzes = attempts.length;

    let totalAccuracy = 0;
    let totalQuestions = 0;

    const subjectCount = {};

    attempts.forEach((attempt) => {

      totalAccuracy += attempt.accuracy;
      totalQuestions += attempt.totalQuestions;

      const subject = [...attempt.subjectStatus.keys()][0];

      if (!subjectCount[subject]) {
        subjectCount[subject] = 0;
      }

      subjectCount[subject]++;

    });

    const overallAccuracy = totalQuizzes
      ? (totalAccuracy / totalQuizzes).toFixed(0)
      : 0;

    let favoriteSubject = "N/A";
    let max = 0;

    for (let subject in subjectCount) {
      if (subjectCount[subject] > max) {
        max = subjectCount[subject];
        favoriteSubject = subject;
      }
    }

    res.json({
      totalQuizzes,
      overallAccuracy,
      favoriteSubject,
      totalQuestions
    });

  } catch (error) {
    res.stats(500).json({
      success: false,
      message: "Error in sending performance status data."
    })
  }
})

app.get("/profile-info/:email", async (req, res) => {
  try {

    const email = req.params.email;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      memberSince: user.createdAt
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching profile info" });
  }
});
