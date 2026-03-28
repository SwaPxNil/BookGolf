import { useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import FormInput from "../../components/FormInput";
import Modal from "../../components/Modal";
import { coaches as coachSeed } from "../../data/dummyData";

export default function CoachesPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [coaches] = useState(coachSeed);

  const filtered = useMemo(
    () => coaches.filter((coach) => `${coach.fullName} ${coach.specialization}`.toLowerCase().includes(query.toLowerCase())),
    [coaches, query]
  );

  const columns = [
    { key: "image", header: "Profile Image", render: (_, row) => <img src={row.image} alt={row.fullName} className="h-12 w-12 rounded-2xl object-cover" /> },
    { key: "fullName", header: "Full Name" },
    { key: "specialization", header: "Specialization" },
    { key: "experienceYears", header: "Experience Years" },
    { key: "rating", header: "Rating" },
    { key: "reviewsCount", header: "Reviews Count" },
    { key: "studentsTaught", header: "Students Taught" },
    { key: "recommendationValue", header: "Recommendation Value" },
    { key: "actions", header: "Actions", render: () => <div className="flex gap-2 text-xs font-semibold text-pine"><button>View</button><button>Edit</button><button className="text-rose-600">Delete</button></div> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[40px] leading-none text-ink">Coaches</h2>
          <p className="font-abel text-base text-ink/65">Manage coaching staff, ratings, and recommendations.</p>
        </div>
        <div className="flex gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search coaches" className="font-abel rounded-[24px] border-b border-ink/40 bg-transparent px-4 py-3 text-base outline-none" />
          <button onClick={() => setOpen(true)} className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]">Add Coach</button>
        </div>
      </div>
      <DataTable columns={columns} data={filtered} />

      <Modal open={open} title="Add Coach" onClose={() => setOpen(false)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput label="Full Name" placeholder="Coach name" />
          <FormInput label="Specialization" placeholder="Swing Mechanics" />
          <FormInput label="Experience Years" placeholder="8" />
          <FormInput label="Rating" placeholder="4.8" />
          <FormInput label="Reviews Count" placeholder="124" />
          <FormInput label="Students Taught" placeholder="210" />
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={() => setOpen(false)} className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]">Save Coach</button>
        </div>
      </Modal>
    </div>
  );
}
