import { explainPlan, refineRequestSchema, refineResponseSchema } from "@msk/msk-content";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = refineRequestSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid explanation request.",
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const response = refineResponseSchema.parse(
    explainPlan(parsed.data.caseContext, parsed.data.currentPlan, parsed.data.userQuestion)
  );

  return Response.json(response);
}
