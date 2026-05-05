"use client"

import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function FeaturedPage() {
  const router = useRouter()
    const handleBooking = () => {
      const token = localStorage.getItem("access_token")
  
      if (!token) {
        router.push("/login")
        return
      }
  
      router.push("/booking")
    }
    const images = [
      "/images/featured3.jpg",
      "/images/featured1.jpg",
      "/images/featured2.jpg",
      "/images/featured10.jpg",
      "/images/featured6.jpg",
      "/images/featured7.jpg",
      "/images/featured8.jpg",
      "/images/featured9.jpg",
    ]

    const [current, setCurrent] = useState(0)

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length)
      }, 4000)

      return () => clearInterval(interval)
    }, [])

    const nextFeatured = () => {
      setCurrent((prev) => (prev + 1) % images.length)
    }

    const prevFeatured = () => {
      setCurrent((prev) => (prev - 1 + images.length) % images.length)
    }

    const galleries = [
      ["/images/cj1.jpg", "/images/cj2.jpg", "/images/cj3.jpg", "/images/cj4.jpg", "/images/cj5.jpg"],

      ["/images/gallery1.jpg", "/images/gallery2.jpg", "/images/gallery3.jpg", "/images/gallery4.jpg", "/images/gallery5.jpg"],

      ["/images/kj1.jpg", "/images/kj2.jpg", "/images/kj3.jpg", "/images/kj4.jpg", "/images/kj5.jpg"],

      ["/images/outdoor6.jpg", "/images/outdoor7.jpg", "/images/outdoor8.jpg", "/images/outdoor9.jpg", "/images/outdoor10.jpg"],

      ["/images/outdoor1.jpg", "/images/outdoor2.jpg", "/images/outdoor3.jpg", "/images/outdoor4.jpg", "/images/outdoor5.jpg"],

      ["/images/outdoor11.jpg", "/images/outdoor12.jpg", "/images/outdoor13.jpg", "/images/outdoor14.jpg", "/images/outdoor15.jpg"],

      ["/images/sc1.jpg", "/images/sc2.jpg", "/images/sc3.jpg", "/images/sc4.jpg", "/images/sc5.jpg"],

      ["/images/sc6.jpg", "/images/sc7.jpg", "/images/sc8.jpg", "/images/sc9.jpg", "/images/sc10.jpg"],

      ["/images/sc11.jpg", "/images/sc13.jpg", "/images/sc14.jpg", "/images/sc15.jpg"],
    ]

    const [indexes, setIndexes] = useState(galleries.map(() => 0))
    useEffect(() => {
      const interval = setInterval(() => {
        setIndexes((prev) =>
          prev.map((i, idx) => (i + 1) % galleries[idx].length)
        )
      }, 3000)

      return () => clearInterval(interval)
    }, [])

    const nextGallery = (i: number) => {
      setIndexes((prev) =>
        prev.map((val, idx) =>
          idx === i ? (val + 1) % galleries[i].length : val
        )
      )
    }

    const prevGallery = (i: number) => {
      setIndexes((prev) =>
        prev.map((val, idx) =>
          idx === i ? (val - 1 + galleries[i].length) % galleries[i].length : val
        )
      )
    }

  return (
    <div className="bg-white text-black">
      <Header />

      {/* 🔹 VIDEO SECTION */}
      <section className="relative w-full h-[70vh] overflow-hidden">
        <video
          src="/images/studio-tour.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-white text-3xl md:text-5xl font-serif">
            Experience Studio 21
          </h1>
        </div>
      </section>

      {/* 🔹 FEATURED HIGHLIGHT */}
      <section className="py-24 bg-[#F5F5F5]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-10">
            Featured Work
          </h2>

        <div className="max-w-5xl mx-auto relative group">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="Featured Work"
              className={`absolute inset-0 w-full h-[500px] object-cover rounded-2xl shadow-lg transition-opacity duration-1000 ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {/* LEFT ARROW */}
          <button
            onClick={prevFeatured}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            ←
          </button>

          {/* RIGHT ARROW */}
          <button
            onClick={nextFeatured}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition"
          >
            →
          </button>

          {/* HEIGHT FIX */}
          <div className="h-[500px]" />
        </div>
        </div>
      </section>

      {/* 🔹 GALLERY GRID */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-x-10 gap-y-16">
            {galleries.map((gallery, i) => (
              <div key={i} className="relative group">
                
                {gallery.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    className={`absolute inset-0 w-full h-[550px] object-cover transition-transform duration-500 group-hover:scale-105 rounded-xl shadow-md transition-opacity duration-700 ${
                      index === indexes[i] ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}

                {/* LEFT */}
                <button
                  onClick={() => prevGallery(i)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/10 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  ←
                </button>

                {/* RIGHT */}
                <button
                  onClick={() => nextGallery(i)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/10 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  →
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {gallery.map((_, dotIndex) => (
                    <div
                      key={dotIndex}
                      className={`w-2 h-2 rounded-full ${
                        dotIndex === indexes[i] ? "bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
                
                {/* HEIGHT FIX */}
                <div className="h-[550px]" />
              </div>
            ))}
          </div>
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
      <Footer />
    </div>
  )
}