"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const publicPaths = ["/"];

  useEffect(() => {
    if (status === "unauthenticated" && !publicPaths.includes(pathname)) {
      router.push("/api/auth/signin");
    }
  }, [session, status, pathname, router]);

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}