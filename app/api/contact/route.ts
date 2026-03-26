import { NextResponse } from "next/server";

import { createContactMessage } from "@/lib/db/queries";
import { contactSchema } from "@/lib/validation/forms";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = contactSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "Invalid contact data." },
      { status: 400 }
    );
  }

  const result = createContactMessage(parsed.data);

  return NextResponse.json({
    message: "Contact message stored successfully.",
    submission: result
  });
}
