"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link"
import Image from "next/image"
import { Camera, Palette, Building, CalendarCheck, Clock, CheckCircle, ArrowRight, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

const services = [
  {
    icon: Camera,
    title: "Professional Photoshoot",
    description: "High-quality photography with professional lighting and equipment. Perfect for portfolios, headshots, and creative projects.",
    price: "From ₱ 6,000",
  },
  {
    icon: Palette,
    title: "Makeup Services",
    description: "Expert makeup artists to ensure you look your absolute best. Available as standalone service or add-on to any shoot.",
    price: "From ₱ 1,200",
  },
  {
    icon: Building,
    title: "Studio Rental",
    description: "Rent our fully-equipped studio space for your own projects. Includes lighting equipment and backdrop options.",
    price: "From ₱ 500 - ₱ 700/hr",
  },
]

const steps = [
  {
    number: "01",
    title: "Choose Your Service",
    description: "Select from our range of professional photography services.",
  },
  {
    number: "02",
    title: "Pick a Date & Time",
    description: "Choose from available slots that fit your schedule.",
  },
  {
    number: "03",
    title: "Confirm Your Booking",
    description: "Review details and confirm your appointment.",
  },
  {
    number: "04",
    title: "Enjoy Your Session",
    description: "Arrive at our studio and let us capture your best moments.",
  },
]

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  const handleBooking = () => {
    if (!user) {
      setShowPopup(true);
    } else {
      router.push("/booking");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent z-10" />
          <div className="absolute right-0 top-0 w-full md:w-2/3 h-full overflow-hidden">
            <Image
              src="/images/studio.jpg"
              alt="Studio 21 Interior"
              fill
              className="object-cover object-center"
              priority
              loading="eager"
            />
          </div>
          <div className="container mx-auto px-4 relative z-20">
            <div className="py-24 lg:py-36 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C8A96A]/10 text-[#C8A96A] text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                <span>Premium Photography Studio</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance mb-6 text-[#1a1a1a]">
                Capture Your Perfect Moment at{" "}
                <span className="text-[#C8A96A]">Studio 21</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 text-pretty leading-relaxed">
                Book professional photoshoots, makeup services, and studio rentals with ease. 
                Our luxurious facilities and expert team ensure stunning results every time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={handleBooking}
                  className="bg-[#C8A96A] hover:bg-[#B8995A] text-white shadow-lg shadow-[#C8A96A]/25 px-8"
                >
                  Book Your Session
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" asChild className="border-[#C8A96A]/30 text-[#1a1a1a] hover:bg-[#C8A96A]/5 hover:border-[#C8A96A]">
                  <Link href="#services">View Services</Link>
                </Button>
              </div>
              <div className="flex items-center gap-8 mt-10 pt-8 border-t border-border">
                <div>
                  <div className="text-2xl font-serif font-semibold text-[#1a1a1a]">500+</div>
                  <div className="text-sm text-muted-foreground">Happy Clients</div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <div className="text-2xl font-serif font-semibold text-[#1a1a1a]">5.0</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3 w-3 fill-[#C8A96A] text-[#C8A96A]" />
                    Rating
                  </div>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <div className="text-2xl font-serif font-semibold text-[#1a1a1a]">3+</div>
                  <div className="text-sm text-muted-foreground">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 bg-[#F5F5F5]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-[#C8A96A] text-sm font-medium uppercase tracking-wider">What We Offer</span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3 mb-4 text-[#1a1a1a]">Our Services</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From professional photoshoots to makeup services and studio rentals, 
                we offer everything you need for the perfect photography experience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service) => (
                <Card key={service.title} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#C8A96A]/10 flex items-center justify-center mb-4 group-hover:bg-[#C8A96A] transition-colors duration-300">
                      <service.icon className="h-7 w-7 text-[#C8A96A] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <CardTitle className="font-serif text-xl text-[#1a1a1a]">{service.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="font-semibold text-[#C8A96A]">{service.price}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBooking}
                        className="text-[#1a1a1a] hover:text-[#C8A96A] hover:bg-[#C8A96A]/5"
                      >
                        Book Now
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-[#C8A96A] text-sm font-medium uppercase tracking-wider">Simple Process</span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3 mb-4 text-[#1a1a1a]">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Booking your perfect photoshoot is simple and straightforward. Follow these easy steps.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={step.number} className="text-center relative">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#C8A96A]/50 to-[#C8A96A]/10" />
                  )}
                  <div className="w-20 h-20 rounded-full bg-[#C8A96A]/10 flex items-center justify-center mx-auto mb-6 relative z-10 border-2 border-[#C8A96A]/20">
                    <span className="font-serif text-2xl font-semibold text-[#C8A96A]">{step.number}</span>
                  </div>
                  <h3 className="font-semibold mb-2 text-[#1a1a1a]">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section with Studio Image */}
        <section className="py-24 bg-[#F5F5F5]">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-[#C8A96A] text-sm font-medium uppercase tracking-wider">Why Us</span>
                <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3 mb-8 text-[#1a1a1a]">
                  Why Choose Studio 21?
                </h2>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#C8A96A]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-[#C8A96A]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1a1a1a] mb-1">Professional Equipment</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        State-of-the-art cameras, lighting, and backdrops for perfect shots every time.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#C8A96A]/10 flex items-center justify-center flex-shrink-0">
                      <CalendarCheck className="h-6 w-6 text-[#C8A96A]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1a1a1a] mb-1">Easy Online Booking</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Book and manage your appointments 24/7 from any device with instant confirmation.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#C8A96A]/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-[#C8A96A]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1a1a1a] mb-1">Flexible Scheduling</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Choose from morning, afternoon, or evening time slots that fit your schedule.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#C8A96A]/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-[#C8A96A]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1a1a1a] mb-1">Luxury Experience</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Elegant studio space with modern amenities for a premium photography experience.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/10">
                  <Image
                    src="/images/studio.jpg"
                    alt="Studio 21 Interior"
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#C8A96A] flex items-center justify-center">
                      <Star className="h-6 w-6 text-white fill-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1a1a1a]">5-Star Rated</div>
                      <div className="text-sm text-muted-foreground">By 500+ clients</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section id="location" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-[#C8A96A] text-sm font-medium uppercase tracking-wider">Visit Us</span>
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3 mb-4 text-[#1a1a1a]">Find Our Studio</h2>
              <p className="text-muted-foreground">
                Conveniently located in the heart of Valencia City
              </p>
            </div>

            <div className="bg-[#F5F5F5] rounded-3xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#C8A96A]/10 flex items-center justify-center flex-shrink-0">
                      <Building className="h-6 w-6 text-[#C8A96A]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1a1a1a] mb-1">Studio Address</h3>
                      <p className="text-muted-foreground">P10 Poblacion Quillo Bldg., Valencia City, Bukidnon, Philippines 8709</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#C8A96A]/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-[#C8A96A]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1a1a1a] mb-1">Opening Hours</h3>
                      <p className="text-muted-foreground">Mon-Fri: 8AM-10PM | Sat & Sun: 7AM-11PM </p>
                    </div>
                  </div>
                  <Button asChild className="bg-[#C8A96A] hover:bg-[#B8995A] text-white mt-4">
                    <Link href="https://www.google.com/maps/search/?api=1&query=7.9046019,125.0841386" target="_blank">
                      Get Directions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="bg-white rounded-2xl aspect-video shadow-inner overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!4v1777625698062!6m8!1m7!1sYoQZdQcZMXkcb8JBLXcxBA!2m2!1d7.904601888060517!2d125.0841386471947!3f339.24!4f-0.5400000000000063!5f0.7820865974627469"
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
              </div>
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
      </main>
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm text-center shadow-xl">
            
            <h2 className="text-lg font-semibold mb-2 text-[#1a1a1a]">
              Login Required
            </h2>

            <p className="text-sm text-gray-500 mb-6">
              You need to log in first before booking a session.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={() => router.push("/login")}
                className="flex-1 py-2 rounded-lg bg-[#C8A96A] text-white hover:bg-[#B8995A]"
              >
                Go to Login
              </button>
            </div>

          </div>
        </div>
      )}          
      <Footer />
    </div>
  )
}
