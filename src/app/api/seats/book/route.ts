import { NextResponse } from "next/server";
import { bookSeats } from "@/lib/actions/db";

export async function POST(request: Request) {
  try {
    const { numberOfSeats, userId } = await request.json();

    if (!numberOfSeats || numberOfSeats < 1) {
      return NextResponse.json(
        { error: "Invalid number of seats" },
        { status: 400 }
      );
    }

    const booking = await bookSeats(numberOfSeats, userId);
    return NextResponse.json(booking);
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to book seats" },
      { status: 500 }
    );
  }
}
