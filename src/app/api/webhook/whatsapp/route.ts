import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseResponse } from "@/lib/services/webhook-parser";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const remoteJid = body?.data?.key?.remoteJid;
    if (!remoteJid) {
      return NextResponse.json({ received: true });
    }

    const rawPhone = remoteJid.replace("@s.whatsapp.net", "");
    const phone = rawPhone.startsWith("+") ? rawPhone : `+${rawPhone}`;

    const messageText =
      body?.data?.message?.conversation ||
      body?.data?.message?.extendedTextMessage?.text;

    if (!messageText) {
      return NextResponse.json({ received: true });
    }

    const responseType = parseResponse(messageText);
    if (!responseType) {
      return NextResponse.json({ received: true });
    }

    const patient = await prisma.patient.findFirst({
      where: { phone },
    });

    if (!patient) {
      return NextResponse.json({ received: true });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        patientId: patient.id,
        status: "PENDING",
        confirmationSentAt: { not: null },
      },
      orderBy: { dateTime: "asc" },
    });

    if (!appointment) {
      return NextResponse.json({ received: true });
    }

    if (responseType === "CONFIRMED") {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      });
    } else if (responseType === "CANCELED") {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: "CANCELED" },
      });
    }

    await prisma.messageLog.updateMany({
      where: { appointmentId: appointment.id },
      data: {
        response: messageText,
        respondedAt: new Date(),
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error in WhatsApp webhook:", error);
    return NextResponse.json({ received: true });
  }
}
