import { Navbar } from "@/components/common/navbar";
import { getSeatLayout } from "@/lib/actions/db";
import { BookingForm } from "@/components/booking-form";

type Seat = {
  seatNumber: number;
  isBooked: boolean;
};

export default async function Home() {
  const seats = await getSeatLayout();
  const totalSeats = 80;
  const seatsPerRow = 7;
  const lastRowSeats = totalSeats % seatsPerRow;

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="flex-1 container mx-auto p-4">
        <h1 className="text-xl font-bold text-center mb-4">
          Train Ticket Booking
        </h1>

        <div className="flex gap-4">
          {/* Seats Section */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-4">
            <div className="flex flex-col gap-4">
              {/* Full rows */}
              {Array.from(
                { length: Math.floor(totalSeats / seatsPerRow) },
                (_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
                      const seatNumber = rowIndex * seatsPerRow + seatIndex + 1;
                      const seat = seats.find(
                        (s: Seat) => s.seatNumber === seatNumber
                      );

                      return (
                        <div
                          key={seatNumber}
                          className={`
                          w-10 h-10 rounded-lg
                          flex items-center justify-center
                          text-sm font-medium border
                          ${
                            seat?.isBooked
                              ? "bg-red-100 text-red-600 border-red-200"
                              : "bg-green-100 text-green-600 border-green-200"
                          }
                        `}
                        >
                          {seatNumber}
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* Last row with 3 seats */}
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: lastRowSeats }, (_, index) => {
                  const seatNumber = totalSeats - lastRowSeats + index + 1;
                  const seat = seats.find(
                    (s: Seat) => s.seatNumber === seatNumber
                  );

                  return (
                    <div
                      key={seatNumber}
                      className={`
                        w-10 h-10 rounded-lg
                        flex items-center justify-center
                        text-sm font-medium border
                        ${
                          seat?.isBooked
                            ? "bg-red-100 text-red-600 border-red-200"
                            : "bg-green-100 text-green-600 border-green-200"
                        }
                      `}
                    >
                      {seatNumber}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Booking Form Section */}
          <div className="w-72 bg-white rounded-xl shadow-lg p-4">
            <BookingForm maxSeats={7} />
          </div>
        </div>
      </div>
    </main>
  );
}
