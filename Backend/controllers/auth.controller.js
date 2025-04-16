import { z } from "zod";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { transporter } from "../mailtrap/nodemailer.js";
import crypto from "crypto";
import { isBodyEmpty } from "../utils/bodyDataChecker.js";

const signupSchema = z
  .object({
    name: z.string()
      .min(1, "Name is required")
      .max(50, "Name cannot exceed 50 characters")
      .trim(),

    email: z.string()
      .email("Please enter a valid email address")
      .min(5, "Email must be at least 5 characters")
      .max(100, "Email cannot exceed 100 characters")
      .transform((val) => val.toLowerCase().trim()),

    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password cannot exceed 64 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter (A-Z)")
      .regex(/[0-9]/, "Must contain at least one number (0-9)")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character (e.g., !@#$%^&*)"),

    confirmPassword: z.string()
      .min(1, "Confirm Password is required")
      .trim(),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email("Invaild Email"),
  password: z.string().min(1,"Password is required")
})

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid Email"),
});

const restPasswordSchema = z.object({
  email: z.string().email("Invaild Email"),
  newPassword: z.string()
  .min(8,"Password must be atleast 8 characters long")
  .max(64, "Password can't exceeds over 64 characters")
  .regex(/[A-Z]/, "Password should contain atleast one uppercase letter [A-Z]")
  .regex(/[0-9]/, "Password must contain atleast one number [0-9]")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character (e.g., !@#$%^&*)"),
  confirmPassword: z.string()
}).refine((data)=> data.newPassword === data.confirmPassword, {
  message: "password don not match",
  path: ["confirmPassword"]
})

export const signup = async (req, res) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomInt(100000, 999999).toString();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const mailOptions = {
      from: `Authenticator <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Welcome to Our Platform - OTP Verification",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background: #f4f4f4;">
        <div style="background: linear-gradient(to right, #4CAF50, #2E8B57); padding: 15px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="color: #fff; margin: 0;">Welcome to Our Platform</h2>
        </div>
        
        <div style="background: #fff; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
          <p style="font-size: 16px; color: #333;">Hello <strong>${user.name}</strong>,</p>
          <p style="font-size: 16px; color: #555;">Thank you for signing up! Please use the OTP below to verify your email:</p>
          
          <div style="font-size: 22px; font-weight: bold; color: #4CAF50; padding: 15px; background: #f9f9f9; display: inline-block; border-radius: 5px; letter-spacing: 3px;">
            ${user.verificationToken}
          </div>
    
          <p style="font-size: 14px; color: #777; margin-top: 10px;">This OTP will expire in 15 minutes. If you did not request this, please ignore this email.</p>
          
          <p style="font-size: 14px; color: #777; margin-top: 20px;">Best Regards,<br><strong>Our Team</strong></p>
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      success: true,
      message: "Verification Code has been sent on you Email Id. Verify your Email",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.message.includes("duplicate key")) {
      return res.status(409).json({
        success: false,
        error: "Email already exists",
      });
    }
    if(error.errors){
      return res.status(400).json({ success: false, error: error.errors.map((err)=>({
        message: err.message,
        path: err.path.join(".")
      }))})
    }

    console.error("Signup error:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

export const verifyEmail = async(req,res) => {
  const { code, email } = req.body || {}
  if(!code){
    return res.status(400).json({ success: false, message: "Please enter the verification code"})
  }
  if(!email){
    return res.status(403).json({ success: false, message: "Missing Email. Please refresh and signup again "})
  }
  try{
    const user = await User.findOne({ email })
    if(!user){
      return res.status(400).json({ success: false, message: "user not found!"})
    }
    if( user.verificationTokenExpiresAt < Date.now() ){
      return res.status(400).json({ success: false, message: "verification code expired!"})
    }
    if(user.verificationToken !== code.toString()){
      return res.status(400).json({ success: false, message:"invalid code"})
    }
    user.isVerified = true,
    user.verificationToken = null,
    user.verificationTokenExpiresAt = null

    await user.save()
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const mailOptions = {
      from: `Authenticator <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Welcome to the Authenticator",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f6f9fc; padding: 40px 20px;">
          <table align="center" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="text-align: center; background-color: #0f62fe; padding: 30px;">
                <img src="https://cdn-icons-png.flaticon.com/512/1041/1041916.png" alt="Welcome" width="80" style="margin-bottom: 20px;" />
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to Authenticator!</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 40px;">
                <h2 style="color: #333;">Hey ${user.name || "there"} 👋,</h2>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">
                  We're super excited to have you on board. Your email has been successfully verified! 🎉
                  <br/><br/>
                  From here on, you’ll get access to all features we offer. If you ever need help, our support is just an email away.
                </p>
                <div style="text-align: center; margin-top: 30px;">
                  <a href="http://localhost:5000" style="background: #0f62fe; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                    Go to Dashboard
                  </a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; background: #f0f4f8; padding: 20px; font-size: 14px; color: #888;">
                Need help? Contact us anytime at <a href="mailto:support@yourdomain.com" style="color: #0f62fe;">support@yourdomain.com</a>
                <br/><br/>
                &copy; ${new Date().getFullYear()} Authenticator. All rights reserved.
              </td>
            </tr>
          </table>
        </div>
      `
    }
    await transporter.sendMail(mailOptions)
    return res.status(200).json({ success: true, message: "Verification done successfully" })

  }catch(error){
    return res.status(500).json({ message: "Internal server error", error: error.message })
  }
}

export const login = async (req, res) => {
  if (isBodyEmpty(req.body)) {
    return res.status(400).json({
      success: false,
      message: "Please enter the login details. email and password"
    });
  }

  const validateLoginData = loginSchema.safeParse(req.body);
  if (!validateLoginData.success) {
    return res.status(400).json({
      success: false,
      message: "Please enter valid login details",
      error: validateLoginData.error.errors.map(err => ({
        path: err.path.join("."),
        message: err.message,
      }))
    });
  }

  try {
    const { email, password } = validateLoginData.data;

    // Include password for comparison but remove it later
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid login credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: "You need to verify your email first" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({ success: false, message: "Invalid login credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Set true in production with HTTPS
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Convert to plain object and remove password manually
    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: userData
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
};


export const logout = async (req, res) => {
  try{
    res.clearCookie("token",{
      httpOnly: true,
      secure: process.eventNames.NODE_ENV === "production",
      sameSite: "strict"
    })
    return res.status(200).json({ success: true, message: "Logged out successfully"})
  }catch(error){
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (isBodyEmpty(req.body)) {
    return res.status(400).json({
      success: false,
      message: "Please fill the detail. 'Email required'",
    });
  }

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please enter the email to get password reset link",
    });
  }

  const validatedEmail = forgotPasswordSchema.safeParse({ email });
  if (!validatedEmail.success) {
    return res.status(400).json({
      success: false,
      error: validatedEmail.error.errors.map((err) => ({
        message: err.message,
        path: err.path.join("."),
      })),
    });
  }

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
      });
    }

    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    await user.save();

    // ✅ Fix: send token & email in the reset URL
    const resetURL = `http://localhost:5173/reset-password?token=${resetPasswordToken}&email=${encodeURIComponent(user.email)}`;

    const mailOptions = {
      from: `Authenticator <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 10px; border: 1px solid #eee; max-width: 600px; margin: auto;">
          <h2 style="color: #007BFF;">Forgot Your Password?</h2>
          <p>Hi <b>${user.name || "there"}</b>,</p>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background-color: #007BFF; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Reset Password</a>
          </div>
          <p>This link will expire in <b>15 minutes</b>.</p>
          <p>If you didn't request this, please ignore the email.</p>
          <p style="margin-top: 30px;">Thanks,<br><b>Authenticator Team</b></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Password reset link sent successfully to your email",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const resetPassword = async(req,res) => {
  const { token } = req.body
  if(!token){
    return res.status(400).json({ success: false, message: "Missing token in the URL"})
  }
  if(isBodyEmpty(req.body)){
    return res.status(400).json({ success: false, message: "Enter the details. 'new Password, confirm password"})
  }
  const validateResetPasswordData = restPasswordSchema.safeParse(req.body)
  if(!validateResetPasswordData.success){
    return res.status(400).json({ success: false, error: validateResetPasswordData.error.errors.map((err)=>({
      message: err.message,
      path: err.path.join(".")
    }))})
  }
  try{
    const user = await User.findOne({email: validateResetPasswordData.data.email, resetPasswordToken: token.toString() })
    if(!user){
      return res.status(400).json({ success: false, message: "User not found. Something bad happend please refresh the page and try again or click on reset password link again"})
    }
    if(user.resetPasswordToken !== token.toString()){
      return res.status(400).json({ success: false, message: "Invalid token!"})
    }
    if(user.resetPasswordExpiresAt < Date.now()){
      return res.status(400).json({ success: false, message: "Link expired!"})
    }
    const hashedPassword = await bcrypt.hash(validateResetPasswordData.data.newPassword, 10)

    user.password = hashedPassword,
    user.resetPasswordToken = null,
    user.resetPasswordExpiresAt = null

    await user.save()
    const mailOptions = {
      from: `"Authenticator" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: "✅ Password Reset Successful",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #4F46E5;">Password Reset Confirmation</h2>
          <p style="font-size: 15px; color: #333;">
            Hello ${user.name || "User"},
          </p>
          <p style="font-size: 15px; color: #333;">
            Your password has been successfully reset. You can now log in using your new password.
          </p>
          <a href="https://yourapp.com/login" style="display: inline-block; margin-top: 20px; padding: 10px 15px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
            Login Now
          </a>
          <p style="font-size: 13px; color: #777; margin-top: 30px;">
            If you didn’t request this change, please contact our support team immediately.
          </p>
          <p style="font-size: 13px; color: #aaa; margin-top: 40px;">
            — The YourApp Team
          </p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions)

    return res.status(201).json({ success: true, message:"Password has been reset sucessfully"})
  }catch(error){
    return res.status(500).json({message: "Internal server Error", error: error.message })
  }
};

export const checkAuth = async(req,res) => {
  try{
    const userId = req.userId
    const user = await User.findById(userId).select("-password")
    if(!user){
      return res.status(400).json({ success: false, message: "User not found"})
    }
    return res.status(200).json({ success: true, user: user})
  }catch(error){
    console.error("Error in checkAuth:", error)
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message})
  }
}