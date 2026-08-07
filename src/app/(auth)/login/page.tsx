"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ShoppingBag, Lock, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { ParticlesBg } from "@/components/shared/particles-bg";
import { TextReveal } from "@/components/animations/text-reveal";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password.");
        return;
      }

      toast.success("Welcome back! 🎉");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setValue("email", "admin@upulstores.lk");
    setValue("password", "Admin@123");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-br from-blue-600 via-indigo-700 to-purple-800 flex-col items-center justify-center p-12 text-white">
        <ParticlesBg particleCount={40} particleColor="rgba(255,255,255,0.15)" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative text-center z-10"
        >
          <motion.div
            animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-xl mx-auto mb-10 shadow-2xl border border-white/20"
          >
            <ShoppingBag className="h-14 w-14 text-white" />
          </motion.div>

          <h1 className="text-6xl font-black mb-3 tracking-tight">
            Upul Stores
          </h1>
          <p className="text-xl text-blue-100 mb-2 font-medium">
            Smart POS Enterprise
          </p>
          <p className="text-blue-200/80 text-sm max-w-md mx-auto leading-relaxed">
            The most powerful retail management solution for modern Sri Lankan businesses
          </p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex gap-6 mt-12"
          >
            {[
              { label: "Products", value: "1,250+", icon: "📦" },
              { label: "Daily Sales", value: "Rs.125K", icon: "💰" },
              { label: "Customers", value: "892+", icon: "👥" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05, y: -3 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 min-w-[120px]"
              >
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-blue-200 text-xs mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-10 flex items-center justify-center gap-2 text-blue-200/60 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Trusted by 100+ businesses across Sri Lanka
          </motion.div>
        </motion.div>
      </div>

      {/* Right — Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 bg-background relative">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-purple-600 shadow-xl shadow-blue-500/30"
            >
              <ShoppingBag className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Upul Stores
              </h1>
              <p className="text-xs text-muted-foreground font-semibold tracking-widest uppercase">
                Smart POS
              </p>
            </div>
          </div>

          <div className="mb-8">
            <TextReveal
              text="Welcome back 👋"
              className="text-3xl font-black"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground mt-2"
            >
              Sign in to continue to your dashboard
            </motion.p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="email">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@upulstores.lk"
                  className="pl-10 h-12 rounded-xl border-border/60 focus:border-primary transition-all"
                  {...register("email")}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-12 h-12 rounded-xl border-border/60 focus:border-primary transition-all"
                  {...register("password")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2"
            >
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) =>
                  setValue("rememberMe", checked as boolean)
                }
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm font-normal cursor-pointer"
              >
                Remember me for 30 days
              </Label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In →"
                )}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-dashed border-primary/20 bg-primary/[0.02]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <p className="text-xs font-bold text-primary">
                      Demo Credentials
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-center mb-3">
                    <div className="rounded-xl bg-muted/60 p-2.5">
                      <p className="font-bold text-foreground">Email</p>
                      <p className="text-muted-foreground mt-0.5">
                        admin@upulstores.lk
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/60 p-2.5">
                      <p className="font-bold text-foreground">Password</p>
                      <p className="text-muted-foreground mt-0.5">
                        Admin@123
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs rounded-lg"
                    onClick={fillDemo}
                  >
                    ✨ Fill Demo Credentials
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </form>
<p className="mt-8 text-center text-xs text-muted-foreground">

</p>
<motion.p
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.7 }}
  className="mt-6 text-center text-sm text-muted-foreground"
>
  Don&apos;t have an account?{" "}
  <Link href="/register" className="font-semibold text-primary hover:underline">
    Create Account
  </Link>
</motion.p>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Upul Stores. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}