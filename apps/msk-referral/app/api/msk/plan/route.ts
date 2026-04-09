import { buildPlanResponse, planRequestSchema, planResponseSchema } from "@msk/msk-content";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = planRequestSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid plan request.",
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const response = planResponseSchema.parse(buildPlanResponse(parsed.data));

  return Response.json(response);
}
