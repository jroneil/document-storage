import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface Route {
  path: string;
}

const protectedRoutes: Route[] = [
  { path: '/admin' },
  { path: '/admin/dashboard' },
  { path: '/admin/settings' },
];

const publicRoutes: Route[] = [
  { path: '/login' },
  { path: '/register' },
  { path: '/forgot-password' },
];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value; // Replace with actual token validation if needed
  const currentPath = request.nextUrl.pathname;

  console.log("Current Path:", currentPath);
  console.log("Token:", token);

  // Check route type
  const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route.path));
  const isPublicAuthRoute = publicRoutes.some(route => currentPath === route.path);
  const isApiRoute = currentPath.startsWith('/api/');
  const isStaticFile = currentPath.match(/\.(jpg|jpeg|png|gif|ico|svg|css|js|woff|woff2|ttf|eot)$/) || currentPath.includes('_next');

  // Allow API routes and static files to pass through
  if (isApiRoute || isStaticFile) {
    return NextResponse.next();
  }

  try {
    const isValidToken = await validateToken(token); // Replace with your actual validation logic

    console.log("isPublicAuthRoute:", isPublicAuthRoute);
    console.log("token:", token);
    console.log("isValidToken:", isValidToken);

    // Prevent redirect loop: Don't redirect if already on login page
    if (isPublicAuthRoute && isValidToken) {
      // User logged in and on a public route, no redirect needed
      if (currentPath === '/login') {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Redirect unauthenticated users to login for protected routes
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

// Replace with your actual token validation function (example)
async function validateToken(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, { // Verify route
      method: 'POST', // Or GET, depending on your API
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json' // Important for POST requests
      },
       body: JSON.stringify({}) //send empty body to the server
    });

    if (!response.ok) {
      // Log more detailed error information for debugging
      console.error(`Token verification failed with status: ${response.status}`);
      try {
        const errorBody = await response.json();
        console.error("Error Body:", errorBody)
      } catch (jsonError) {
        console.error("Could not parse error body:", jsonError)
      }
      return false; // Token is invalid
    }

    // If the response is ok, it means the token is valid
    return true;
  } catch (error) {
    console.error("Error during token verification:", error);
    return false; // An error occurred during verification (e.g., network issue)
  }
}