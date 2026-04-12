import { useEffect, useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import TableActions from "../../components/TableActions";
import Modal from "../../components/Modal";
import { cancelBooking, deleteBooking, getCourseBookings, updateBooking } from "../../api/bookingAPI";
import { getMyCourse } from "../../api/courseAPI";

const dateCell = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

export default function BookingsPage() {
  const [query, setQuery] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openBookingViewer, setOpenBookingViewer] = useState(false);
  const [openBookingEditor, setOpenBookingEditor] = useState(false);
  const [bookingForm, setBookingForm] = useState({ status: "CONFIRMED", adminNotes: "", slot: "" });

  const toDateTimeLocal = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const toIsoFromLocal = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
  };

  const loadPageData = async () => {
    setLoading(true);
    try {
      let course = null;
      try {
        const myCourseResult = await getMyCourse();
        course = Array.isArray(myCourseResult) ? null : myCourseResult;
      } catch (error) {
        if (error?.response?.status !== 404) {
          throw error;
        }
      }

      const bookingList = await getCourseBookings(course?.id);
      setBookings(bookingList);
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to load booking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const filtered = useMemo(
    () =>
      bookings.filter((booking) =>
        `${booking.id} ${booking.userName} ${booking.type} ${booking.assignedTo}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [bookings, query]
  );

  const openBookingUpdateModal = (booking) => {
    setSelectedBooking(booking);
    setBookingForm({
      status: booking?.raw?.status || "CONFIRMED",
      adminNotes: booking?.raw?.admin_notes || "",
      slot: toDateTimeLocal(booking?.raw?.slot),
    });
    setOpenBookingEditor(true);
  };

  const saveBookingUpdate = async () => {
    if (!selectedBooking?.id) return;

    try {
      const payload = {
        status: bookingForm.status,
        admin_notes: bookingForm.adminNotes,
      };

      const slotIso = toIsoFromLocal(bookingForm.slot);
      if (slotIso) {
        payload.slot = slotIso;
      }

      await updateBooking(selectedBooking.id, payload);
      setOpenBookingEditor(false);
      await loadPageData();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to update booking");
    }
  };

  const handleBookingCancel = async (booking) => {
    if (!window.confirm(`Cancel booking ${booking.id}?`)) return;

    try {
      await cancelBooking(booking.id, {
        admin_notes: "Cancelled by admin",
        bookingType: booking.bookingType,
      });
      await loadPageData();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to cancel booking");
    }
  };

  const handleBookingDelete = async (booking) => {
    if (!window.confirm(`Delete booking ${booking.id}? This cannot be undone.`)) return;

    try {
      await deleteBooking(booking.id, { bookingType: booking.bookingType });
      await loadPageData();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to delete booking");
    }
  };


  const columns = [
    { key: "id", header: "Booking ID" },
    { key: "userName", header: "User Name" },
    { key: "type", header: "Type" },
    { key: "assignedTo", header: "Assigned Coach/Caddie" },
    { key: "date", header: "Date", render: (value) => dateCell(value) },
    { key: "price", header: "Price", render: (value) => `Rs ${value.toLocaleString()}` },
    { key: "status", header: "Status" },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <TableActions
          actions={[
            {
              label: "View",
              onClick: () => {
                setSelectedBooking(row);
                setOpenBookingViewer(true);
              },
            },
            { label: "Update", onClick: () => openBookingUpdateModal(row) },
            { label: "Cancel", tone: "update", onClick: () => handleBookingCancel(row) },
            { label: "Delete", tone: "delete", onClick: () => handleBookingDelete(row) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[40px] leading-none text-ink">Bookings</h2>
          <p className="font-abel text-base text-ink/65">View and manage reservation visibility across the course.</p>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search bookings" className="font-abel rounded-[24px] border-b border-ink/40 bg-transparent px-4 py-3 text-base outline-none" />
      </div>

      <DataTable columns={columns} data={loading ? [] : filtered} />

      {loading && <p className="font-abel text-sm text-ink/60">Loading bookings...</p>}

      <Modal open={openBookingViewer} title="Booking Details" onClose={() => setOpenBookingViewer(false)}>
        {selectedBooking && (
          <div className="space-y-2 font-abel text-base text-ink/80">
            <p><span className="font-semibold text-ink">Booking ID:</span> {selectedBooking.id}</p>
            <p><span className="font-semibold text-ink">User:</span> {selectedBooking.userName} ({selectedBooking.userEmail})</p>
            <p><span className="font-semibold text-ink">Type:</span> {selectedBooking.type}</p>
            <p><span className="font-semibold text-ink">Assigned To:</span> {selectedBooking.assignedTo}</p>
            <p><span className="font-semibold text-ink">Date:</span> {dateCell(selectedBooking.date)}</p>
            <p><span className="font-semibold text-ink">Status:</span> {selectedBooking.status}</p>
          </div>
        )}
      </Modal>

      <Modal open={openBookingEditor} title="Update Booking" onClose={() => setOpenBookingEditor(false)}>
        <div className="space-y-4">
          <label className="block">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Status</span>
            <select
              value={bookingForm.status}
              onChange={(event) => setBookingForm((current) => ({ ...current, status: event.target.value }))}
              className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            >
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </label>
          <label className="block">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Slot</span>
            <input
              type="datetime-local"
              value={bookingForm.slot}
              onChange={(event) => setBookingForm((current) => ({ ...current, slot: event.target.value }))}
              className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            />
          </label>
          <label className="block">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Admin Notes</span>
            <textarea
              rows="3"
              value={bookingForm.adminNotes}
              onChange={(event) => setBookingForm((current) => ({ ...current, adminNotes: event.target.value }))}
              className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            />
          </label>
          <div className="flex justify-end">
            <button onClick={saveBookingUpdate} className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]">Save Changes</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
