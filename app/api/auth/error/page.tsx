// app/auth/error/page.tsx
export default function AuthErrorPage() {
    return (
      <div className="flex min-h-screen items-center justify-center text-center p-6">
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-red-500">Authentication Failed</h1>
          <p className="text-muted-foreground">
            Something went wrong during sign in. Please try again or contact admin support.
          </p>
        </div>
      </div>
    );
  }