import { NextResponse } from "next/server";
import { createUser } from "@/lib/actions/db";
import { registerSchema } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    console.log("Register route hit - POST method");

    // Test database connection
    try {
      await db.$connect();
      console.log("Database connection successful");
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log("Received data:", body);

    try {
      const validatedData = registerSchema.parse(body);
      console.log("Validated data:", validatedData);

      const user = await createUser(validatedData);
      return NextResponse.json({ user });
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}