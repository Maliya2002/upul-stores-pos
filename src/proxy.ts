import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canAccessRoute } from "@/lib/route-access";

export const proxy = auth(async (req) => {
  const publicPaths = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
  ];
  if (!publicPaths.includes(req.nextUrl.pathname) && !req.auth?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (!publicPaths.includes(req.nextUrl.pathname) && req.auth?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.user.id },
      select: { isActive: true, role: true },
    });
    if (!user?.isActive)
      return NextResponse.redirect(new URL("/login", req.url));
    if (!canAccessRoute(req.nextUrl.pathname, user.role))
      return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)"],
};
