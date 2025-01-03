import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { RegisterFormData } from "@/lib/auth";

interface SeatRow {
  id: number;
  seatNumber: number;
  rowNumber: number;
  isBooked: boolean;
  userId: string | null;
  bookingId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch user");
  }
}

export async function createUser(data: RegisterFormData) {
  try {
    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
    });
    return { ...user, password: undefined };
  } catch (error) {
    console.error("Database Creation Error:", error);
    throw error; // Re-throw to be caught by the API route
  }
}

export async function getSeatLayout() {
  try {
    // Test connection first
    await prisma.$connect();

    const seats = await prisma.seat.findMany({
      orderBy: {
        seatNumber: "asc",
      },
    });

    // If no seats exist, create the initial layout
    if (seats.length === 0) {
      const seatsToCreate = Array.from({ length: 80 }, (_, i) => ({
        seatNumber: i + 1,
        rowNumber: Math.floor(i / 7) + 1,
        isBooked: false,
      }));

      await prisma.seat.createMany({
        data: seatsToCreate,
      });

      return seatsToCreate;
    }

    return seats;
  } catch (error) {
    console.error("Database Error:", error);
    // Return empty array instead of throwing to prevent page crash
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export async function bookSeats(seatNumbers: number[], userId: string) {
  try {
    const bookingId = Math.random().toString(36).substring(7);

    const updatedSeats = await prisma.seat.updateMany({
      where: {
        seatNumber: {
          in: seatNumbers,
        },
      },
      data: {
        isBooked: true,
        bookingId,
        userId,
      },
    });

    if (updatedSeats.count !== seatNumbers.length) {
      throw new Error("Some seats are no longer available");
    }

    return {
      bookingId,
      seats: seatNumbers,
    };
  } catch (error) {
    console.error("Booking Error:", error);
    throw error;
  }
}

export async function resetBooking(userId: string) {
  try {
    await prisma.seat.updateMany({
      where: {
        userId: userId,
      },
      data: {
        isBooked: false,
        bookingId: null,
        userId: null,
      },
    });
  } catch (error) {
    console.error("Reset Booking Error:", error);
    throw error;
  }
}

export async function markSeatsInProgress(seatNumbers: number[]) {
  return await prisma.seat.updateMany({
    where: { seatNumber: { in: seatNumbers } },
    data: { isBooked: true },
  });
}

export async function findConsecutiveSeatsInRow(
  numberOfSeats: number
): Promise<SeatRow[] | null> {
  try {
    const allSeats = await prisma.seat.findMany({
      where: {
        isBooked: false,
      },
      orderBy: [{ rowNumber: "asc" }, { seatNumber: "asc" }],
    });

    // Priority 1: Find consecutive seats in a single row
    let currentRow = 1;
    let consecutiveInRow: typeof allSeats = [];

    for (const seat of allSeats) {
      if (seat.rowNumber !== currentRow) {
        consecutiveInRow = [];
        currentRow = seat.rowNumber;
      }

      if (
        consecutiveInRow.length === 0 ||
        seat.seatNumber ===
          consecutiveInRow[consecutiveInRow.length - 1].seatNumber + 1
      ) {
        consecutiveInRow.push(seat);
      } else {
        consecutiveInRow = [seat];
      }

      if (consecutiveInRow.length === numberOfSeats) {
        return consecutiveInRow;
      }
    }

    // Priority 2: Find seats in sequence across rows
    let sequentialSeats: typeof allSeats = [];
    for (let i = 0; i < allSeats.length; i++) {
      if (
        sequentialSeats.length === 0 ||
        allSeats[i].seatNumber ===
          sequentialSeats[sequentialSeats.length - 1].seatNumber + 1
      ) {
        sequentialSeats.push(allSeats[i]);
        if (sequentialSeats.length === numberOfSeats) {
          return sequentialSeats;
        }
      } else {
        // If sequence breaks, start new sequence from current seat
        sequentialSeats = [allSeats[i]];
      }
    }

    // Priority 3: Find nearest group of available seats
    if (allSeats.length >= numberOfSeats) {
      // Find the group with minimum distance between first and last seat
      let bestGroup = allSeats.slice(0, numberOfSeats);
      let minDistance =
        bestGroup[numberOfSeats - 1].seatNumber - bestGroup[0].seatNumber;

      for (let i = 1; i <= allSeats.length - numberOfSeats; i++) {
        const group = allSeats.slice(i, i + numberOfSeats);
        const distance =
          group[numberOfSeats - 1].seatNumber - group[0].seatNumber;

        if (distance < minDistance) {
          minDistance = distance;
          bestGroup = group;
        }
      }

      return bestGroup;
    }

    return null;
  } catch (error) {
    console.error("Error finding seats:", error);
    return null;
  }
}
