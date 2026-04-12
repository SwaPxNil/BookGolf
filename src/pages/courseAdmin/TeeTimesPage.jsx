import { useEffect, useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import TableActions from "../../components/TableActions";
import Modal from "../../components/Modal";
import { getMyCourse } from "../../api/courseAPI";
import { createTeeTime, deleteTeeTime, getCourseAdminTeeTimes, updateTeeTime } from "../../api/teeTimeAPI";

const dateCell = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

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

export default function TeeTimesPage() {
  const [query, setQuery] = useState("");
  const [teeTimes, setTeeTimes] = useState([]);
  const [myCourse, setMyCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeeTime, setSelectedTeeTime] = useState(null);
  const [openTeeTimeViewer, setOpenTeeTimeViewer] = useState(false);
  const [openTeeTimeEditor, setOpenTeeTimeEditor] = useState(false);
  const [openCreateTeeTime, setOpenCreateTeeTime] = useState(false);
  const [teeTimeSlot, setTeeTimeSlot] = useState("");
  const [teeTimeForm, setTeeTimeForm] = useState({ slotTime: "", status: "AVAILABLE", price: "" });

  const loadTeeTimes = async () => {
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

      setMyCourse(course);
      const teeTimeList = await getCourseAdminTeeTimes(course?.id ? { courseId: course.id } : {});
      setTeeTimes(teeTimeList);
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to load tee times");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeeTimes();
  }, []);

  const filteredTeeTimes = useMemo(
    () =>
      teeTimes.filter((teeTime) =>
        `${teeTime.id} ${teeTime.status} ${teeTime.slotTime}`.toLowerCase().includes(query.toLowerCase())
      ),
    [teeTimes, query]
  );

  const createTeeTimeSlot = async () => {
    if (!myCourse?.id || !teeTimeSlot) {
      window.alert("Course and tee time slot are required.");
      return;
    }

    try {
      await createTeeTime({
        courseId: myCourse.id,
        slotTime: new Date(teeTimeSlot).toISOString(),
      });

      setOpenCreateTeeTime(false);
      setTeeTimeSlot("");
      await loadTeeTimes();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to create tee time");
    }
  };

  const openTeeTimeUpdateModal = (teeTime) => {
    setSelectedTeeTime(teeTime);
    setTeeTimeForm({
      slotTime: toDateTimeLocal(teeTime.slotTime),
      status: teeTime.status || "AVAILABLE",
      price: String(teeTime.price ?? ""),
    });
    setOpenTeeTimeEditor(true);
  };

  const saveTeeTimeUpdate = async () => {
    if (!selectedTeeTime?.id) return;

    try {
      const payload = {
        status: teeTimeForm.status,
      };

      const slotIso = toIsoFromLocal(teeTimeForm.slotTime);
      if (slotIso) {
        payload.slot_time = slotIso;
      }

      if (teeTimeForm.price !== "") {
        payload.price = Number(teeTimeForm.price);
      }

      await updateTeeTime(selectedTeeTime.id, payload);
      setOpenTeeTimeEditor(false);
      await loadTeeTimes();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to update tee time");
    }
  };

  const handleTeeTimeDelete = async (teeTime) => {
    if (!window.confirm(`Delete tee time ${teeTime.id}?`)) return;

    try {
      await deleteTeeTime(teeTime.id);
      await loadTeeTimes();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to delete tee time");
    }
  };

  const columns = [
    { key: "id", header: "Tee Time ID" },
    { key: "slotTime", header: "Slot Time", render: (value) => dateCell(value) },
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
                setSelectedTeeTime(row);
                setOpenTeeTimeViewer(true);
              },
            },
            { label: "Update", onClick: () => openTeeTimeUpdateModal(row) },
            { label: "Delete", tone: "delete", onClick: () => handleTeeTimeDelete(row) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[40px] leading-none text-ink">Tee Times</h2>
          <p className="font-abel text-base text-ink/65">
            {myCourse ? `Course: ${myCourse.name}` : "Your course was not identified from current account."}
          </p>
        </div>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tee times"
            className="font-abel rounded-[24px] border-b border-ink/40 bg-transparent px-4 py-3 text-base outline-none"
          />
          <button
            type="button"
            onClick={() => setOpenCreateTeeTime(true)}
            disabled={!myCourse}
            className={`font-bebas rounded-[24px] px-5 py-3 text-xl ${myCourse ? "bg-[#C7A94A] text-[#192016]" : "bg-black/10 text-ink/40"}`}
          >
            Add Tee Time
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={loading ? [] : filteredTeeTimes} />

      {loading && <p className="font-abel text-sm text-ink/60">Loading tee times...</p>}

      <Modal open={openCreateTeeTime} title="Create Tee Time" onClose={() => setOpenCreateTeeTime(false)}>
        <div className="space-y-4">
          <label className="block">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Slot Time</span>
            <input
              type="datetime-local"
              value={teeTimeSlot}
              onChange={(event) => setTeeTimeSlot(event.target.value)}
              className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            />
          </label>
          <p className="font-abel text-sm text-ink/60">Price is auto-derived from the course tee time price in backend.</p>
          <div className="flex justify-end">
            <button onClick={createTeeTimeSlot} className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]">Save Tee Time</button>
          </div>
        </div>
      </Modal>

      <Modal open={openTeeTimeViewer} title="Tee Time Details" onClose={() => setOpenTeeTimeViewer(false)}>
        {selectedTeeTime && (
          <div className="space-y-2 font-abel text-base text-ink/80">
            <p><span className="font-semibold text-ink">Tee Time ID:</span> {selectedTeeTime.id}</p>
            <p><span className="font-semibold text-ink">Slot:</span> {dateCell(selectedTeeTime.slotTime)}</p>
            <p><span className="font-semibold text-ink">Price:</span> Rs {selectedTeeTime.price.toLocaleString()}</p>
            <p><span className="font-semibold text-ink">Status:</span> {selectedTeeTime.status}</p>
          </div>
        )}
      </Modal>

      <Modal open={openTeeTimeEditor} title="Update Tee Time" onClose={() => setOpenTeeTimeEditor(false)}>
        <div className="space-y-4">
          <label className="block">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Slot Time</span>
            <input
              type="datetime-local"
              value={teeTimeForm.slotTime}
              onChange={(event) => setTeeTimeForm((current) => ({ ...current, slotTime: event.target.value }))}
              className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            />
          </label>

          <label className="block">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Status</span>
            <select
              value={teeTimeForm.status}
              onChange={(event) => setTeeTimeForm((current) => ({ ...current, status: event.target.value }))}
              className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="BOOKED">BOOKED</option>
            </select>
          </label>

          <label className="block">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Price (optional)</span>
            <input
              type="number"
              min="0"
              value={teeTimeForm.price}
              onChange={(event) => setTeeTimeForm((current) => ({ ...current, price: event.target.value }))}
              className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            />
          </label>

          <div className="flex justify-end">
            <button onClick={saveTeeTimeUpdate} className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]">Save Changes</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
