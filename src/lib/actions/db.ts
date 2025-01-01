import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { LoginFormData, RegisterFormData } from "@/lib/auth";

interface Seat {
  seatNumber: number;
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

export async function bookSeats(numberOfSeats: number, userId: string) {
  try {
    // Find first available consecutive seats
    const availableSeats = await prisma.seat.findMany({
      where: {
        userId: null,
        bookingId: null,
      },
      orderBy: {
        seatNumber: "asc",
      },
      take: numberOfSeats,
    });

    if (availableSeats.length < numberOfSeats) {
      throw new Error("Not enough consecutive seats available");
    }
    console.log("availableSeats::", availableSeats);
    // Book the seats
    const bookingId = Math.random().toString(36).substring(7);
    await prisma.seat.updateMany({
      where: {
        seatNumber: {
          in: availableSeats.map((seat: Seat) => seat.seatNumber),
        },
      },
      data: {
        isBooked: true,
        bookingId,
        userId,
      },
    });

    return {
      bookingId,
      seats: availableSeats.map((seat: Seat) => seat.seatNumber),
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

export async function findConsecutiveSeats(count: number) {
  try {
    const seats = await prisma.seat.findMany({
      where: { isBooked: false },
      orderBy: { seatNumber: "asc" },
    });

    for (let i = 0; i <= seats.length - count; i++) {
      const consecutive = seats.slice(i, i + count);
      if (
        consecutive.length === count &&
        consecutive.every(
          (seat: { seatNumber: number }, index: number) =>
            seat.seatNumber === consecutive[0].seatNumber + index
        )
      ) {
        return consecutive.map(
          (seat: { seatNumber: number }) => seat.seatNumber
        );
      }
    }
    return null;
  } catch (error) {
    console.error("Error finding consecutive seats:", error);
    return null;
  }
}

export async function markSeatsInProgress(seatNumbers: number[]) {
  return await prisma.seat.updateMany({
    where: { seatNumber: { in: seatNumbers } },
    data: { isBooked: true },
  });
}
