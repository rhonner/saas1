import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import * as bcrypt from "bcryptjs"
import { registerSchema } from "@/lib/validations/auth"
import type { ApiResponse } from "@/lib/types/api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        { error: "Dados inválidos", message: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { email, password, name, clinicName, avgAppointmentValue } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { error: "Email já cadastrado" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        clinicName,
        avgAppointmentValue: avgAppointmentValue || 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        clinicName: true,
        avgAppointmentValue: true,
        createdAt: true,
      },
    })

    // Create default settings
    await prisma.settings.create({
      data: {
        userId: user.id,
      },
    })

    return NextResponse.json<ApiResponse>(
      { data: user, message: "Usuário criado com sucesso" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json<ApiResponse>(
      { error: "Erro ao criar usuário" },
      { status: 500 }
    )
  }
}
