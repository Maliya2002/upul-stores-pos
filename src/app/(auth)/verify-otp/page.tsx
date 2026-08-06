"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingBag, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyOTPAction, generateOTPAction } from "@/lib/actions/auth";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOTPAction(email, otpString);
      if (result.success) {
        toast.success("OTP verified successfully!");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Invalid OTP. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const result = await generateOTPAction(email);
      if (result.success) {
        toast.success("New OTP sent!");
        if (result.devOTP) {
          toast.info(`Dev OTP: ${result.devOTP}`, { duration: 10000 });
        }
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(result.error || "Failed to resend OTP.");
      }
    } catch {
      toast.error("Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-purple-600 shadow-lg">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Upul Stores
            </h1>
            <p className="text-xs text-muted-foreground">Smart POS</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold">Verify OTP 📱</h2>
          <p className="text-muted-foreground mt-2">
            Enter the 6-digit OTP sent to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="h-14 w-12 text-center text-xl font-bold"
              disabled={isLoading}
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          className="w-full h-11 font-semibold mb-4"
          disabled={isLoading || otp.join("").length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </Button>

        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          {isResending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Resend OTP
        </button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </motion.div>
    </div>
  );
}