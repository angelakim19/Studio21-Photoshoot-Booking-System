"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log({ email, password, rememberMe })
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0McGs7RZl6BZHsb6KgS3JK5SUdnNz1.png"
              alt="Studio 21 Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-serif text-xl font-semibold text-[#1a1a1a]">Studio 21</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md border-0 shadow-none">
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-serif text-3xl text-[#1a1a1a]">Welcome Back</CardTitle>
              <CardDescription className="text-base">
                Sign in to your account to manage your bookings
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#1a1a1a]">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#1a1a1a]">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A] pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#C8A96A] transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                      className="border-gray-300 data-[state=checked]:bg-[#C8A96A] data-[state=checked]:border-[#C8A96A]"
                    />
                    <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-muted-foreground">
                      Remember me
                    </Label>
                  </div>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-[#C8A96A] hover:text-[#B8995A] font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-6 pt-2">
                <Button type="submit" className="w-full h-12 bg-[#C8A96A] hover:bg-[#B8995A] text-white font-medium text-base">
                  Sign In
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-[#C8A96A] hover:text-[#B8995A] font-medium">
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-THnRphgnAPYpsw9ifd0WCipiXSU6Cw.png"
          alt="Studio 21 Interior"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="font-serif text-3xl font-semibold mb-3">Capture Your Perfect Moment</h2>
          <p className="text-white/80">Professional photography services in our luxurious studio space.</p>
        </div>
      </div>
    </div>
  )
}
