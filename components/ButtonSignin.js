/* eslint-disable @next/next/no-img-element */
"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import config from "@/config";
import { useState } from "react";

// A simple button to sign in with our providers (Google & Magic Links).
// It automatically redirects user to callbackUrl (config.auth.callbackUrl) after login, which is normally a private page for users to manage their accounts.
const ButtonSignin = ({ text = "Sign in", className = "", callbackUrl = "" }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // If user is logged in, redirect to callbackUrl or dashboard
  if (session) {
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
