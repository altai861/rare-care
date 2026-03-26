import { NextResponse } from "next/server";

import { createDonationSubmission } from "@/lib/db/queries";
import { donationSchema } from "@/lib/validation/forms";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = donationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message || "Invalid donation data." },
      { status: 400 }
    );
  }

  const result = createDonationSubmission(parsed.data);

  return NextResponse.json({
    message: "Donation submission stored successfully.",
    submission: result
  });
}
