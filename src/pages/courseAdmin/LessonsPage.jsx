import { useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import FormInput from "../../components/FormInput";
import Modal from "../../components/Modal";
import { lessons as lessonSeed } from "../../data/dummyData";

export default function LessonsPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [lessons] = useState(lessonSeed);

  const filtered = useMemo(
    () => lessons.filter((lesson) => lesson.title.toLowerCase().includes(query.toLowerCase())),
    [lessons, query]
  );

  const columns = [
    { key: "title", header: "Title" },
    { key: "durationMinutes", header: "Duration Minutes" },
    { key: "price", header: "Price", render: (value) => `Rs ${value.toLocaleString()}` },
    { key: "actions", header: "Actions", render: () => <div className="flex gap-2 text-xs font-semibold text-pine"><button>View</button><button>Edit</button><button className="text-rose-600">Delete</button></div> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[40px] leading-none text-ink">Lessons</h2>
          <p className="font-abel text-base text-ink/65">Create and manage lesson offerings for the course.</p>
        </div>
        <div className="flex gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search lessons" className="font-abel rounded-[24px] border-b border-ink/40 bg-transparent px-4 py-3 text-base outline-none" />
          <button onClick={() => setOpen(true)} className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]">Add Lesson</button>
        </div>
      </div>
      <DataTable columns={columns} data={filtered} />

      <Modal open={open} title="Add Lesson" onClose={() => setOpen(false)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput label="Title" placeholder="Full Swing Analysis" />
          <FormInput label="Duration Minutes" placeholder="60" />
          <FormInput label="Price" placeholder="12000" className="md:col-span-2" />
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={() => setOpen(false)} className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]">Save Lesson</button>
        </div>
      </Modal>
    </div>
  );
}
