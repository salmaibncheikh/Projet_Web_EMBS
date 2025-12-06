import { NextRequest, NextResponse } from 'next/server'

const CHAT_BACKEND_URL = 'http://localhost:8081'

export async function GET(req: NextRequest) {
  try {
    // Forward the request to chat backend
    const response = await fetch(`${CHAT_BACKEND_URL}/api/message/users`, {
      headers: {
        'Cookie': req.headers.get('cookie') || '',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
