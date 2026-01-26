// Add this at the top of your SetTokenPage component in app/dev/set-token/page.tsx
// This will block access in production unless explicitly allowed

export default function SetTokenPage() {
  // Block access in production for security
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS !== 'true') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-black text-foreground mb-4">🔒 Access Denied</h1>
          <p className="text-lg font-semibold text-foreground/70 mb-4">
            This development tool is not available in production.
          </p>
          <p className="text-sm text-foreground/50">
            If you need to access this page, set NEXT_PUBLIC_ALLOW_DEV_TOOLS=true in your environment variables.
          </p>
        </div>
      </div>
    )
  }

  // ... rest of your existing component code below
  // Keep all the existing useState, handlers, and JSX
}

/*
USAGE INSTRUCTIONS:

1. Copy the code above (lines 4-23)
2. Replace the existing "export default function SetTokenPage()" in page.tsx
3. Keep all your existing component logic below the production check

DEPLOYMENT OPTIONS:

Option A: Block in Production (Recommended)
- Don't add NEXT_PUBLIC_ALLOW_DEV_TOOLS to Vercel
- Page will be blocked automatically in production

Option B: Allow with Password
- Add NEXT_PUBLIC_ALLOW_DEV_TOOLS=true to Vercel
- Page will be accessible (use only for testing)

Option C: Remove Dev Tools Entirely
- Delete app/dev/set-token folder
- Delete app/api/dev/generate-token folder
- Use CLI token generator instead: node scripts/generate-test-token.js
*/
