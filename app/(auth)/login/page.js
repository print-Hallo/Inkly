"use client"
import { useState } from "react"
export default function LoginCard() {
  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-neutral-100 dark:bg-neutral-950 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900">

        {/* header */}
        <div className="bg-neutral-950 dark:bg-black px-8 py-7">
          <h2 className="text-xl font-medium text-white tracking-tight mb-1">Welcome back</h2>
          <p className="text-sm text-neutral-400">Enter your credentials to access your account</p>
          <div className="flex justify-end mt-4">
            <button className="text-xs font-medium text-neutral-300 bg-white/10 hover:bg-white/15 border border-white/15 rounded-md px-3 py-1.5 transition-colors">
              Create account →
            </button>
          </div>
        </div>

        {/* form body */}
        <div className="px-8 py-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Password</label>
              <a href="#" className="text-xs text-neutral-400 underline underline-offset-2">Forgot password?</a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
            />
          </div>
        </div>

        {/* footer */}
        <div className="px-8 pb-8 flex flex-col gap-3">
          <button className="w-full py-2.5 text-sm font-medium bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg transition-colors">
            Login
          </button>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
            <span className="text-xs text-neutral-400">or</span>
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
          </div>
          <button className="w-full py-2.5 text-sm font-medium border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
            {/* google svg */}
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

      </div>
    </div>
  )
}