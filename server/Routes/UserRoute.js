import express from "express";
import User from "./../Models/UserModel.js";
import { jwtAuthMiddleware, generateToken } from './../jwt.js';
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { sendEmail } from '../emailservice.js';
import fs from "fs";
import nodemailer from "nodemailer";
import multer from 'multer'
import crypto from 'crypto';



const router = express.Router();

export const sendResetEmail = async (to, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  await transporter.sendMail({
    to,
    from: process.env.EMAIL_USER,
    subject: 'Password Reset',
    html: `<p>Click below to reset your password:</p>
           <a href="${resetLink}">${resetLink}</a>
           <p>This link will expire in 1 hour.</p>`
  });
};

// GET: Check if user has voted
router.get('/elections/:electionId/has-voted/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // No need to compare with electionId anymore
    return res.json({ hasVoted: user.isVoted });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

// In your user routes file
router.get('/admin-exists', async (req, res) => {
  try {
    const adminExists = await User.exists({ role: 'admin' });
    res.json({ adminExists: !!adminExists });
  } catch (err) {
    res.status(500).json({ error: 'Server error checking admin existence' });
  }
});


// Signup Route
const VALID_ELECTION_IDS = [
  "A1B2C3D4E5", "F6G7H8I9J0", "K1L2M3N4O5", "P6Q7R8S9T0", "U1V2W3X4Y5",
  "Z6A7B8C9D0", "E1F2G3H4I5", "J6K7L8M9N0", "O1P2Q3R4S5", "T6U7V8W9X0",
  "Y1Z2A3B4C5", "D6E7F8G9H0", "I1J2K3L4M5", "N6O7P8Q9R0", "S1T2U3V4W5",
  "X6Y7Z8A9B0", "C1D2E3F4G5", "H6I7J8K9L0", "M1N2O3P4Q5", "R6S7T8U9V0"
];

router.post('/signup', async (req, res) => {
    try {
        const data = req.body;

        // Check if electionid is valid
        if (!VALID_ELECTION_IDS.includes(data.electionid)) {
            return res.status(403).json({ error: 'Invalid or unauthorized election ID. Signup not allowed.' });
        }

        // Check if electionid is already used
        const existingUser = await User.findOne({ electionid: data.electionid });
        if (existingUser) {
            return res.status(403).json({ error: 'Election ID already used. Each user must have a unique election ID.' });
        }

        if (data.role === 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin) {
                return res.status(403).json({ error: 'An admin already exists. Only one admin allowed.' });
            }
        }

        const newUser = new User(data);
        const response = await newUser.save();
        const token = generateToken({ id: response.id });

        res.status(200).json({ response, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Login Route with 2FA
async function sendEmailWithQR(to, subject, htmlContent, qrPath) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: htmlContent,
        attachments: [
            {
                filename: "qrcode.png",
                path: qrPath,
                cid: "qrcode", // Content-ID to reference in email body
            },
        ],
    };

    await transporter.sendMail(mailOptions);
}
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Enable MFA flag
        user.isMFA = true;

        // Only generate a new secret if one does not exist
        if (!user.twoFactorSecret) {
            const secret = speakeasy.generateSecret();
            user.twoFactorSecret = secret.base32;
            await user.save();

            const url = speakeasy.otpauthURL({
                secret: secret.base32,
                label: `${user.email}`,
                issuer: "Secure E-Voting System",
                encoding: "base32"
            });

            const qrPath = './qrcode.png';
            qrcode.toFile(qrPath, url, async (err) => {
                if (err) {
                    return res.status(500).json({ error: 'QR Code generation failed' });
                }

                const emailBody = `
                    <p>Scan this QR code in Google Authenticator or any TOTP app:</p>
                    <img src="cid:qrcode" alt="QR Code" />
                `;

                await sendEmailWithQR(user.email, 'Your MFA QR Code', emailBody, qrPath);
                fs.unlinkSync(qrPath);

                return res.status(200).json({ message: 'MFA enabled. Check your email for QR code' });
            });
        } else {
            // Secret already exists, prompt for OTP only
            await user.save();
            return res.status(200).json({ message: 'MFA already enabled. Please verify OTP' });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// 2FA Verification Route
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, token } = req.body;
        console.log(">>> OTP Verification Request Body:", req.body);

        const user = await User.findOne({ email });
        

        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ error: 'User not found or 2FA is not enabled' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
            window: 3
        });

        if (verified) {
            const jwtToken = generateToken({ id: user.id });

            // 🔥 Send role and token to frontend
            res.status(200).json({
                message: "2FA successful",
                token: jwtToken,
                role: user.role,
                 user: {
                    id: user._id,
                    email: user.email,
                    name: user.name, // if you have this
                    role: user.role
                }
            });
        } else {
            res.status(400).json({ message: "Invalid 2FA token" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean()
        if (!user) return res.status(404).json({ error: 'User not found' })
        res.status(200).json({ user })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})



const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop()
    cb(null, `${req.user.id}_${Date.now()}.${ext}`)
  }
})
const upload = multer({ storage })

router.post('/upload-profile', jwtAuthMiddleware, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    const user = await User.findById(req.user.id)
    user.profileImage = req.file.filename
    await user.save()
    res.status(200).json({ message: 'Profile image uploaded', filename: req.file.filename })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})
// Reset 2FA Route
router.post('/2fa/reset', jwtAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.twoFactorSecret = null;
        user.isMFA = false;
        await user.save();
        res.status(200).json({ message: "2FA reset successful" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Forgot Password - Sends email with reset link
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `http://localhost:5173/user/reset-password/${token}`;
    await sendEmail(user.email, 'Password Reset Link', `
      <h3>Password Reset</h3>
      <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
      <p>This link will expire in 1 hour.</p>
    `);

    res.status(200).json({ message: 'Reset link sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset Password - Sets new password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    user.password = password; // If you're using bcrypt in pre-save hook, this will be hashed
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();
    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resend OTP Route
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // If user does not have a 2FA secret, generate and send QR code again
    if (!user.twoFactorSecret) {
      const secret = speakeasy.generateSecret();
      user.twoFactorSecret = secret.base32;
      await user.save();

      const url = speakeasy.otpauthURL({
        secret: secret.base32,
        label: `${user.email}`,
        issuer: "Secure E-Voting System",
        encoding: "base32"
      });

      const qrPath = './qrcode.png';
      qrcode.toFile(qrPath, url, async (err) => {
        if (err) {
          return res.status(500).json({ error: 'QR Code generation failed' });
        }

        const emailBody = `
          <p>Scan this QR code in Google Authenticator or any TOTP app:</p>
          <img src="cid:qrcode" alt="QR Code" />
        `;

        await sendEmailWithQR(user.email, 'Your MFA QR Code (Resent)', emailBody, qrPath);
        fs.unlinkSync(qrPath);

        return res.status(200).json({ message: 'MFA QR code resent. Check your email.' });
      });
    } else {
      // If already enabled, just prompt for OTP (no need to resend QR)
      return res.status(200).json({ message: 'MFA already enabled. Please check your authenticator app for OTP.' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default router;