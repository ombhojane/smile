/* eslint-disable @next/next/no-img-element */
"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import config from "@/config";
import { useState } from "react";

// A simple button to sign in with our providers (Google & Magic Links).
// It automatically redirects user to callbackUrl (config.auth.callbackUrl) after login, which is normally a private page for users to manage their accounts.
const ButtonSignin = ({ text = "Sign in", className = "", callbackUrl = "" }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // Only redirect to dashboard if user is logged in and not on home page
  if (session && pathname !== "/" && pathname !== "") {
    router.push(callbackUrl || config.auth.callbackUrl);
    return null;
  }

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn(undefined, { callbackUrl: callbackUrl || config.auth.callbackUrl });
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // If user is logged in and on home page, show their profile
  if (session && (pathname === "/" || pathname === "")) {
    return (
      <Link
        href={config.auth.callbackUrl}
        className={`btn ${className}`}
      >
        {session.user?.image ? (
          <img
            src={session.user?.image}
            alt={session.user?.name || "Account"}
            className="w-6 h-6 rounded-full shrink-0"
            referrerPolicy="no-referrer"
            width={24}
            height={24}
          />
        ) : (
          <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0">
            {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
          </span>
        )}
        {session.user?.name || session.user?.email || "Account"}
      </Link>
    );
  }

  return (
    <button
      className={`btn btn-primary ${className}`}
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        text
      )}
    </button>
  );
};

export default ButtonSignin;
