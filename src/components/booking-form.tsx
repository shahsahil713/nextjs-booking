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
  const [isPending, startTransition] = useTransition();

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
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Book Seats</h2>
        <div className="mt-1 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-100 border border-green-600"></div>
            <span className="text-xs text-gray-500">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-600"></div>
            <span className="text-xs text-gray-500">Booked</span>
          </div>
        </div>
      </div>

      {lastBookedSeats.length > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            <span className="font-medium">Latest booking:</span> Seats{" "}
            {lastBookedSeats.join(", ")}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Seats (Max: {maxSeats})
          </label>
          <div className="flex gap-2">
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
              className="flex-1"
            />
            <Button
              onClick={handleBooking}
              disabled={isLoading}
              className="w-16"
            >
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Book"
              )}
            </Button>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleReset}
          disabled={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset My Bookings"}
        </Button>
      </div>
    </div>
  );
}
