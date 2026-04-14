const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const Setting = require('../models/Setting');
const sendNotificationEvent = require('../utils/notificationClient');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

const generateVerificationToken = (email) => {
  return jwt.sign({ email, verified: true }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, verificationToken } = req.body;

    // Check if OTP is enabled
    const otpSetting = await Setting.findOne({ key: 'registration_otp_enabled' });
    const isOtpEnabled = otpSetting ? otpSetting.value === true : false;

    if (isOtpEnabled) {
      if (!verificationToken) {
        return res.status(400).json({ message: 'Email verification required' });
      }
      try {
        const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);
        if (decoded.email !== email || !decoded.verified) {
          return res.status(400).json({ message: 'Invalid verification token' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Verification token expired or invalid' });
      }
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || process.env.DEFAULT_ROLE,
    });

    if (user) {
      try {
        await sendNotificationEvent("WELCOME_USER", {
          name: user.name,
          email: user.email,
          role: user.role
        });
      } catch (notifyErr) {
        console.error("Auth Service: Failed to send welcome email:", notifyErr.message);
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Generate 6 digit OTP
    const otpContents = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await Otp.findOneAndUpdate(
      { email },
      { otp: otpContents, expiresAt },
      { upsert: true, new: true }
    );

    await sendNotificationEvent("REGISTRATION_OTP", {
      email,
      otp: otpContents
    });

    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP found, remove it and return verification token
    await Otp.deleteOne({ _id: otpRecord._id });

    const verificationToken = generateVerificationToken(email);
    res.status(200).json({ verificationToken, message: 'Email verified successfully' });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getRegistrationConfig = async (req, res) => {
  try {
    const otpSetting = await Setting.findOne({ key: 'registration_otp_enabled' });
    res.status(200).json({ 
      isOtpEnabled: otpSetting ? otpSetting.value === true : false 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateRegistrationConfig = async (req, res) => {
  try {
    const { isOtpEnabled } = req.body;
    await Setting.findOneAndUpdate(
      { key: 'registration_otp_enabled' },
      { value: isOtpEnabled },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: `OTP verification ${isOtpEnabled ? 'enabled' : 'disabled'}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  sendOtp, 
  verifyOtp, 
  getRegistrationConfig, 
  updateRegistrationConfig 
};