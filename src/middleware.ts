import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    const isAuthRoute = pathname === '/login' || pathname === '/admin/login' || pathname === '/teacher/login';

    // Public assets
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname === '/favicon.ico' || pathname.startsWith('/images/')) {
        return NextResponse.next();
    }

    let userRole = null;
    if (token) {
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64));
            // Basic check, expiration
            if (decodedPayload.exp * 1000 > Date.now()) {
                userRole = decodedPayload.role;
            }
        } catch {
            // invalid token format
        }
    }

    // Redirect root to best dashboard or allow public access to landing page
    if (pathname === '/') {
        if (userRole) {
            return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
        }
        return NextResponse.next();
    }

    if (!userRole && !isAuthRoute) {
        if (pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/login?role=admin', request.url));
        }
        if (pathname.startsWith('/teacher')) {
            return NextResponse.redirect(new URL('/login?role=teacher', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (userRole) {
        if (pathname.startsWith('/admin') && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/teacher/dashboard', request.url));
        }
        if (pathname.startsWith('/teacher') && userRole !== 'teacher') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        if (isAuthRoute) {
            return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
