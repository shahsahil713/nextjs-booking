import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  bookSeats,
  findConsecutiveSeats,
  markSeatsInProgress,
} from "@/lib/actions/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { numberOfSeats } = await request.json();

    // 1. Find consecutive available seats
    const availableSeats = await findConsecutiveSeats(numberOfSeats);
    if (!availableSeats) {
      return NextResponse.json(
        { error: "Not enough consecutive seats available" },
        { status: 400 }
      );
    }

    // 2. Mark seats as "in-progress" to prevent race conditions
    await markSeatsInProgress(availableSeats);

    // 3. Process booking - Pass numberOfSeats instead of availableSeats array
    const bookedSeats = await bookSeats(numberOfSeats, session.user.id);

    return NextResponse.json({ seats: bookedSeats });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to book seats" },
      { status: 500 }
    );
  }
}
