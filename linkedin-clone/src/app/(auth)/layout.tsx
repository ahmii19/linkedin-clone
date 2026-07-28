export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4 dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 tracking-tight">LinkedClone</h1>
          <p className="mt-2 text-sm text-gray-500">Your professional community</p>
        </div>
        {children}
        <p className="mt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} LinkedClone. All rights reserved.
        </p>
      </div>
    </div>
  );
}
