import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/admin', '/admin/dashboard', '/admin/settings'];
const publicRoutes = ['/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // Replace with actual token validation if needed
  const currentPath = request.nextUrl.pathname;

  console.log("Current Path:", currentPath);
  console.log("Token:", token);

  // Check route type
  const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));
  const isPublicAuthRoute = publicRoutes.some(route => currentPath === route);
  const isApiRoute = currentPath.startsWith('/api/');
  const isStaticFile = currentPath.match(/\.(jpg|jpeg|png|gif|ico|svg|css|js|woff|woff2|ttf|eot)$/) || currentPath.includes('_next');

  // Allow API routes and static files to pass through
  if (isApiRoute || isStaticFile) {
    return NextResponse.next();
  }

  try {
    const isValidToken = token ? true : false; // Replace with actual token validation logic
    console.log("isPublicAuthRoute="+isPublicAuthRoute)
    console.log("token="+token)
    console.log("isValidToken="+isValidToken)
    // Prevent redirect loop: Don't redirect if already on login page
    if (isPublicAuthRoute && isValidToken) {
      // If the user is already logged in, and they are on a public route like `/login`, don't redirect to `/admin/dashboard`
      if (currentPath === '/login') {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Redirect unauthenticated users to login when accessing protected routes
    if (isProtectedRoute && !isValidToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', currentPath);
      return NextResponse.redirect(loginUrl);
    }

    // Handle invalid tokens by clearing the cookie and redirecting to login
    if (token && !isValidToken && isProtectedRoute) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      console.log("Invalid token cleared.");
      return response;
    }

    // Allow valid requests to continue
    return NextResponse.next();
  } catch (error) {
    const err = error as Error;
    console.error('Middleware error:', err.message, err.stack);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

