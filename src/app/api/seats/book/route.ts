import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  bookSeats,
  findConsecutiveSeatsInRow,
  markSeatsInProgress,
} from "@/lib/actions/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { numberOfSeats } = await request.json();
    const availableSeats = await findConsecutiveSeatsInRow(numberOfSeats);
    if (!availableSeats) {
      return NextResponse.json(
        { error: "Not enough consecutive seats available" },
        { status: 400 }
      );
    }

    const seatNumbers = availableSeats.map((seat) => seat.seatNumber);
    // Mark seats as in-progress
    await markSeatsInProgress(seatNumbers);

    // Book the seats
    const bookedSeats = await bookSeats(seatNumbers, session.user.id);

    return NextResponse.json({ seats: bookedSeats });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to book seats" },
      { status: 500 }
    );
  }
}
