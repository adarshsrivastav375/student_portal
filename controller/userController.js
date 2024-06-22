import { User } from "../models/userModel.js";
import fs from 'fs';
import path from 'path';
const register_user = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if ([name, email, password].some((field) => field === "")) {
      return res.status(400).send("all fields are required : " + err.message);
    }
    let existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = new User({ name, email, password });
    await user.save();
    return res.status(201).send({
      message: "User registered successfully",
    });
  } catch (err) {
    return res.status(400).send("Error registering user: " + err.message);
  }
};


const login_user = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Account not verified" });
    }

    const isUserValid = await user.isPasswordCorrect(password);
    if (!isUserValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = await user.generateToken();
    const loggedInUser = await User.findOne(user._id).select("-password");
    res.json({ token, loggedInUser, message: "Logged in successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const currentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (err) {
    return res.status(400).send("Error fetching user: " + err.message);
  }
};

const allUserVerified = async (req, res) => {
  try {
    const user = await User.find({ userType: "student" }).select("-password");
    res.send(user);
  } catch (err) {
    return res.status(400).send("Error fetching user: " + err.message);
  }
};
const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }
    await User.updateOne({ _id: req.params.id }, { isVerified: true });
    res.send({ message: "User verified successfully" });
  } catch (err) {
    console.error("err:", err);
    return res.status(400).send("Error fetching user: " + err.message);
  }
};
const uploadProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    };
    // Remove the old profile image if it exists
    const oldProfileImage = user.profileImage;
    if (oldProfileImage) {
      const oldImagePath = path.join(path.resolve(), 'uploads', oldProfileImage);
      fs.access(oldImagePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error('Failed to delete old profile image:', err);
            }
          });
        } else {
          console.error('Old profile image does not exist:', oldImagePath);
        }
      });
    }

    await User.updateOne({ _id: req.user._id }, { profileImage: req.file.filename });
    res.send({ message: "Profile uploaded successfully", profile: req.file.filename });
  } catch (err) {
    console.error("err:", err);
    return res.status(400).send("Error fetching user: " + err.message);
  }
};

const deleteImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Path to the image to be deleted
    const imagePath = path.join(path.resolve(), 'uploads', req.params.image);

    // Check if the image exists and delete it
    fs.access(imagePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(imagePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Failed to delete image:', unlinkErr);
            return res.status(500).send('Failed to delete image from server.');
          }
        });
      } else {
        console.error('Image does not exist:', imagePath);
      }
    });

    // Remove the image from the user's gallery array in the database
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { gallery: req.params.image } }
    );

    res.send({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    return res.status(400).send("Error deleting image: " + err.message);
  }
};

export default deleteImage;


const uploadImages = async (req, res) => {
  try {

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).send("User not found");
    };
    const gallery = req.files.map(file => file.filename);

    await User.updateOne({ _id: req.user._id }, { $push: { gallery: { $each: gallery } } });

    res.send({ message: "Images uploaded successfully", gallery });
  } catch (err) {
    console.error("err:", err);
    return res.status(400).send("Error fetching user: " + err.message);
  }
};

export { register_user, login_user, currentUser, allUserVerified, verifyUser, uploadProfile, uploadImages, deleteImage };
