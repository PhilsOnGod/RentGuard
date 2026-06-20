import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

import { createAiProvider, getAiModelId } from "./ai-gateway.server";

const InputSchema = z.object({
  text: z.string().min(20, "Paste at least 20 characters of the listing").max(8000),
});

const RiskSchema = z.object({
  score: z.number().min(0).max(100).describe("0 = clearly safe, 100 = almost certainly a scam"),
  verdict: z.enum(["safe", "low_risk", "suspicious", "high_risk", "likely_scam"]),
  summary: z.string().describe("One-paragraph plain-English explanation for a Nigerian renter"),
  indicators: z
    .array(
      z.object({
        quote: z
          .string()
          .describe(
            "Exact phrase from the listing that triggered the flag (verbatim, max 160 chars)",
          ),
        category: z.enum([
          "price_too_low",
          "urgency_pressure",
          "advance_payment",
          "no_inspection",
          "impersonation",
          "vague_location",
          "off_platform_contact",
          "fake_documents",
          "grammar_red_flags",
          "other",
        ]),
        severity: z.enum(["low", "medium", "high"]),
        explanation: z.string(),
      }),
    )
    .max(10),
  recommendations: z.array(z.string()).max(6),
});

export type RiskResult = z.infer<typeof RiskSchema>;

export const checkListingRisk = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<RiskResult> => {
    const provider = createAiProvider();
    if (!provider) {
      throw new Error("AI provider not configured");
    }
    const modelId = getAiModelId();
    if (!modelId) {
      throw new Error("AI model ID not configured");
    }
    const model = provider(modelId);

    const system = `You are a Nigerian rental-fraud analyst for RentVerify NG.
You receive raw text from a property listing (either pasted description or fetched HTML/snippet from a URL the user found).
Score how likely the listing is a scam targeted at Nigerian renters.
Look for: unrealistically cheap rent for the area, requests for upfront payment before inspection, refusal to meet in person,
WhatsApp-only contact, impersonation of well-known agencies, fake "C of O" / allocation papers, urgency ("pay today or lose it"),
vague addresses, generic stock photos referenced, foreign-style phrasing or poor grammar.
Be calibrated: most legitimate listings should score under 30. Reserve scores above 70 for clear scam patterns.
Quote phrases verbatim from the listing - never invent quotes.
Write all output in clear plain English suitable for a Nigerian tenant.`;

    const { experimental_output } = await generateText({
      model,
      system,
      prompt: `Analyse this listing:\n\n---\n${data.text}\n---`,
      experimental_output: Output.object({ schema: RiskSchema }),
    });

    return experimental_output;
  });
