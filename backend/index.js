const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10MB" }));

const PORT = process.env.PORT || 8080;
//mongodb connection
console.log(process.env.MONGODB_URL);
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connect to Database"))
  .catch((err) => console.log(err));

//schema

const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  confirmPassword: String,
  image: String,
});

//model

const userModel = mongoose.model("user", userSchema);

//api
app.get("/", (req, res) => {
  res.send("Server is running");
});
app.post("/signup", async (req, res) => {
  const { email } = req.body;

  try {
    const emailExists = await userModel.exists({ email: email });

    if (emailExists) {
      return res
        .status(400)
        .json({ message: "Email id is already registered", alert: false });
    }

    const newUser = new userModel(req.body);
    const savedUser = await newUser.save();
    res.json({ message: "Successfully signed up", user: savedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/log", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await userModel.findOne({ email: email });
  
      if (!user) {
        return res.status(404).json({ message: "This email is not available, please sign up", alert: false });
      }
  
      // compare the hashed password with the provided password.
      // bcrypt for password hashing and verification.
  
      if (user.password === password) {
        const dataSend = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          image: user.image,
        };
        console.log(dataSend);
        res.json({ message: "Login is successful", alert: true, user: dataSend });
      } else {
        // Handle case where the password is incorrect
        res.status(401).json({ message: "Invalid password", alert: false });
      }
    } catch (error) {
      // Handle other errors
      console.error(error);
      res.status(500).json({ message: "Internal Server Error", alert: false });
    }
  });
  

app.listen(PORT, () => console.log("server is running at port : " + PORT));
