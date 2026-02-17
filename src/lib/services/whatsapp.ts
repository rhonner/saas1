export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<boolean> {
  const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
  const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
  const EVOLUTION_INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME;

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE_NAME) {
    console.error("Missing Evolution API environment variables");
    return false;
  }

  try {
    const url = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE_NAME}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: phone,
        text: message,
      }),
    });

    if (response.ok) {
      return true;
    }

    console.error(
      `Failed to send WhatsApp message. Status: ${response.status}, StatusText: ${response.statusText}`
    );
    return false;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
}
