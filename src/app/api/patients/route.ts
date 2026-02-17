import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createPatientSchema } from "@/lib/validations/patient"
import { getAuthSession, unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/auth-helpers"
import type { ApiResponse, PatientResponse } from "@/lib/types/api"

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const where: any = {
      userId: session.user.id,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
    })

    return NextResponse.json<ApiResponse<PatientResponse[]>>({
      data: patients,
    })
  } catch (error) {
    console.error("GET patients error:", error)
    return serverErrorResponse()
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const validation = createPatientSchema.safeParse(body)

    if (!validation.success) {
      return badRequestResponse(validation.error.issues[0].message)
    }

    const patient = await prisma.patient.create({
      data: {
        ...validation.data,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
    })

    return NextResponse.json<ApiResponse<PatientResponse>>(
      { data: patient, message: "Paciente criado com sucesso" },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST patient error:", error)
    return serverErrorResponse()
  }
}
