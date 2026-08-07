"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  ShoppingBag,
  Lock,
  Mail,
  User,
  Phone,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  registerSchema,
  type RegisterFormData,
} from "@/lib/validations/auth";
import { registerAction } from "@/lib/actions/auth";
import { ParticlesBg } from "@/components/shared/particles-bg";
import { TextReveal } from "@/components/animations/text-reveal";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const result = await registerAction({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });

      if (!result.success) {
        toast.error(result.error || "Something went wrong.");
        return;
      }

      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-emerald-600 via-teal-700 to-cyan-800 flex-col items-center justify-center p-12 text-white">
        <ParticlesBg
          particleCount={35}
          particleColor="rgba(255,255,255,0.12)"
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative text-center z-10"
        >
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-xl mx-auto mb-10 shadow-2xl border border-white/20"
          >
            <ShoppingBag className="h-14 w-14 text-white" />
          </motion.div>

          <h1 className="text-5xl font-black mb-3">Join Us</h1>
          <p className="text-xl text-emerald-100 mb-2">
            Start Your POS Journey
          </p>
          <p className="text-emerald-200/70 text-sm max-w-md mx-auto leading-relaxed">
            Create your account and start managing your retail business with the
            most powerful POS system.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 grid grid-cols-3 gap-4"
          >
            {[
              { icon: "🚀", label: "Fast Setup" },
              { icon: "🔒", label: "Secure" },
              { icon: "📊", label: "Analytics" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white/10 backdrop-blur p-4 border border-white/10"
              >
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-xs text-emerald-200">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right — Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-600 to-cyan-600 shadow-xl"
            >
              <ShoppingBag className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-black bg-linear-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Upul Stores
              </h1>
              <p className="text-xs text-muted-foreground">Smart POS</p>
            </div>
          </div>

          <div className="mb-8">
            <TextReveal
              text="Create Account ✨"
              className="text-3xl font-black"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground mt-2"
            >
              Fill in your details to get started
            </motion.p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-2"
            >
              <Label>Full Name</Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Your full name"
                  className="pl-10 h-12 rounded-xl"
                  {...register("name")}
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label>Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10 h-12 rounded-xl"
                  {...register("email")}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Phone */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <Label>Phone (Optional)</Label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="+94 77 123 4567"
                  className="pl-10 h-12 rounded-xl"
                  {...register("phone")}
                  disabled={isLoading}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label>Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 chars, 1 uppercase, 1 number"
                  className="pl-10 pr-12 h-12 rounded-xl"
                  {...register("password")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-2"
            >
              <Label>Confirm Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className="pl-10 pr-12 h-12 rounded-xl"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="submit"
                className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl transition-all mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account →"
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                Sign In
              </Link>
            </p>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </motion.div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Upul Stores. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}