"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle password reset logic here
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <Image
              src="/favicon.png"
              alt="Studio 21 Logo"
              width={45}
              height={45}
              className="rounded-full"
              />
            <span className="font-serif text-xl font-semibold text-[#1a1a1a]">Studio 21</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md border-0 shadow-none">
            {!isSubmitted ? (
              <>
                <CardHeader className="text-center pb-2">
                  <CardTitle className="font-serif text-3xl text-[#1a1a1a]">Reset Password</CardTitle>
                  <CardDescription className="text-base">
                    Enter your email address and we&apos;ll send you a link to reset your password
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
                  </CardContent>
                  <CardFooter className="flex flex-col gap-6 pt-2">
                    <Button type="submit" className="w-full h-12 bg-[#C8A96A] hover:bg-[#B8995A] text-white font-medium text-base">
                      Send Reset Link
                    </Button>
                    <Link 
                      href="/login" 
                      className="text-sm text-muted-foreground hover:text-[#C8A96A] flex items-center gap-1 justify-center transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Sign In
                    </Link>
                  </CardFooter>
                </form>
              </>
            ) : (
              <>
                <CardHeader className="text-center pb-2">
                  <div className="w-20 h-20 rounded-full bg-[#C8A96A]/10 flex items-center justify-center mx-auto mb-6">
                    <Mail className="h-10 w-10 text-[#C8A96A]" />
                  </div>
                  <CardTitle className="font-serif text-3xl text-[#1a1a1a]">Check Your Email</CardTitle>
                  <CardDescription className="text-base">
                    We&apos;ve sent a password reset link to <strong className="text-[#1a1a1a]">{email}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  <p>
                    Didn&apos;t receive the email? Check your spam folder or{" "}
                    <button 
                      type="button"
                      className="text-[#C8A96A] hover:text-[#B8995A] font-medium"
                      onClick={() => setIsSubmitted(false)}
                    >
                      try again
                    </button>
                  </p>
                </CardContent>
                <CardFooter className="pt-4">
                  <Button variant="outline" className="w-full h-12 border-gray-200 hover:border-[#C8A96A] hover:bg-[#C8A96A]/5" asChild>
                    <Link href="/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Sign In
                    </Link>
                  </Button>
                </CardFooter>
              </>
            )}
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
          <h2 className="font-serif text-3xl font-semibold mb-3">Reset Your Password</h2>
          <p className="text-white/80">We&apos;ll help you get back into your account securely.</p>
        </div>
      </div>
    </div>
  )
}
