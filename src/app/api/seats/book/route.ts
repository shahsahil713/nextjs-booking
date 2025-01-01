import { NextResponse } from "next/server";
import {
  bookSeats,
  findConsecutiveSeats,
  markSeatsInProgress,
} from "@/lib/actions/db";

export async function POST(request: Request) {
  try {
    const { numberOfSeats, userId } = await request.json();

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // 1. Find consecutive available seats
    const availableSeats = await findConsecutiveSeats(numberOfSeats);
    console.log("availableSeats::", availableSeats);
    if (!availableSeats) {
      return NextResponse.json(
        { error: "Not enough consecutive seats available" },
        { status: 400 }
      );
    }

    // 2. Mark seats as "in-progress" to prevent race conditions
    await markSeatsInProgress(availableSeats);

    // 3. Process booking
    const bookedSeats = await bookSeats(availableSeats, userId);

    return NextResponse.json({ seats: bookedSeats });
  } catch (error) {
    // If anything fails, release the "in-progress" seats
    return NextResponse.json(
      { error: "Failed to book seats" },
      { status: 500 }
    );
  }
}
