import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { LoginFormData, RegisterFormData } from "@/lib/auth";

export async function getUser(email: string) {
  try {
    const user = await db.user.findUnique({
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

    const user = await db.user.create({
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
    await db.$connect();

    const seats = await db.seat.findMany({
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

      await db.seat.createMany({
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
    await db.$disconnect();
  }
}
