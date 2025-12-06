import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, name } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'userId and name are required' },
        { status: 400 }
      );
    }

    // For now, just return success since we're updating on the client side
    // The chat backend integration can be added later if needed
    return NextResponse.json({
      success: true,
      user: {
        name: name.trim()
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
