export function parseResponse(
  text: string
): "CONFIRMED" | "CANCELED" | null {
  const normalizedText = text.toLowerCase().trim();

  const confirmPatterns = ["1", "sim", "confirmo", "ok", "yes", "s"];
  const cancelPatterns = ["2", "não", "nao", "cancelo", "cancelar", "cancel", "n"];

  if (confirmPatterns.includes(normalizedText)) {
    return "CONFIRMED";
  }

  if (cancelPatterns.includes(normalizedText)) {
    return "CANCELED";
  }

  return null;
}
