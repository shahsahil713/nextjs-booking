import { NextResponse } from "next/server";
import { getUser } from "@/lib/actions/db";
import { verifyPassword, loginSchema } from "@/lib/auth";
import { sign } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const user = await getUser(validatedData.email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(validatedData.password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });

    return NextResponse.json({
      user: { ...user, password: undefined },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
