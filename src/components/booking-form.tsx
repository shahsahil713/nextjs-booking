"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface BookingFormProps {
  maxSeats: number;
}

export function BookingForm({ maxSeats }: BookingFormProps) {
  const [numberOfSeats, setNumberOfSeats] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastBookedSeats, setLastBookedSeats] = useState<string[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const refreshPage = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleBooking = async () => {
    // Basic input validation

    if (!numberOfSeats || numberOfSeats.trim() === "") {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please enter number of seats",
      });
      return;
    }

    const seatCount = parseInt(numberOfSeats);

    // Validate seat count
    if (isNaN(seatCount) || seatCount < 1) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Please enter a valid number of seats",
      });
      return;
    }

    // Check maximum seat limit
    if (seatCount > maxSeats) {
      toast({
        variant: "destructive",
        title: "Exceeds limit",
        description: `You can only book up to ${maxSeats} seats at a time`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/seats/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numberOfSeats: seatCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      // Update the last booked seats
      setLastBookedSeats(data.seats.seats);

      toast({
        title: "Success",
        description: `Successfully booked seats: ${data.seats.seats.join(
          ", "
        )}`,
      });
      setNumberOfSeats("");

      refreshPage();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Booking failed",
        description:
          error instanceof Error ? error.message : "Failed to book seats",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/seats/reset", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      toast({
        title: "Success",
        description: "Successfully reset your bookings",
      });

      // Refresh the page instead of using callback
      refreshPage();
      setLastBookedSeats([]); // Clear last booked seats on reset
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description:
          error instanceof Error ? error.message : "Failed to reset seats",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm sm:text-base font-semibold text-gray-900">
          Book Seats
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-green-100 border border-green-600"></div>
            <span className="text-[10px] sm:text-xs text-gray-500">
              Available
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-red-100 border border-red-600"></div>
            <span className="text-[10px] sm:text-xs text-gray-500">Booked</span>
          </div>
        </div>
      </div>

      {lastBookedSeats.length > 0 && (
        <div className="p-1.5 bg-green-50 border border-green-200 rounded-md mb-2">
          <p className="text-[10px] sm:text-xs text-green-800">
            <span className="font-medium">Latest booking:</span> Seats{" "}
            {lastBookedSeats.join(", ")}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-gray-700">
            Number of Seats (Max: {maxSeats})
          </label>
          <div className="flex gap-2 mt-1">
            <Input
              type="number"
              min="1"
              max={maxSeats}
              value={numberOfSeats}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setNumberOfSeats("");
                  return;
                }
                const numValue = parseInt(value);
                if (!isNaN(numValue)) {
                  setNumberOfSeats(value);
                }
              }}
              placeholder={`1-${maxSeats} seats`}
              className="flex-1 h-8 text-xs sm:text-sm"
            />
            <Button
              onClick={handleBooking}
              disabled={isLoading}
              className="w-16 h-8 text-xs sm:text-sm"
            >
              {isLoading ? (
                <div className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Book"
              )}
            </Button>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-[10px] sm:text-xs"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset My Bookings
        </Button>
      </div>
    </div>
  );
}
