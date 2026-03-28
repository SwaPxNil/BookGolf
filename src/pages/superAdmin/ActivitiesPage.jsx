import { useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import { activities as activitySeed } from "../../data/dummyData";

export default function SuperAdminActivitiesPage() {
  const [query, setQuery] = useState("");
  const [activities] = useState(activitySeed);

  const filtered = useMemo(
    () => activities.filter((item) => `${item.adminName} ${item.courseName} ${item.activityType}`.toLowerCase().includes(query.toLowerCase())),
    [activities, query]
  );

  const columns = [
    { key: "adminName", header: "Admin Name" },
    { key: "courseName", header: "Course Name" },
    { key: "activityType", header: "Activity Type" },
    { key: "description", header: "Description" },
    { key: "date", header: "Date" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[40px] leading-none text-ink">Admin Activities</h2>
          <p className="font-abel text-base text-ink/65">Audit trail for course-admin actions across the system.</p>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search activities" className="font-abel rounded-[24px] border-b border-ink/40 bg-transparent px-4 py-3 text-base outline-none" />
      </div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
