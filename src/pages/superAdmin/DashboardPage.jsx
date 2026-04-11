import { useEffect, useMemo, useState } from "react";
import { FaBuilding, FaDollarSign, FaListAlt, FaUsersCog } from "react-icons/fa";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";
import { getCourses } from "../../api/courseAPI";
import { getDashboardOverview } from "../../api/dashboardAPI";
import { getCourseAdmins, getSuperAdminLogs } from "../../api/superAdminAPI";

const normalizeDashboard = (dashboard) => ({
  totalRevenue:
    dashboard?.total_revenue ??
    dashboard?.totals?.revenue ??
    dashboard?.revenue ??
    0,
  totalBookings:
    dashboard?.total_bookings ??
    dashboard?.totals?.bookings ??
    dashboard?.bookings ??
    0,
});

const normalizeLog = (log) => ({
  id: log?._id || log?.id || `${log?.timestamp || ""}-${log?.action || ""}`,
  adminName: log?.admin_name || log?.admin?.full_name || log?.actor?.full_name || "-",
  activityType: log?.activity_type || log?.action || "-",
  date: log?.created_at || log?.timestamp || "-",
  status: log?.status || "-",
});

const dateCell = (value) => {
  if (!value || value === "-") return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

export default function SuperAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [courseAdmins, setCourseAdmins] = useState([]);
  const [dashboard, setDashboard] = useState({ totalRevenue: 0, totalBookings: 0 });
  const [activities, setActivities] = useState([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [coursesList, adminsList, logs, dashboardRaw] = await Promise.all([
        getCourses(),
        getCourseAdmins(),
        getSuperAdminLogs(),
        getDashboardOverview(),
      ]);

      setCourses(coursesList || []);
      setCourseAdmins(adminsList || []);
      setActivities((logs || []).slice(0, 8).map(normalizeLog));
      setDashboard(normalizeDashboard(dashboardRaw || {}));
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const topCourseRows = useMemo(() => {
    const totalRevenue = Number(dashboard.totalRevenue || 0);
    const totalBookings = Number(dashboard.totalBookings || 0);

    if (courses.length === 0) return [];

    const revenuePerCourse = totalRevenue > 0 ? totalRevenue / courses.length : 0;
    const bookingsPerCourse = totalBookings > 0 ? Math.round(totalBookings / courses.length) : 0;

    return courses.map((course) => ({
      ...course,
      totalBookings: bookingsPerCourse,
      totalRevenue: revenuePerCourse,
      superRevenue: revenuePerCourse * 0.01,
    }));
  }, [courses, dashboard.totalRevenue, dashboard.totalBookings]);

  const topCourseColumns = [
    { key: "name", header: "Course Name" },
    { key: "location", header: "Location" },
    { key: "totalBookings", header: "Total Bookings" },
    { key: "totalRevenue", header: "Revenue Generated", render: (value) => `Rs ${Number(value || 0).toLocaleString()}` },
    { key: "superRevenue", header: "Super Admin Revenue (1%)", render: (value) => `Rs ${Number(value || 0).toLocaleString()}` },
  ];

  const recentActivityColumns = [
    { key: "adminName", header: "Course Admin Name" },
    { key: "activityType", header: "Action" },
    { key: "date", header: "Date", render: (value) => dateCell(value) },
    { key: "status", header: "Status" },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#2A2417_0%,#3D3320_35%,#2E4A37_100%)] p-6 text-white shadow-soft">
        <p className="font-bebas text-sm tracking-[0.35em] text-[#E5D39A]">Super Admin Dashboard</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-[40px] leading-[1.02] sm:text-[44px]">Oversee the whole golf platform from one strategic view.</h2>
            <p className="font-abel mt-4 max-w-2xl text-base text-white/80 sm:text-[17px]">
              Track course network growth, total revenue, admin activity, and the platform-wide 1% super-admin share across all locations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Network</p>
              <p className="font-bebas mt-2 text-[30px]">{courses.length}</p>
              <p className="font-abel text-sm text-white/70">Managed courses</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Share</p>
              <p className="font-bebas mt-2 text-[30px]">1%</p>
              <p className="font-abel text-sm text-white/70">Revenue commission</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Admins</p>
              <p className="font-bebas mt-2 text-[30px]">{courseAdmins.length}</p>
              <p className="font-abel text-sm text-white/70">Course admins active</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Audit</p>
              <p className="font-bebas mt-2 text-[30px]">{activities.length}</p>
              <p className="font-abel text-sm text-white/70">Recent actions</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Courses" value={courses.length} icon={FaBuilding} accent="from-[#7E6527] to-[#C7A94A]" />
        <StatCard title="Total Revenue (1%)" value={`Rs ${(Number(dashboard.totalRevenue || 0) * 0.01).toLocaleString()}`} icon={FaDollarSign} accent="from-[#8A7338] to-[#E5D39A]" />
        <StatCard title="Total Course Admins" value={courseAdmins.length} icon={FaUsersCog} accent="from-[#2E4A37] to-[#4A6B53]" />
        <StatCard title="Total Bookings" value={Number(dashboard.totalBookings || 0).toLocaleString()} icon={FaListAlt} accent="from-[#39472F] to-[#798D3D]" />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-[30px] leading-none text-ink">Top Performing Courses</h2>
          <p className="font-abel text-base text-ink/65">Snapshot of performance and platform revenue share.</p>
        </div>
        <DataTable columns={topCourseColumns} data={loading ? [] : topCourseRows} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-[30px] leading-none text-ink">Recent Activities</h2>
          <p className="font-abel text-base text-ink/65">Latest actions taken by course admins.</p>
        </div>
        <DataTable columns={recentActivityColumns} data={loading ? [] : activities} />
      </section>

      {loading && <p className="font-abel text-sm text-ink/60">Loading dashboard insights...</p>}
    </div>
  );
}
