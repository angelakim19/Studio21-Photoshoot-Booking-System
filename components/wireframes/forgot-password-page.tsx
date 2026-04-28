export function ForgotPasswordPage() {
  return (
    <div className="bg-gray-100 border-2 border-gray-300 rounded-lg shadow-md p-6 flex items-center justify-center">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 w-full max-w-sm">
        {/* Title */}
        <h2 className="text-lg font-bold text-gray-800 text-center mb-2">Forgot Password</h2>
        <p className="text-xs text-gray-500 text-center mb-4">Enter your email to reset password</p>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email</label>
            <div className="h-9 bg-gray-50 border border-gray-200 rounded-md"></div>
          </div>

          <button className="w-full py-2.5 bg-gray-800 text-white rounded-md font-medium text-sm">
            Send Reset Link
          </button>

          <p className="text-center text-xs text-gray-500">
            <span className="underline cursor-pointer">← Back to Login</span>
          </p>
        </div>
      </div>
    </div>
  )
}
