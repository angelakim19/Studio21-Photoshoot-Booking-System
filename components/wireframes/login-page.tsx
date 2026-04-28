import { Circle } from "lucide-react"

export function LoginPage() {
  return (
    <div className="bg-gray-100 border-2 border-gray-300 rounded-lg shadow-md p-8 min-h-[500px] flex items-center justify-center">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <Circle className="w-12 h-12 text-gray-400 mb-2" />
          <span className="font-bold text-gray-700">Studio 21</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Welcome Back</h2>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <div className="h-10 bg-gray-50 border border-gray-200 rounded-md"></div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <div className="h-10 bg-gray-50 border border-gray-200 rounded-md"></div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border border-gray-300 rounded"></div>
              Remember me
            </label>
            <span className="text-gray-500 underline cursor-pointer">Forgot Password?</span>
          </div>

          <button className="w-full py-3 bg-gray-800 text-white rounded-md font-medium">
            Login
          </button>

          <p className="text-center text-sm text-gray-500">
            {"Don't have an account?"} <span className="underline cursor-pointer">Sign Up</span>
          </p>
        </div>
      </div>
    </div>
  )
}
