import { FaBook, FaChalkboardTeacher, FaDollarSign, FaGolfBall, FaUsers } from "react-icons/fa";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";
import { caddies, coaches } from "../../data/dummyData";

export default function CourseAdminDashboardPage() {
  const coachColumns = [
    { key: "fullName", header: "Full Name" },
    { key: "specialization", header: "Specialization" },
    { key: "experienceYears", header: "Experience Years" },
    { key: "rating", header: "Rating" },
    { key: "studentsTaught", header: "Students Taught" },
  ];

  const caddieColumns = [
    { key: "fullName", header: "Full Name" },
    { key: "experienceYears", header: "Experience Years" },
    { key: "rating", header: "Rating" },
    { key: "matchesCaddied", header: "Matches Caddied" },
    { key: "specialty", header: "Specialty" },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#262B27_0%,#2E4A37_65%,#798D3D_100%)] p-6 text-white shadow-soft">
        <p className="font-bebas text-sm tracking-[0.35em] text-[#E5D39A]">Course Admin Dashboard</p>
        <div className="mt-3 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-[52px] leading-[0.95]">Run one course like a premium golf experience.</h2>
            <p className="font-abel mt-4 max-w-2xl text-lg text-white/80">
              Monitor bookings, lesson demand, coach performance, caddie activity, and revenue from a course-level command center.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Today</p>
              <p className="font-bebas mt-2 text-[34px]">34</p>
              <p className="font-abel text-sm text-white/70">Course check-ins</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Utilization</p>
              <p className="font-bebas mt-2 text-[34px]">81%</p>
              <p className="font-abel text-sm text-white/70">Coach schedule filled</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Support</p>
              <p className="font-bebas mt-2 text-[34px]">12</p>
              <p className="font-abel text-sm text-white/70">Active caddies</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Yield</p>
              <p className="font-bebas mt-2 text-[34px]">Rs 48k</p>
              <p className="font-abel text-sm text-white/70">This week</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Users Booked Course" value="421" icon={FaUsers} />
        <StatCard title="Lessons Booked" value="148" icon={FaBook} accent="from-[#3E5E49] to-[#798D3D]" />
        <StatCard title="Caddies Booked" value="93" icon={FaGolfBall} accent="from-[#4C5F2D] to-[#8AA24A]" />
        <StatCard title="Coaches Booked" value="126" icon={FaChalkboardTeacher} accent="from-[#2E4A37] to-[#5F7248]" />
        <StatCard title="Total Revenue" value="Rs 560,000" icon={FaDollarSign} accent="from-[#7E6527] to-[#C7A94A]" />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-[34px] leading-none text-ink">Top Coaches</h2>
          <p className="font-abel text-base text-ink/65">Highest-impact instructors across your course operations.</p>
        </div>
        <DataTable columns={coachColumns} data={coaches} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-[34px] leading-none text-ink">Top Caddies</h2>
          <p className="font-abel text-base text-ink/65">Trusted caddies delivering premium round support.</p>
        </div>
        <DataTable columns={caddieColumns} data={caddies} />
      </section>
    </div>
  );
}
