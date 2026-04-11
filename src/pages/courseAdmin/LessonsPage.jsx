import { useEffect, useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import FormInput from "../../components/FormInput";
import Modal from "../../components/Modal";
import TableActions from "../../components/TableActions";
import {
  createCoachLesson,
  deleteCoachLesson,
  getCoachLessons,
  getCourseScopedCoaches,
  updateCoachLesson,
} from "../../api/coachAPI";
import { getMyCourse } from "../../api/courseAPI";

const emptyForm = {
  coachId: "",
  title: "",
  durationMinutes: "",
  price: "",
};

export default function LessonsPage() {
  const [query, setQuery] = useState("");
  const [myCourse, setMyCourse] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openEditor, setOpenEditor] = useState(false);
  const [openViewer, setOpenViewer] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const coachNameById = useMemo(
    () =>
      coaches.reduce((accumulator, coach) => {
        accumulator[coach.id] = coach.fullName;
        return accumulator;
      }, {}),
    [coaches]
  );

  const loadPageData = async () => {
    setLoading(true);

    try {
      const courseResult = await getMyCourse();
      const course = Array.isArray(courseResult) ? null : courseResult;
      setMyCourse(course);

      const coachList = await getCourseScopedCoaches(course?.id);
      setCoaches(coachList);

      const lessonGroups = await Promise.all(
        coachList.map(async (coach) => {
          try {
            const coachLessons = await getCoachLessons(coach.id);
            return coachLessons.map((lesson) => ({
              ...lesson,
              coachId: coach.id,
              coachName: coach.fullName,
            }));
          } catch {
            return (coach.lessons || []).map((lesson) => ({
              ...lesson,
              coachId: coach.id,
              coachName: coach.fullName,
            }));
          }
        })
      );

      setLessons(lessonGroups.flat());
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const filtered = useMemo(
    () =>
      lessons.filter((lesson) =>
        `${lesson.title} ${lesson.coachName || ""}`.toLowerCase().includes(query.toLowerCase())
      ),
    [lessons, query]
  );

  const openCreateModal = () => {
    setSelectedLesson(null);
    setForm((current) => ({
      ...emptyForm,
      coachId: current.coachId || coaches[0]?.id || "",
    }));
    setOpenEditor(true);
  };

  const openEditModal = (lesson) => {
    setSelectedLesson(lesson);
    setForm({
      coachId: lesson.coachId || "",
      title: lesson.title || "",
      durationMinutes: String(lesson.durationMinutes ?? ""),
      price: String(lesson.price ?? ""),
    });
    setOpenEditor(true);
  };

  const saveLesson = async () => {
    if (!form.coachId) {
      window.alert("Coach is required.");
      return;
    }

    const payload = {
      title: form.title,
      durationMinutes: Number(form.durationMinutes || 0),
      price: Number(form.price || 0),
    };

    setSaving(true);
    try {
      if (selectedLesson?.id) {
        await updateCoachLesson(form.coachId, selectedLesson.id, {
          id: selectedLesson.id,
          ...payload,
        });
      } else {
        await createCoachLesson(form.coachId, payload);
      }

      setOpenEditor(false);
      await loadPageData();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to save lesson");
    } finally {
      setSaving(false);
    }
  };

  const removeLesson = async (lesson) => {
    if (!window.confirm(`Delete lesson ${lesson.title}?`)) return;

    try {
      await deleteCoachLesson(lesson.coachId, lesson.id);
      await loadPageData();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to delete lesson");
    }
  };

  const columns = [
    { key: "title", header: "Title" },
    { key: "coachName", header: "Coach" },
    { key: "durationMinutes", header: "Duration (min)" },
    { key: "price", header: "Price", render: (value) => `Rs ${Number(value || 0).toLocaleString()}` },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <TableActions
          actions={[
            {
              label: "View",
              onClick: () => {
                setSelectedLesson(row);
                setOpenViewer(true);
              },
            },
            { label: "Edit", onClick: () => openEditModal(row) },
            { label: "Delete", tone: "delete", onClick: () => removeLesson(row) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[40px] leading-none text-ink">Lessons</h2>
          <p className="font-abel text-base text-ink/65">
            Manage lesson offerings by coach for {myCourse?.name || "your course"}.
          </p>
        </div>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search lessons"
            className="font-abel rounded-[24px] border-b border-ink/40 bg-transparent px-4 py-3 text-base outline-none"
          />
          <button
            onClick={openCreateModal}
            disabled={coaches.length === 0}
            className={`font-bebas rounded-[24px] px-5 py-3 text-xl ${
              coaches.length > 0 ? "bg-[#C7A94A] text-[#192016]" : "bg-black/10 text-ink/40"
            }`}
          >
            Add Lesson
          </button>
        </div>
      </div>

      {coaches.length === 0 && !loading && (
        <p className="font-abel text-sm text-ink/65">
          Add coaches first to create lessons for this course.
        </p>
      )}

      <DataTable columns={columns} data={loading ? [] : filtered} />
      {loading && <p className="font-abel text-sm text-ink/60">Loading lessons...</p>}

      <Modal
        open={openEditor}
        title={selectedLesson ? "Update Lesson" : "Add Lesson"}
        onClose={() => setOpenEditor(false)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Coach</span>
            <select
              value={form.coachId}
              onChange={(event) => setForm((current) => ({ ...current, coachId: event.target.value }))}
              className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            >
              <option value="">Select a coach</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.fullName}
                </option>
              ))}
            </select>
          </label>

          <FormInput
            label="Title"
            placeholder="Full Swing Analysis"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
          <FormInput
            label="Duration Minutes"
            type="number"
            placeholder="60"
            value={form.durationMinutes}
            onChange={(event) =>
              setForm((current) => ({ ...current, durationMinutes: event.target.value }))
            }
          />
          <FormInput
            label="Price"
            type="number"
            placeholder="12000"
            value={form.price}
            className="md:col-span-2"
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveLesson}
            disabled={saving}
            className={`font-bebas rounded-[24px] px-5 py-3 text-xl ${
              saving ? "bg-black/10 text-ink/40" : "bg-[#C7A94A] text-[#192016]"
            }`}
          >
            {saving ? "Saving..." : selectedLesson ? "Update Lesson" : "Save Lesson"}
          </button>
        </div>
      </Modal>

      <Modal open={openViewer} title="Lesson Details" onClose={() => setOpenViewer(false)}>
        {selectedLesson && (
          <div className="space-y-2 font-abel text-base text-ink/80">
            <p>
              <span className="font-semibold text-ink">Title:</span> {selectedLesson.title}
            </p>
            <p>
              <span className="font-semibold text-ink">Coach:</span>{" "}
              {selectedLesson.coachName || coachNameById[selectedLesson.coachId] || "-"}
            </p>
            <p>
              <span className="font-semibold text-ink">Duration:</span> {selectedLesson.durationMinutes} minutes
            </p>
            <p>
              <span className="font-semibold text-ink">Price:</span> Rs {Number(selectedLesson.price || 0).toLocaleString()}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
