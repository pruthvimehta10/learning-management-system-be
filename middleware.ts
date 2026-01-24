import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
    // 1. Get token from header or cookie
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

    if (!token) {
        token = request.cookies.get('auth_token')?.value || null
    }

    const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || 'https://external-project.com/login'

    // Helper to redirect to login
    const redirectToLogin = () => {
        return NextResponse.redirect(new URL(loginUrl, request.url))
    }

    // 2. Verify Token
    if (!token) {
        // Determine if the route requires protection
        // We protect /course-player, /admin, and maybe others?
        // User asked to protect /course-player and /admin specifically
        const path = request.nextUrl.pathname
        if (path.startsWith('/course-player') || path.startsWith('/admin')) {
            return redirectToLogin()
        }
        // For other routes (e.g. landing page), we might allow access without token? 
        // Or "If the token is missing or invalid, redirect the user back... " implies GLOBAL protection?
        // "Protect the /course-player and /admin routes." suggests specific protection.
        // But "If the token is missing or invalid, redirect..." suggests strictness.
        // Let's assume strictness for protected routes, but MAYBE open for valid public routes?
        // The prompt says "Redirect the user back... If the token is missing or invalid"
        // AND "Protect the /course-player and /admin routes".
        // I'll stick to protecting those specific routes for now to avoid breaking public landing pages if they exist.
        // Wait, "Refactor any 'User Profile' ... components".

        // Let's check logic:
        // If token is present, we attempt verify.
        // If token is MISSING:
        //    If route is protected -> Redirect.
        //    Else -> Continue (Guest mode?)

        // "If the token is missing or invalid, redirect the user back ... " 
        // This sentence usually implies a firewall.
        // But "Protect the /course-player and /admin routes" implies specificity.
        // I will treat /course-player and /admin as STRICTLY protected.

        if (path.startsWith('/course-player') || path.startsWith('/admin')) {
            return redirectToLogin()
        }

        return NextResponse.next()
    }

    try {
        const secret = new TextEncoder().encode(process.env.EXTERNAL_JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)

        // 3. Extract Claims
        const username = payload.username as string
        const labid = payload.labid as string
        const role = payload.role as string

        // 4. RBAC
        const path = request.nextUrl.pathname

        // "Only allow role: 'instructor' or role: 'admin' to access management features."
        // Assuming "management features" means /admin routes?
        if (path.startsWith('/admin') && role !== 'instructor' && role !== 'admin') {
            // Unauthorized for this role
            return NextResponse.redirect(new URL('/', request.url)) // Or a 403 page
        }

        // 5. Pass headers
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-name', username || '')
        requestHeaders.set('x-lab-id', labid || '')
        requestHeaders.set('x-user-role', role || '') // Adding role for convenience

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })

    } catch (error) {
        console.error('JWT Verification failed:', error)
        // If token invalid, and we are on protected route, redirect.
        // If we are on public route, maybe just clear headers? 
        // "If the token is missing or invalid, redirect the user back..."
        // I'll assume if they provided a token and it failed, they should re-login.
        return redirectToLogin()
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
