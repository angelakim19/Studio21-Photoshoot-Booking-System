"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    agreeToTerms,
  } = formData;

  // 🔍 Check if email already exists
  const { data: existingUsers } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUsers) {
    setError("This email is already registered. Please log in instead.");
    return;
  }

  // Validation
  if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
    setError("Please fill in all fields");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  if (!agreeToTerms) {
    setError("You must agree to the Terms and Privacy Policy");
    return;
  }

  setLoading(true);

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signUpError) {
    setError(signUpError.message);
    setLoading(false);
    return;
  }

  const user = data.user;

  if (user) {
    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      role: "client",
    });

    if (insertError) {
      console.error(insertError);
      setError("Account created but failed to save profile");
      setLoading(false);
      return;
    }
  }

  setLoading(false);
  setShowModal(true);
};


  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-THnRphgnAPYpsw9ifd0WCipiXSU6Cw.png"
          alt="Studio 21 Interior"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="font-serif text-3xl font-semibold mb-3">Join Studio 21</h2>
          <p className="text-white/80">Create an account to book your first photoshoot session.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 flex justify-end lg:justify-start">
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

        <div className="flex-1 flex items-center justify-center p-6 py-8">
          <Card className="w-full max-w-md border-0 shadow-none">
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-serif text-3xl text-[#1a1a1a]">Create an Account</CardTitle>
              <CardDescription className="text-base">
                Sign up to book your first photoshoot session!
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-6">
                {error && (
                  <p className="text-red-500 text-sm text-center">{error}</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-[#1a1a1a]">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="h-11 border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-[#1a1a1a]">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="h-11 border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#1a1a1a]">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="username@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="h-11 border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[#1a1a1a]">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="0917-555-0123"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="h-11 border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#1a1a1a]">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-11 border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A] pr-12"
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#1a1a1a]">Confirm Password</Label>
                  <div className="relative">
                  <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="h-11 border-gray-200 focus:border-[#C8A96A] focus:ring-[#C8A96A] pr-12"
                    />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#C8A96A] transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  </div>                  
                </div>
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox 
                    id="terms" 
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => 
                      setFormData((prev) => ({ ...prev, agreeToTerms: checked === true }))
                    }
                    required
                    className="mt-0.5 border-gray-300 data-[state=checked]:bg-[#C8A96A] data-[state=checked]:border-[#C8A96A]"
                  />
                  <Label htmlFor="terms" className="text-sm font-normal cursor-pointer leading-relaxed text-muted-foreground">
                    I agree to the{" "}
                    <Link href="/terms" className="text-[#C8A96A] hover:text-[#B8995A] font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-[#C8A96A] hover:text-[#B8995A] font-medium">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4 pt-4">
              {/* PRIMARY BUTTON */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#C8A96A] hover:bg-[#B8995A] text-white font-medium text-base"
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>

              {/* DIVIDER */}
              <div className="flex items-center w-full">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-3 text-sm text-muted-foreground">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* SIGN IN TEXT (LAST) */}
              <p className="text-sm text-muted-foreground text-center mt-2">
                Already have an account?{" "}
                <Link href="/login" className="text-[#C8A96A] hover:text-[#B8995A] font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
            </form>
          </Card>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl p-6 w-[350px] text-center shadow-lg">
            
            <h2 className="text-xl font-semibold mb-2">
              Account Created Successfully!
            </h2>

            <p className="text-gray-600 mb-4">
              Your account has been created successfully.  
              Please log in to start booking your photoshoot appointment.
            </p>

            <button
              onClick={() => {
                setShowModal(false);
                router.push("/login");
              }}
              className="bg-[#C8A96A] text-white px-4 py-2 rounded-lg hover:bg-[#B8995A]"
            >
              Go to Login
            </button>

          </div>
        </div>
      )}
    </div>
  )
}
