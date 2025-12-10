import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json()

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    if (!['mother', 'doctor', 'adolescent'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Un compte avec cet email existe déjà' },
        { status: 409 }
      )
    }

    // Create new user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
    })

    // Return user data without password
    return NextResponse.json(
      {
        success: true,
        message: 'Compte créé avec succès',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Signup error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la création du compte' },
      { status: 500 }
    )
  }
}
