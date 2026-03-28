import { useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import FormInput from "../../components/FormInput";
import Modal from "../../components/Modal";
import { courses as courseSeed } from "../../data/dummyData";

export default function SuperAdminCoursesPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [courses] = useState(courseSeed);

  const filtered = useMemo(
    () => courses.filter((course) => `${course.name} ${course.location}`.toLowerCase().includes(query.toLowerCase())),
    [courses, query]
  );

  const columns = [
    { key: "name", header: "Course Name" },
    { key: "location", header: "Location" },
    { key: "totalCoaches", header: "Total Coaches" },
    { key: "totalCaddies", header: "Total Caddies" },
    { key: "totalLessons", header: "Total Lessons" },
    { key: "totalRevenue", header: "Total Revenue", render: (value) => `Rs ${value.toLocaleString()}` },
    { key: "actions", header: "Actions", render: () => <div className="flex gap-2 text-xs font-semibold text-pine"><button>View</button><button className="text-rose-600">Delete</button></div> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[40px] leading-none text-ink">Courses</h2>
          <p className="font-abel text-base text-ink/65">Oversee every golf course connected to the platform.</p>
        </div>
        <div className="flex gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses" className="font-abel rounded-[24px] border-b border-ink/40 bg-transparent px-4 py-3 text-base outline-none" />
          <button onClick={() => setOpen(true)} className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]">Add Course</button>
        </div>
      </div>
      <DataTable columns={columns} data={filtered} />

      <Modal open={open} title="Add Course" onClose={() => setOpen(false)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput label="Course Name" placeholder="Course Name" />
          <FormInput label="Location" placeholder="Kathmandu" />
          <FormInput label="Total Coaches" placeholder="8" />
          <FormInput label="Total Caddies" placeholder="12" />
          <FormInput label="Total Lessons" placeholder="16" />
          <FormInput label="Revenue" placeholder="560000" />
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={() => setOpen(false)} className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]">Save Course</button>
        </div>
      </Modal>
    </div>
  );
}
