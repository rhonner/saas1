import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createPatientSchema } from "@/lib/validations/patient"
import { getAuthSession, unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/auth-helpers"
import type { ApiResponse, PaginatedResponse, PatientResponse } from "@/lib/types/api"

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")

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

    // If pagination params are provided, return paginated response
    if (pageParam) {
      const page = Math.max(1, parseInt(pageParam) || 1)
      const limit = Math.min(100, Math.max(1, parseInt(limitParam || "20") || 20))
      const skip = (page - 1) * limit

      const [patients, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          orderBy: { name: "asc" },
          include: {
            _count: {
              select: { appointments: true },
            },
          },
          skip,
          take: limit,
        }),
        prisma.patient.count({ where }),
      ])

      return NextResponse.json<PaginatedResponse<PatientResponse>>({
        data: patients,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      })
    }

    // No pagination: return all results (backward compatible)
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
