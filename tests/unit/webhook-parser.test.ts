import { describe, it, expect } from "vitest";
import { parseResponse } from "@/lib/services/webhook-parser";

describe("parseResponse - CONFIRMED responses", () => {
  it('parses "1" as CONFIRMED', () => {
    expect(parseResponse("1")).toBe("CONFIRMED");
  });

  it('parses "sim" as CONFIRMED', () => {
    expect(parseResponse("sim")).toBe("CONFIRMED");
  });

  it('parses "Sim" as CONFIRMED (case insensitive)', () => {
    expect(parseResponse("Sim")).toBe("CONFIRMED");
  });

  it('parses "SIM" as CONFIRMED', () => {
    expect(parseResponse("SIM")).toBe("CONFIRMED");
  });

  it('parses "confirmo" as CONFIRMED', () => {
    expect(parseResponse("confirmo")).toBe("CONFIRMED");
  });

  it('parses "ok" as CONFIRMED', () => {
    expect(parseResponse("ok")).toBe("CONFIRMED");
  });

  it('parses "yes" as CONFIRMED', () => {
    expect(parseResponse("yes")).toBe("CONFIRMED");
  });

  it('parses "s" as CONFIRMED', () => {
    expect(parseResponse("s")).toBe("CONFIRMED");
  });

  it('handles whitespace around "1"', () => {
    expect(parseResponse("  1  ")).toBe("CONFIRMED");
  });

  it('handles whitespace around "sim"', () => {
    expect(parseResponse("  sim  ")).toBe("CONFIRMED");
  });
});

describe("parseResponse - CANCELED responses", () => {
  it('parses "2" as CANCELED', () => {
    expect(parseResponse("2")).toBe("CANCELED");
  });

  it('parses "não" as CANCELED', () => {
    expect(parseResponse("não")).toBe("CANCELED");
  });

  it('parses "nao" as CANCELED', () => {
    expect(parseResponse("nao")).toBe("CANCELED");
  });

  it('parses "cancelo" as CANCELED', () => {
    expect(parseResponse("cancelo")).toBe("CANCELED");
  });

  it('parses "cancelar" as CANCELED', () => {
    expect(parseResponse("cancelar")).toBe("CANCELED");
  });

  it('parses "n" as CANCELED', () => {
    expect(parseResponse("n")).toBe("CANCELED");
  });

  it('parses "cancel" as CANCELED', () => {
    expect(parseResponse("cancel")).toBe("CANCELED");
  });

  it('handles case insensitivity for "Não"', () => {
    expect(parseResponse("Não")).toBe("CANCELED");
  });

  it('handles case insensitivity for "NAO"', () => {
    expect(parseResponse("NAO")).toBe("CANCELED");
  });
});

describe("parseResponse - NULL responses", () => {
  it('returns null for unrecognized text "maybe"', () => {
    expect(parseResponse("maybe")).toBe(null);
  });

  it("returns null for empty string", () => {
    expect(parseResponse("")).toBe(null);
  });

  it("returns null for whitespace only", () => {
    expect(parseResponse("   ")).toBe(null);
  });

  it("returns null for random text", () => {
    expect(parseResponse("hello world")).toBe(null);
  });

  it("returns null for partial matches", () => {
    expect(parseResponse("sim1")).toBe(null);
  });

  it("returns null for numbers other than 1 and 2", () => {
    expect(parseResponse("3")).toBe(null);
    expect(parseResponse("0")).toBe(null);
  });
});
