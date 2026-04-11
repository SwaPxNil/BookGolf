import { useEffect, useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import { getSuperAdminLogs } from "../../api/superAdminAPI";

const normalizeLog = (log) => ({
  id: log?._id || log?.id || `${log?.timestamp || ""}-${log?.action || ""}`,
  adminName: log?.admin_name || log?.admin?.full_name || log?.actor?.full_name || "-",
  courseName: log?.course_name || log?.course?.name || "-",
  activityType: log?.activity_type || log?.action || "-",
  description: log?.description || log?.message || "-",
  date: log?.created_at || log?.timestamp || "-",
  status: log?.status || "-",
});

const dateCell = (value) => {
  if (!value || value === "-") return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

export default function SuperAdminActivitiesPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const logs = await getSuperAdminLogs();
      setActivities((logs || []).map(normalizeLog));
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to load admin activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const filtered = useMemo(
    () =>
      activities.filter((item) =>
        `${item.adminName} ${item.courseName} ${item.activityType}`.toLowerCase().includes(query.toLowerCase())
      ),
    [activities, query]
  );

  const columns = [
    { key: "adminName", header: "Admin Name" },
    { key: "courseName", header: "Course Name" },
    { key: "activityType", header: "Activity Type" },
    { key: "description", header: "Description" },
    { key: "date", header: "Date", render: (value) => dateCell(value) },
    { key: "status", header: "Status" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[40px] leading-none text-ink">Admin Activities</h2>
          <p className="font-abel text-base text-ink/65">Audit trail for course-admin actions across the system.</p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search activities"
          className="font-abel rounded-[24px] border-b border-ink/40 bg-transparent px-4 py-3 text-base outline-none"
        />
      </div>

      <DataTable columns={columns} data={loading ? [] : filtered} />
      {loading && <p className="font-abel text-sm text-ink/60">Loading activities...</p>}
    </div>
  );
}
