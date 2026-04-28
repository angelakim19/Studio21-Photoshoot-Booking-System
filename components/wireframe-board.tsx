"use client"

import { LandingPage } from "./wireframes/landing-page"
import { LoginPage } from "./wireframes/login-page"
import { SignUpPage } from "./wireframes/signup-page"
import { ForgotPasswordPage } from "./wireframes/forgot-password-page"
import { BookingStep1 } from "./wireframes/booking-step-1"
import { BookingStep2 } from "./wireframes/booking-step-2"
import { BookingStep3 } from "./wireframes/booking-step-3"
import { BookingStep4 } from "./wireframes/booking-step-4"
import { UserDashboard } from "./wireframes/user-dashboard"
import { AdminDashboard } from "./wireframes/admin-dashboard"

export function WireframeBoard() {
  return (
    <div className="space-y-8">
      {/* Row 1: Landing, Login, Sign Up, Forgot Password */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-2">
          <PageLabel title="1. Landing Page" />
          <LandingPage />
        </div>
        <div>
          <PageLabel title="2. Login Page" />
          <LoginPage />
        </div>
        <div className="space-y-6">
          <div>
            <PageLabel title="3. Sign Up Page" />
            <SignUpPage />
          </div>
          <div>
            <PageLabel title="4. Forgot Password" />
            <ForgotPasswordPage />
          </div>
        </div>
      </div>

      {/* Row 2: Booking Steps 1-4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div>
          <PageLabel title="5. Booking Step 1 – Service" />
          <BookingStep1 />
        </div>
        <div>
          <PageLabel title="6. Booking Step 2 – Details" />
          <BookingStep2 />
        </div>
        <div>
          <PageLabel title="7. Booking Step 3 – Date & Time" />
          <BookingStep3 />
        </div>
        <div>
          <PageLabel title="8. Booking Step 4 – Confirm" />
          <BookingStep4 />
        </div>
      </div>

      {/* Row 3: User Dashboard and Admin Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <PageLabel title="9. User Dashboard" />
          <UserDashboard />
        </div>
        <div>
          <PageLabel title="10. Admin Dashboard" />
          <AdminDashboard />
        </div>
      </div>
    </div>
  )
}

function PageLabel({ title }: { title: string }) {
  return (
    <div className="mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm font-medium rounded-t-lg inline-block">
      {title}
    </div>
  )
}
