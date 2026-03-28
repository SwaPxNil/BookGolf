import { useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import { caddies as caddieSeed } from "../../data/dummyData";

export default function CaddiesPage() {
  const [query, setQuery] = useState("");
  const [caddies] = useState(caddieSeed);

  const filtered = useMemo(
    () => caddies.filter((item) => `${item.fullName} ${item.specialty}`.toLowerCase().includes(query.toLowerCase())),
    [caddies, query]
  );

  const columns = [
    { key: "image", header: "Profile Image", render: (_, row) => <img src={row.image} alt={row.fullName} className="h-12 w-12 rounded-2xl object-cover" /> },
    { key: "fullName", header: "Full Name" },
    { key: "description", header: "Description" },
    { key: "experience", header: "Experience" },
    { key: "experienceYears", header: "Experience Years" },
    { key: "rating", header: "Rating" },
    { key: "matchesCaddied", header: "Matches Caddied" },
    { key: "specialty", header: "Specialty" },
    { key: "actions", header: "Actions", render: () => <div className="flex gap-2 text-xs font-semibold text-pine"><button>View</button><button>Edit</button><button className="text-rose-600">Delete</button></div> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[40px] leading-none text-ink">Caddies</h2>
          <p className="font-abel text-base text-ink/65">Review support staff, specialties, and match histories.</p>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search caddies" className="font-abel rounded-[24px] border-b border-ink/40 bg-transparent px-4 py-3 text-base outline-none" />
      </div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
