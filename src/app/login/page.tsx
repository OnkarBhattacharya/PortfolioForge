
"use client";

import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { useFirebase } from "@/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
} from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { auth } = useFirebase();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/admin");
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleAppleSignIn = async () => {
    const provider = new OAuthProvider("apple.com");
    try {
      await signInWithPopup(auth, provider);
      router.push("/admin");
    } catch (error) {
      console.error("Error signing in with Apple", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Choose your preferred sign-in method
          </p>
        </div>
        <div className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center"
            variant="outline"
          >
            <FcGoogle className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>
          <Button
            onClick={handleAppleSignIn}
            className="w-full flex items-center justify-center"
            variant="outline"
          >
            <FaApple className="w-5 h-5 mr-2" />
            Sign in with Apple
          </Button>
        </div>
      </div>
    </div>
  );
}
