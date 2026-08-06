"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ShoppingBag, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";

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
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
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
        toast.error("Invalid email or password. Please try again.");
        return;
      }

      toast.success("Welcome back! Redirecting...");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
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
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-blue-600 via-blue-700 to-purple-700 flex-col items-center justify-center p-12 text-white relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full border-2 border-white" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full border-2 border-white" />
          <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur mx-auto mb-8 shadow-2xl"
          >
            <ShoppingBag className="h-12 w-12 text-white" />
          </motion.div>

          <h1 className="text-5xl font-black mb-3">Upul Stores</h1>
          <p className="text-xl text-blue-100 mb-2">Smart POS Enterprise</p>
          <p className="text-blue-200 text-sm max-w-xs mx-auto leading-relaxed">
            Complete retail management solution for modern businesses
          </p>

          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { label: "Products", value: "1,250+" },
              { label: "Daily Sales", value: "Rs.125K" },
              { label: "Customers", value: "892+" },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 rounded-2xl p-4 backdrop-blur"
              >
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-blue-200 text-xs mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-purple-600 shadow-lg">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Upul Stores
              </h1>
              <p className="text-xs text-muted-foreground">Smart POS</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold">Welcome back 👋</h2>
            <p className="text-muted-foreground mt-1">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@upulstores.lk"
                  className="pl-10"
                  {...register("email")}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-12"
                  {...register("password")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
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
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Demo Credentials */}
            <Card className="border-dashed border-blue-200 dark:border-blue-900">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-center text-muted-foreground mb-3">
                  🔑 Demo Credentials
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-center mb-3">
                  <div className="rounded-lg bg-muted p-2">
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">
                      admin@upulstores.lk
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <p className="font-medium">Password</p>
                    <p className="text-muted-foreground">Admin@123</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={fillDemo}
                >
                  Fill Demo Credentials
                </Button>
              </CardContent>
            </Card>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Upul Stores. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}