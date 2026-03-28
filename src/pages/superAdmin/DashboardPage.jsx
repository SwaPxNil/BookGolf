import { FaBuilding, FaDollarSign, FaListAlt, FaUsersCog } from "react-icons/fa";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";
import { activities, courses } from "../../data/dummyData";

export default function SuperAdminDashboardPage() {
  const topCourseColumns = [
    { key: "name", header: "Course Name" },
    { key: "location", header: "Location" },
    { key: "totalBookings", header: "Total Bookings" },
    { key: "totalRevenue", header: "Revenue Generated", render: (value) => `Rs ${value.toLocaleString()}` },
    { key: "superRevenue", header: "Super Admin Revenue (1%)", render: (_, row) => `Rs ${(row.totalRevenue * 0.01).toLocaleString()}` },
  ];

  const recentActivityColumns = [
    { key: "adminName", header: "Course Admin Name" },
    { key: "activityType", header: "Action" },
    { key: "date", header: "Date" },
    { key: "status", header: "Status" },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#2A2417_0%,#3D3320_35%,#2E4A37_100%)] p-6 text-white shadow-soft">
        <p className="font-bebas text-sm tracking-[0.35em] text-[#E5D39A]">Super Admin Dashboard</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-[52px] leading-[0.95]">Oversee the whole golf platform from one strategic view.</h2>
            <p className="font-abel mt-4 max-w-2xl text-lg text-white/80">
              Track course network growth, total revenue, admin activity, and the platform-wide 1% super-admin share across all locations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Network</p>
              <p className="font-bebas mt-2 text-[34px]">4</p>
              <p className="font-abel text-sm text-white/70">Managed courses</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Share</p>
              <p className="font-bebas mt-2 text-[34px]">1%</p>
              <p className="font-abel text-sm text-white/70">Revenue commission</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Admins</p>
              <p className="font-bebas mt-2 text-[34px]">4</p>
              <p className="font-abel text-sm text-white/70">Course admins active</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Audit</p>
              <p className="font-bebas mt-2 text-[34px]">24</p>
              <p className="font-abel text-sm text-white/70">Actions this month</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Courses" value={courses.length} icon={FaBuilding} accent="from-[#7E6527] to-[#C7A94A]" />
        <StatCard title="Total Revenue (1%)" value="Rs 17,350" icon={FaDollarSign} accent="from-[#8A7338] to-[#E5D39A]" />
        <StatCard title="Total Course Admins" value="4" icon={FaUsersCog} accent="from-[#2E4A37] to-[#4A6B53]" />
        <StatCard title="Total Bookings" value="1,313" icon={FaListAlt} accent="from-[#39472F] to-[#798D3D]" />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-[34px] leading-none text-ink">Top Performing Courses</h2>
          <p className="font-abel text-base text-ink/65">Snapshot of performance and platform revenue share.</p>
        </div>
        <DataTable columns={topCourseColumns} data={courses} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-[34px] leading-none text-ink">Recent Activities</h2>
          <p className="font-abel text-base text-ink/65">Latest actions taken by course admins.</p>
        </div>
        <DataTable columns={recentActivityColumns} data={activities} />
      </section>
    </div>
  );
}
