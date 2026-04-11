import { useEffect, useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import FormInput from "../../components/FormInput";
import Modal from "../../components/Modal";
import TableActions from "../../components/TableActions";
import { createCoach, deleteCoach, getCourseScopedCoaches, updateCoach } from "../../api/coachAPI";
import { getMyCourse } from "../../api/courseAPI";

const emptyCoachForm = {
  fullName: "",
  specialization: "",
  description: "",
  experienceYears: "",
  rating: "",
  reviewsCount: "",
  image: "",
  imageFile: null,
  availabilitySlots: [],
  availabilityDraft: "",
};

const toSlotText = (slot) => {
  if (typeof slot === "string") return slot;
  if (!slot || typeof slot !== "object") return "";

  return (
    slot.dateTime ||
    slot.datetime ||
    slot.slot ||
    slot.value ||
    slot.start ||
    slot.start_time ||
    slot.iso ||
    ""
  );
};

const normalizeSlotIso = (slot) => {
  const value = toSlotText(slot);
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export default function CoachesPage() {
  const [query, setQuery] = useState("");
  const [coaches, setCoaches] = useState([]);
  const [myCourse, setMyCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openEditor, setOpenEditor] = useState(false);
  const [openViewer, setOpenViewer] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [form, setForm] = useState(emptyCoachForm);

  const loadCoaches = async () => {
    setLoading(true);
    try {
      const myCourseResult = await getMyCourse();
      const course = Array.isArray(myCourseResult) ? null : myCourseResult;
      setMyCourse(course);

      const coachList = await getCourseScopedCoaches(course?.id);
      setCoaches(coachList);
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to load coaches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoaches();
  }, []);

  const openCreateModal = () => {
    setSelectedCoach(null);
    setForm(emptyCoachForm);
    setOpenEditor(true);
  };

  const openEditModal = (coach) => {
    setSelectedCoach(coach);
    setForm({
      fullName: coach.fullName || "",
      specialization: coach.specialization || "",
      description: coach.description || "",
      experienceYears: String(coach.experienceYears ?? ""),
      rating: String(coach.rating ?? ""),
      reviewsCount: String(coach.reviewsCount ?? ""),
      image: coach.image || "",
      imageFile: null,
      availabilitySlots: (Array.isArray(coach.availabilitySlots) ? coach.availabilitySlots : [])
        .map(normalizeSlotIso)
        .filter(Boolean),
      availabilityDraft: "",
    });
    setOpenEditor(true);
  };

  const addAvailabilitySlot = () => {
    if (!form.availabilityDraft) {
      window.alert("Select date and time first.");
      return;
    }

    const iso = new Date(form.availabilityDraft).toISOString();
    setForm((current) => {
      if (current.availabilitySlots.includes(iso)) return current;
      return {
        ...current,
        availabilitySlots: [...current.availabilitySlots, iso],
        availabilityDraft: "",
      };
    });
  };

  const removeAvailabilitySlot = (slotToRemove) => {
    setForm((current) => ({
      ...current,
      availabilitySlots: current.availabilitySlots.filter((slot) => slot !== slotToRemove),
    }));
  };

  const openViewModal = (coach) => {
    setSelectedCoach(coach);
    setOpenViewer(true);
  };

  const onImageChange = (event) => {
    const [file] = event.target.files || [];
    if (!file) {
      setForm((current) => ({ ...current, imageFile: null }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        imageFile: file,
        image: typeof reader.result === "string" ? reader.result : current.image,
      }));
    };
    reader.readAsDataURL(file);
  };

  const saveCoach = async () => {
    try {
      const payload = {
        fullName: form.fullName,
        specialization: form.specialization,
        description: form.description,
        experienceYears: Number(form.experienceYears || 0),
        rating: Number(form.rating || 0),
        reviewsCount: Number(form.reviewsCount || 0),
        imageFile: form.imageFile,
        availabilitySlots: form.availabilitySlots,
      };

      if (selectedCoach?.id) {
        await updateCoach(selectedCoach.id, {
          ...payload,
          courseId: selectedCoach.courseId || myCourse?.id,
        });
      } else {
        await createCoach({
          ...payload,
          courseId: myCourse?.id,
        });
      }

      setOpenEditor(false);
      await loadCoaches();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to save coach");
    }
  };

  const removeCoach = async (coach) => {
    if (!window.confirm(`Delete coach ${coach.fullName}?`)) return;

    try {
      await deleteCoach(coach.id);
      await loadCoaches();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to delete coach");
    }
  };

  const filtered = useMemo(
    () =>
      coaches.filter((coach) =>
        `${coach.fullName} ${coach.specialization}`.toLowerCase().includes(query.toLowerCase())
      ),
    [coaches, query]
  );

  const columns = [
    {
      key: "image",
      header: "Profile Image",
      render: (_, row) => (
        <img
          src={row.image || "https://via.placeholder.com/96x96?text=Coach"}
          alt={row.fullName}
          className="h-12 w-12 rounded-2xl object-cover"
        />
      ),
    },
    { key: "fullName", header: "Full Name" },
    { key: "specialization", header: "Specialization" },
    { key: "experienceYears", header: "Experience Years" },
    { key: "rating", header: "Rating" },
    { key: "reviewsCount", header: "Reviews Count" },
    { key: "studentsTaught", header: "Students Taught" },
    { key: "recommendationValue", header: "Recommendation Value" },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <TableActions
          actions={[
            { label: "View", onClick: () => openViewModal(row) },
            { label: "Edit", onClick: () => openEditModal(row) },
            { label: "Delete", tone: "delete", onClick: () => removeCoach(row) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[40px] leading-none text-ink">Coaches</h2>
          <p className="font-abel text-base text-ink/65">
            Manage coaching staff, ratings, and recommendations for {myCourse?.name || "your course"}.
          </p>
        </div>
        <div className="flex gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search coaches" className="font-abel rounded-[24px] border-b border-ink/40 bg-transparent px-4 py-3 text-base outline-none" />
          <button onClick={openCreateModal} className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]">Add Coach</button>
        </div>
      </div>
      <DataTable columns={columns} data={loading ? [] : filtered} />

      {loading && <p className="font-abel text-sm text-ink/60">Loading coaches...</p>}

      <Modal open={openEditor} title={selectedCoach ? "Update Coach" : "Add Coach"} onClose={() => setOpenEditor(false)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput label="Full Name" placeholder="Coach name" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
          <FormInput label="Specialization" placeholder="Swing Mechanics" value={form.specialization} onChange={(event) => setForm((current) => ({ ...current, specialization: event.target.value }))} />
          <FormInput label="Experience Years" placeholder="8" type="number" value={form.experienceYears} onChange={(event) => setForm((current) => ({ ...current, experienceYears: event.target.value }))} />
          <FormInput label="Rating" placeholder="4.8" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))} />
          <FormInput label="Reviews Count" placeholder="124" type="number" value={form.reviewsCount} onChange={(event) => setForm((current) => ({ ...current, reviewsCount: event.target.value }))} />
          <label className="block">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Profile Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition file:mr-3 file:rounded-full file:border-0 file:bg-moss/15 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-moss"
            />
          </label>
          <div className="flex items-end">
            <img
              src={form.image || "https://via.placeholder.com/96x96?text=Coach"}
              alt="Coach preview"
              className="h-16 w-16 rounded-2xl border border-black/10 object-cover"
            />
          </div>
          <label className="block md:col-span-2">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Availability Slots</span>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="datetime-local"
                  value={form.availabilityDraft}
                  onChange={(event) => setForm((current) => ({ ...current, availabilityDraft: event.target.value }))}
                  className="font-abel flex-1 rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
                />
                <button
                  type="button"
                  onClick={addAvailabilitySlot}
                  className="font-bebas rounded-[24px] bg-[#2E4A37] px-5 py-3 text-xl text-white"
                >
                  Add Slot
                </button>
              </div>
              <div className="max-h-44 space-y-2 overflow-y-auto rounded-[18px] border border-black/10 bg-black/5 p-3">
                {form.availabilitySlots.length === 0 ? (
                  <p className="font-abel text-sm text-ink/60">No availability slots added yet.</p>
                ) : (
                  form.availabilitySlots.map((slot) => (
                    <div key={slot} className="flex items-center justify-between gap-3 rounded-[14px] bg-white/70 px-3 py-2">
                      <span className="font-abel text-sm text-ink/80">{new Date(slot).toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => removeAvailabilitySlot(slot)}
                        className="rounded-full border border-[#C24D5A]/30 bg-[#FCECEF] px-3 py-1 text-xs font-semibold text-[#C23749]"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </label>
          <label className="block md:col-span-2">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Description</span>
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={saveCoach} className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]">{selectedCoach ? "Update Coach" : "Save Coach"}</button>
        </div>
      </Modal>

      <Modal open={openViewer} title="Coach Details" onClose={() => setOpenViewer(false)}>
        {selectedCoach && (
          <div className="space-y-2 font-abel text-base text-ink/80">
            <p><span className="font-semibold text-ink">Name:</span> {selectedCoach.fullName}</p>
            <p><span className="font-semibold text-ink">Specialization:</span> {selectedCoach.specialization}</p>
            <p><span className="font-semibold text-ink">Experience:</span> {selectedCoach.experienceYears} years</p>
            <p><span className="font-semibold text-ink">Rating:</span> {selectedCoach.rating}</p>
            <p><span className="font-semibold text-ink">Reviews:</span> {selectedCoach.reviewsCount}</p>
            <p><span className="font-semibold text-ink">Students Taught:</span> {selectedCoach.studentsTaught}</p>
            <p><span className="font-semibold text-ink">Availability Slots:</span> {Array.isArray(selectedCoach.availabilitySlots) ? selectedCoach.availabilitySlots.length : 0}</p>
            <p><span className="font-semibold text-ink">Description:</span> {selectedCoach.description || "-"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
