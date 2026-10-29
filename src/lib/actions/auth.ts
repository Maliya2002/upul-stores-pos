"use server";

import bcrypt from "bcryptjs";
import { randomBytes, randomInt } from "node:crypto";
import { requireStaff } from "@/lib/authorization";
import { signIn, signOut } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  registerSchema,
} from "@/lib/validations/auth";
import type {
  LoginFormData,
  ForgotPasswordFormData,
} from "@/lib/validations/auth";
import { AuthError } from "next-auth";

/* ── Login ─────────────────────────────── */

export async function loginAction(data: LoginFormData) {
  const validated = loginSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Validation failed",
    };
  }

  try {
    await signIn("credentials", {
      email: validated.data.email,
      password: validated.data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: "Invalid email or password. Please try again.",
          };
        default:
          return {
            success: false,
            error: "Something went wrong. Please try again.",
          };
      }
    }
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/* ── Logout ─────────────────────────────── */

export async function logoutAction() {
  await signOut({ redirect: false });
  return { success: true };
}

/* ── Forgot Password ─────────────────────── */

export async function forgotPasswordAction(data: ForgotPasswordFormData) {
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      error:
        "Email recovery is not configured. Contact your store administrator.",
    };
  }
  const validated = forgotPasswordSchema.safeParse(data);

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Validation failed",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: validated.data.email },
    });

    if (!user) {
      return {
        success: true,
        message: "If this email exists, you will receive a reset link shortly.",
      };
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.passwordResetToken.deleteMany({
      where: { email: validated.data.email },
    });

    await prisma.passwordResetToken.create({
      data: {
        email: validated.data.email,
        token,
        expires,
      },
    });

    console.log(
      `[DEV] Reset link: http://localhost:3000/reset-password?token=${token}`,
    );

    return {
      success: true,
      message:
        "Development reset token created. Email delivery is not configured.",
      devToken: process.env.NODE_ENV === "development" ? token : undefined,
    };
  } catch {
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/* ── Reset Password ─────────────────────── */

export async function resetPasswordAction(token: string, newPassword: string) {
  const validated = resetPasswordSchema.safeParse({
    token,
    password: newPassword,
    confirmPassword: newPassword,
  });
  if (!validated.success)
    return {
      success: false,
      error: validated.error.issues[0]?.message ?? "Invalid password.",
    };
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return { success: false, error: "Invalid or expired reset token." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      const consumed = await tx.passwordResetToken.deleteMany({
        where: { token, expires: { gt: new Date() } },
      });
      if (consumed.count !== 1)
        throw new Error("Reset token already used or expired.");
      await tx.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      });
    });

    return { success: true, message: "Password reset successfully." };
  } catch {
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

/* ── Generate OTP ───────────────────────── */

export async function generateOTPAction(email: string) {
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      error:
        "Email verification is not configured. Contact your store administrator.",
    };
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const otp = randomInt(100000, 1000000).toString();
    const expires = new Date(Date.now() + 1000 * 60 * 10);

    await prisma.oTPToken.deleteMany({ where: { email } });
    await prisma.oTPToken.create({ data: { email, otp, expires } });

    console.log(`[DEV] OTP for ${email}: ${otp}`);

    return {
      success: true,
      message: "Development OTP created. Email delivery is not configured.",
      devOTP: process.env.NODE_ENV === "development" ? otp : undefined,
    };
  } catch {
    return { success: false, error: "Failed to generate OTP." };
  }
}

/* ── Verify OTP ─────────────────────────── */

export async function verifyOTPAction(email: string, otp: string) {
  try {
    const otpRecord = await prisma.oTPToken.findFirst({
      where: { email, otp },
    });

    if (!otpRecord || otpRecord.expires < new Date()) {
      return { success: false, error: "Invalid or expired OTP." };
    }

    await prisma.oTPToken.delete({ where: { id: otpRecord.id } });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to verify OTP." };
  }
}

/* ── Create Default Admin ──────────────── */

export async function createDefaultAdmin() {
  if (process.env.NODE_ENV !== "development") {
    return {
      success: false,
      error: "Use the local database seed to create an administrator.",
    };
  }
  try {
    const existing = await prisma.user.findUnique({
      where: { email: "admin@upulstores.lk" },
    });

    if (existing) {
      return { success: false, message: "Admin already exists." };
    }

    const hashed = await bcrypt.hash("Admin@123", 12);

    await prisma.user.create({
      data: {
        name: "Upul Admin",
        email: "admin@upulstores.lk",
        password: hashed,
        role: "OWNER",
        isActive: true,
      },
    });

    return { success: true, message: "Default admin created." };
  } catch {
    return { success: false, error: "Failed to create admin." };
  }
}

/* ── Register ──────────────────────────── */

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  try {
    await requireStaff(["OWNER", "ADMIN"]);
    const validated = registerSchema.safeParse({
      ...data,
      email: data.email?.trim().toLowerCase(),
      confirmPassword: data.password,
    });
    if (!validated.success)
      return {
        success: false,
        error: validated.error.issues[0]?.message ?? "Invalid staff details.",
      };
    data = validated.data;
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return { success: false, error: "Email already registered." };
    }

    if (data.password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters.",
      };
    }

    const hashed = await bcrypt.hash(data.password, 12);

    await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: hashed,
        phone: data.phone?.trim() || null,
        role: "CASHIER",
        isActive: true,
      },
    });

    return { success: true, message: "Account created successfully." };
  } catch {
    return { success: false, error: "Failed to create account." };
  }
}
