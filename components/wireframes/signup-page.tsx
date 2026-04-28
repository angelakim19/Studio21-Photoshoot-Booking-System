import { Circle } from "lucide-react"

export function SignUpPage() {
  return (
    <div className="bg-gray-100 border-2 border-gray-300 rounded-lg shadow-md p-6 flex items-center justify-center">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-4">
          <Circle className="w-10 h-10 text-gray-400 mb-1" />
          <span className="font-bold text-gray-700 text-sm">Studio 21</span>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-gray-800 text-center mb-4">Create Account</h2>

        {/* Form */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Full Name</label>
            <div className="h-9 bg-gray-50 border border-gray-200 rounded-md"></div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email</label>
            <div className="h-9 bg-gray-50 border border-gray-200 rounded-md"></div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Password</label>
            <div className="h-9 bg-gray-50 border border-gray-200 rounded-md"></div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Confirm Password</label>
            <div className="h-9 bg-gray-50 border border-gray-200 rounded-md"></div>
          </div>

          <button className="w-full py-2.5 bg-gray-800 text-white rounded-md font-medium text-sm">
            Sign Up
          </button>

          <p className="text-center text-xs text-gray-500">
            Already have an account? <span className="underline cursor-pointer">Login</span>
          </p>
        </div>
      </div>
    </div>
  )
}
