import { useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import { bookings as bookingSeed } from "../../data/dummyData";

export default function BookingsPage() {
  const [query, setQuery] = useState("");
  const [bookings] = useState(bookingSeed);

  const filtered = useMemo(
    () => bookings.filter((booking) => `${booking.id} ${booking.userName} ${booking.type}`.toLowerCase().includes(query.toLowerCase())),
    [bookings, query]
  );

  const columns = [
    { key: "id", header: "Booking ID" },
    { key: "userName", header: "User Name" },
    { key: "type", header: "Type" },
    { key: "assignedTo", header: "Assigned Coach/Caddie" },
    { key: "date", header: "Date" },
    { key: "price", header: "Price", render: (value) => `Rs ${value.toLocaleString()}` },
    { key: "status", header: "Status" },
    { key: "actions", header: "Actions", render: () => <div className="flex gap-2 text-xs font-semibold text-pine"><button>View</button><button>Update</button><button className="text-rose-600">Delete</button></div> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[40px] leading-none text-ink">Bookings</h2>
          <p className="font-abel text-base text-ink/65">Track reservations across course, lessons, and caddies.</p>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search bookings" className="font-abel rounded-[24px] border-b border-ink/40 bg-transparent px-4 py-3 text-base outline-none" />
      </div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
