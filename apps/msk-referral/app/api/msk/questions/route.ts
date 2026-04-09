import { buildQuestionSet, intakePayloadSchema, questionSetSchema } from "@msk/msk-content";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = intakePayloadSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid intake payload.",
        details: parsed.error.flatten()
      },
      { status: 400 }
    );
  }

  const questionSet = questionSetSchema.parse(buildQuestionSet(parsed.data));

  return Response.json(questionSet);
}
