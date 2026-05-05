"use client"

import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OurStoryPage() {
  const router = useRouter()
  const handleBooking = () => {
    const token = localStorage.getItem("access_token")

    if (!token) {
      router.push("/login")
      return
    }

    router.push("/booking")
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">

        {/* 🔹 HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent z-10" />
          <div className="absolute right-0 top-0 w-full md:w-2/3 h-full">
            <Image
              src="/images/studio.jpg"
              alt="Studio"
              fill
              className="object-cover"
            />
          </div>

          <div className="container mx-auto px-4 relative z-20">
            <div className="py-24 max-w-2xl">
              <h1 className="font-serif text-5xl font-semibold mb-6 text-[#1a1a1a]">
                Our Story
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Behind every photo is a story, and ours started with passion,
                creativity, and a dream to capture meaningful moments.
              </p>
            </div>
          </div>
        </section>

        {/* 🔹 FOUNDERS (3 PHOTOS) */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl mb-12 text-[#1a1a1a]">
              The People Behind the Lens
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Replace images here */}
              <div className="overflow-hidden rounded-2xl shadow-md">
                <Image
                  src="/images/owner1.jpg"
                  alt="Photographer"
                  width={400}
                  height={600}
                  className="w-full h-[500px] object-cover"
                />
              </div>

              <div className="overflow-hidden rounded-2xl shadow-md">
                <Image
                  src="/images/owner2.jpg"
                  alt="Makeup Artist"
                  width={400}
                  height={600}
                  className="w-full h-[500px] object-cover"
                />
              </div>

              <div className="overflow-hidden rounded-2xl shadow-md">
                <Image
                  src="/images/owner4.jpg"
                  alt="Team"
                  width={400}
                  height={600}
                  className="w-full h-[500px] object-cover object-top"
                />
              </div>

            </div>
          </div>
        </section>

        {/* 🔹 STORY TEXT */}
        <section className="py-24 bg-[#F5F5F5]">
          <div className="container mx-auto px-4 max-w-3xl text-center space-y-6">

            <p className="text-muted-foreground leading-relaxed text-lg">
              It all started as something simple, a genuine passion for photography and makeup, done purely out of curiosity and enjoyment. There was no big plan in the beginning, just a love for creating and experimenting with ideas, capturing moments, and bringing out beauty in small, personal ways.
            </p>

            <p className="text-muted-foreground leading-relaxed text-lg">
              What began as casual shoots slowly grew into something more meaningful. Friends and acquaintances started to notice the work, and little by little, more people began reaching out, asking to be photographed, trusting the process, and believing in the vision. What was once just a hobby started to take shape as something bigger.
            </p>

            <p className="text-muted-foreground leading-relaxed text-lg">
              From those early beginnings, 
              <span className="text-[#C8A96A] font-medium"> Art by Mark Angelo </span>
              was born, starting as a humble home-based studio.
            </p>

            <p className="text-muted-foreground leading-relaxed text-lg">
              As the journey continued, a partnership formed, combining photography and artistry into one vision. Together, they grew the studio into a space where creativity and passion come to life.
            </p>

            <p className="text-muted-foreground leading-relaxed text-lg">
              Over time, the studio gained recognition not only within Bukidnon but across the Philippines, with clients traveling just to experience the craft.
            </p>

            <p className="text-muted-foreground leading-relaxed text-lg">
              Today, the studio has evolved into a larger space, but the same passion remains.
            </p>

          </div>
        </section>

        {/* 🔹 VISION */}
        <section className="py-24 bg-white text-center">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="font-serif text-3xl mb-6 text-[#1a1a1a]">
              Our Vision
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              To become a one-stop studio experience, where clients no longer
              need to worry about the details, because everything they need is
              already here.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[#1a1a1a] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Image
              src="/images/studio.jpg"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <span className="text-[#C8A96A] text-sm font-medium uppercase tracking-wider">Get Started</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3 mb-4 text-white">
              Ready to Book Your Session?
            </h2>
            <p className="text-white/70 mb-10 max-w-xl mx-auto">
              Join hundreds of satisfied clients who have captured their perfect moments at Studio 21.
            </p>
            <Button
              size="lg"
              onClick={handleBooking}
              className="bg-[#C8A96A] hover:bg-[#B8995A] text-white shadow-lg shadow-[#C8A96A]/25 px-10"
            >
              Book Your Session Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}