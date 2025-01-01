import { Navbar } from "@/components/common/navbar";
import { getSeatLayout } from "@/lib/actions/db";
import { BookingForm } from "@/components/booking-form";
import { getServerSession } from "next-auth";

type Seat = {
  seatNumber: number;
  isBooked: boolean;
};

export default async function Home() {
  const session = await getServerSession();
  const user = session?.user;
  const seats = await getSeatLayout();
  const totalSeats = 80;
  const seatsPerRow = 7;
  const lastRowSeats = totalSeats % seatsPerRow;
  return (
    <main className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
      <Navbar username={user?.name ?? ""} />

      <div className="flex-1 container mx-auto p-3 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-3 h-full">
          {/* Seats Section */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-3 overflow-auto min-h-[50vh] lg:min-h-0">
            <div className="flex flex-col gap-2">
              {/* Full rows */}
              {Array.from(
                { length: Math.floor(totalSeats / seatsPerRow) },
                (_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="grid grid-cols-7 gap-1 justify-center"
                  >
                    {Array.from({ length: seatsPerRow }, (_, seatIndex) => {
                      const seatNumber = rowIndex * seatsPerRow + seatIndex + 1;
                      const seat = seats.find(
                        (s: Seat) => s.seatNumber === seatNumber
                      );

                      return (
                        <div
                          key={seatNumber}
                          className={`
                          w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg
                          flex items-center justify-center
                          text-[10px] sm:text-xs md:text-sm font-medium border
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

              {/* Last row with remaining seats */}
              <div className="grid grid-cols-7 gap-1 justify-center">
                {Array.from({ length: lastRowSeats }, (_, index) => {
                  const seatNumber = totalSeats - lastRowSeats + index + 1;
                  const seat = seats.find(
                    (s: Seat) => s.seatNumber === seatNumber
                  );

                  return (
                    <div
                      key={seatNumber}
                      className={`
                        w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg
                        flex items-center justify-center
                        text-[10px] sm:text-xs md:text-sm font-medium border
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
          <div className="lg:w-64 bg-white rounded-xl shadow-lg p-3">
            <BookingForm maxSeats={7} />
          </div>
        </div>
      </div>
    </main>
  );
}
