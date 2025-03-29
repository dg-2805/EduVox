"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  ChevronLeft,
  Github,
  ChromeIcon as Google,
  Linkedin,
} from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("login");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  useEffect(() => {
    if (searchParams?.get("signup") === "true") {
      setActiveTab("signup");
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = async () => {
    console.log("Sending login request...");
    console.log("Password being sent:", formData.password);
    try {
      const response = await fetch("http://localhost:3009/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Login successful!");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleSignup = async () => {
    console.log("Sending signup request...");
    try {
      const response = await fetch("http://localhost:3009/user/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          hash_password: formData.password, // use hash_password key instead of password
          username: formData.name,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Signup successful!");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background with parallax effect */}
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"
        style={{
          transform: `translate(${mousePosition.x / 50}px, ${
            mousePosition.y / 50
          }px)`,
        }}
      />

      <motion.div
        className="absolute w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-20 -z-10"
        style={{
          left: `calc(50% - 200px + ${mousePosition.x / 30}px)`,
          top: `calc(50% - 200px + ${mousePosition.y / 30}px)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      <Link href="/" className="absolute top-8 left-8 flex items-center">
        <Button variant="ghost" size="icon" className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span>Back to Home</span>
      </Link>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-primary/10 p-3 rounded-full"
          >
            <Brain className="h-8 w-8 text-primary" />
          </motion.div>
        </div>

        <motion.div
          className="bg-card/30 glassmorphism shadow-lg rounded-xl p-8 w-full relative overflow-hidden"
          whileHover={{ boxShadow: "0 10px 40px rgba(124, 58, 237, 0.2)" }}
          transition={{ duration: 0.3 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="login" className="space-y-4">
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="hello@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
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
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button className="w-full" onClick={handleLogin}>
                    Login
                  </Button>
                </motion.div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <motion.div
                  key="signup-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="hello@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSignup}>
                    Create Account
                  </Button>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
