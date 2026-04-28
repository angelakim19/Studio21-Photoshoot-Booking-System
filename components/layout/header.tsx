"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
           <Image
              src="/favicon.png"
              alt="Studio 21 Logo"   // ✅ add this
              width={50}
              height={50}
            />
            <div className="hidden sm:block">
              <span className="font-serif text-xl font-semibold text-foreground">Studio 21</span>
              <span className="block text-xs text-muted-foreground tracking-wider">M N&apos; B PHOTOGRAPHY</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#services" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Services
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/#location" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Location
            </Link>
            <Link href="/booking" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Book Now
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild className="text-foreground hover:text-primary hover:bg-primary/5">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-md">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link href="/#services" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Services
              </Link>
              <Link href="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                How It Works
              </Link>
              <Link href="/#location" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Location
              </Link>
              <Link href="/booking" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Book Now
              </Link>
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="ghost" asChild className="flex-1">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild className="flex-1 bg-primary hover:bg-primary/90">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
