import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { AppointmentStatus } from "@/generated/prisma/client"
import { createAppointmentSchema } from "@/lib/validations/appointment"
import { getAuthSession, unauthorizedResponse, badRequestResponse, serverErrorResponse } from "@/lib/auth-helpers"
import type { ApiResponse, AppointmentResponse } from "@/lib/types/api"

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const status = searchParams.get("status")
    const patientId = searchParams.get("patientId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {
      userId: session.user.id,
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      where.dateTime = {
        gte: startOfDay,
        lte: endOfDay,
      }
    } else if (startDate && endDate) {
      where.dateTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.dateTime = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      where.dateTime = {
        lte: new Date(endDate),
      }
    }

    if (status && Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
      where.status = status
    }

    if (patientId) {
      where.patientId = patientId
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        messageLogs: {
          orderBy: { sentAt: "desc" },
        },
      },
      orderBy: { dateTime: "asc" },
    })

    return NextResponse.json<ApiResponse<AppointmentResponse[]>>({
      data: appointments,
    })
  } catch (error) {
    console.error("GET appointments error:", error)
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
    const validation = createAppointmentSchema.safeParse(body)

    if (!validation.success) {
      return badRequestResponse(validation.error.issues[0].message)
    }

    const { patientId, dateTime, notes } = validation.data

    // Verify patient belongs to user
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        userId: session.user.id,
      },
    })

    if (!patient) {
      return badRequestResponse("Paciente não encontrado")
    }

    // Check for conflicting appointments
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        userId: session.user.id,
        dateTime: new Date(dateTime),
        status: { notIn: ["CANCELED", "NO_SHOW"] },
      },
    })

    if (conflictingAppointment) {
      return badRequestResponse("Já existe um agendamento neste horário")
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        userId: session.user.id,
        dateTime: new Date(dateTime),
        notes,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        messageLogs: true,
      },
    })

    return NextResponse.json<ApiResponse<AppointmentResponse>>(
      { data: appointment, message: "Agendamento criado com sucesso" },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST appointment error:", error)
    return serverErrorResponse()
  }
}
