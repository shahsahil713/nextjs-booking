import { Navbar } from "@/components/common/navbar";
import { getSeatLayout } from "@/lib/actions/db";

type Seat = {
  seatNumber: number;
  isBooked: boolean;
};

export default async function Home() {
  const seats = await getSeatLayout();

  return (
    <main className="h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-2">
        <div className="h-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-3 space-y-3">
          {/* Header Section - Reduced vertical spacing */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">
              Book Your Train Seat
            </h1>
            <p className="text-xs text-gray-600">
              Select from available seats below
            </p>
          </div>

          {/* Coach Info - More compact */}
          <div className="bg-blue-50 rounded-lg p-2 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-semibold text-blue-800">Coach 1</h2>
              <p className="text-xs text-blue-600">80 Total Seats • 12 Rows</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Booked</span>
              </div>
            </div>
          </div>

          {/* Seat Selection - Tighter grid */}
          <div className="space-y-1.5">
            {/* First 11 rows */}
            {Array.from({ length: 11 }, (_, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-2">
                <div className="w-5 text-xs font-medium text-gray-500">
                  R{rowIndex + 1}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 7 }, (_, seatIndex) => {
                    const seatNumber = rowIndex * 7 + seatIndex + 1;
                    const seat = seats.find(
                      (s: Seat) => s.seatNumber === seatNumber
                    );

                    return (
                      <button
                        key={seatIndex}
                        disabled={seat?.isBooked}
                        className={`
                          w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium
                          transition-all duration-200 transform hover:scale-105
                          ${
                            seat?.isBooked
                              ? "bg-red-100 text-red-600 cursor-not-allowed"
                              : "bg-green-100 text-green-600 hover:bg-green-200 hover:shadow-md"
                          }
                        `}
                      >
                        {seatNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Last row with 3 seats */}
            <div className="flex items-center gap-2">
              <div className="w-5 text-xs font-medium text-gray-500">R12</div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 3 }, (_, seatIndex) => {
                  const seatNumber = 77 + seatIndex + 1;
                  const seat = seats.find(
                    (s: Seat) => s.seatNumber === seatNumber
                  );

                  return (
                    <button
                      key={seatIndex}
                      disabled={seat?.isBooked}
                      className={`
                        w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium
                        transition-all duration-200 transform hover:scale-105
                        ${
                          seat?.isBooked
                            ? "bg-red-100 text-red-600 cursor-not-allowed"
                            : "bg-green-100 text-green-600 hover:bg-green-200 hover:shadow-md"
                        }
                      `}
                    >
                      {seatNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons - Smaller padding */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
              Reset
            </button>
            <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              Book Selected Seats
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
