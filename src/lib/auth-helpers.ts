import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { NextResponse } from "next/server"
import type { ApiResponse } from "./types/api"

export async function getAuthSession() {
  const session = await getServerSession(authOptions)
  return session
}

export function unauthorizedResponse() {
  return NextResponse.json<ApiResponse>(
    { error: "Não autorizado" },
    { status: 401 }
  )
}

export function forbiddenResponse() {
  return NextResponse.json<ApiResponse>(
    { error: "Acesso negado" },
    { status: 403 }
  )
}

export function notFoundResponse(message = "Recurso não encontrado") {
  return NextResponse.json<ApiResponse>(
    { error: message },
    { status: 404 }
  )
}

export function badRequestResponse(message: string) {
  return NextResponse.json<ApiResponse>(
    { error: message },
    { status: 400 }
  )
}

export function serverErrorResponse(message = "Erro interno do servidor") {
  return NextResponse.json<ApiResponse>(
    { error: message },
    { status: 500 }
  )
}
