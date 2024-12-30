import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Retrieve token from cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Extract query parameters from the incoming request
    const { searchParams } = new URL(request.url);
    const isPublic = searchParams.get('isPublic') || 'true';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // Make a request to the Express controller
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/documents?isPublic=${isPublic}&page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Handle response from the Express API
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: response.status }
      );
    }

    // Parse and return the API response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
