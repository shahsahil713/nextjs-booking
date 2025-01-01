import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { LoginFormData, RegisterFormData } from "@/lib/auth";

interface Seat {
  seatNumber: number;
  isBooked: boolean;
}

interface SeatRow {
  id: string;
  seatNumber: number;
  rowNumber: number;
  isBooked: boolean;
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

export async function findConsecutiveSeatsInRow(numberOfSeats: number) {
  try {
    const allSeats = await prisma.seat.findMany({
      where: {
        isBooked: false,
      },
      orderBy: [{ rowNumber: "asc" }, { seatNumber: "asc" }],
    });
    // Group seats by row
    const seatsByRow = allSeats.reduce(
      (acc: { [key: number]: SeatRow[] }, seat: SeatRow) => {
        if (!acc[seat.rowNumber]) {
          acc[seat.rowNumber] = [];
        }
        acc[seat.rowNumber].push(seat);
        return acc;
      },
      {}
    );

    // Find first row with enough consecutive seats
    for (const rowNumber in seatsByRow) {
      const rowSeats = seatsByRow[rowNumber];

      // Skip if row doesn't have enough seats
      if (rowSeats.length < numberOfSeats) continue;

      let consecutiveSeats = [];
      let currentStreak = [];
      let startOfRow = (parseInt(rowNumber) - 1) * 7 + 1;

      for (let i = 0; i < rowSeats.length; i++) {
        const expectedSeatNumber =
          startOfRow + (currentStreak.length > 0 ? currentStreak.length : 0);

        if (rowSeats[i].seatNumber === expectedSeatNumber) {
          currentStreak.push(rowSeats[i]);
        } else {
          currentStreak = [rowSeats[i]];
          startOfRow = rowSeats[i].seatNumber;
        }

        if (currentStreak.length === numberOfSeats) {
          consecutiveSeats = currentStreak;
          break;
        }
      }

      if (consecutiveSeats.length === numberOfSeats) {
        return consecutiveSeats;
      }
    }

    // If no consecutive seats in a row, return null
    return null;
  } catch (error) {
    console.error("Error finding consecutive seats:", error);
    return null;
  }
}

export async function findConsecutiveSeats(count: number) {
  try {
    const seats = await prisma.seat.findMany({
      where: { isBooked: false },
      orderBy: [{ rowNumber: "asc" }, { seatNumber: "asc" }],
    });

    // Group seats by row
    const seatsByRow = seats.reduce(
      (acc: { [key: number]: Seat[] }, seat: any) => {
        if (!acc[seat.rowNumber]) {
          acc[seat.rowNumber] = [];
        }
        acc[seat.rowNumber].push(seat);
        return acc;
      },
      {}
    );

    // Check each row for enough consecutive seats
    for (const rowNumber in seatsByRow) {
      const rowSeats = seatsByRow[rowNumber];

      // Skip if row doesn't have enough seats
      if (rowSeats.length < count) continue;

      // Find consecutive seats in current row
      let consecutiveSeats = [];
      let currentStreak = [];
      let startOfRow = (parseInt(rowNumber) - 1) * 7 + 1; // Calculate first seat number of the row

      for (let i = 0; i < rowSeats.length; i++) {
        const expectedSeatNumber =
          startOfRow + (currentStreak.length > 0 ? currentStreak.length : 0);

        if (rowSeats[i].seatNumber === expectedSeatNumber) {
          currentStreak.push(rowSeats[i].seatNumber);
        } else {
          currentStreak = [rowSeats[i].seatNumber];
          startOfRow = rowSeats[i].seatNumber;
        }

        if (currentStreak.length === count) {
          consecutiveSeats = currentStreak;
          break;
        }
      }

      // If we found enough consecutive seats in this row, return them
      if (consecutiveSeats.length === count) {
        return consecutiveSeats;
      }
    }

    // If no row has enough consecutive seats, return null
    return null;
  } catch (error) {
    console.error("Error finding consecutive seats:", error);
    return null;
  }
}
