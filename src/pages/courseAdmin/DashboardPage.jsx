import { useEffect, useMemo, useState } from "react";
import { FaBook, FaChalkboardTeacher, FaDollarSign, FaGolfBall, FaUsers } from "react-icons/fa";
import DataTable from "../../components/DataTable";
import StatCard from "../../components/StatCard";
import { getCourseBookings } from "../../api/bookingAPI";
import { getCourseScopedCaddies } from "../../api/caddieAPI";
import { getCourseScopedCoaches } from "../../api/coachAPI";
import { getMyCourse } from "../../api/courseAPI";
import { getDashboardOverview } from "../../api/dashboardAPI";

const isSameDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

const isSameWeek = (date, now) => {
  const current = new Date(now);
  const start = new Date(current);
  start.setDate(current.getDate() - current.getDay());
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return date >= start && date < end;
};

const toDate = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export default function CourseAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [myCourse, setMyCourse] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [caddies, setCaddies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [dashboardSnapshot, setDashboardSnapshot] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);

    try {
      const myCourseResult = await getMyCourse();
      const course = Array.isArray(myCourseResult) ? null : myCourseResult;
      setMyCourse(course);

      const [coachList, caddieList, bookingList, dashboardData] = await Promise.all([
        getCourseScopedCoaches(course?.id),
        getCourseScopedCaddies(course?.id),
        getCourseBookings(course?.id),
        getDashboardOverview().catch(() => null),
      ]);

      setCoaches(coachList || []);
      setCaddies(caddieList || []);
      setBookings(bookingList || []);
      setDashboardSnapshot(dashboardData);
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();

    const confirmedBookings = bookings.filter((booking) => booking.status !== "CANCELLED");
    const usersBooked = new Set(
      confirmedBookings
        .map((booking) => booking.userEmail || booking.userName)
        .filter(Boolean)
    ).size;

    const lessonsBooked = confirmedBookings.filter((booking) => booking.bookingType === "COACH").length;
    const caddiesBooked = confirmedBookings.filter((booking) => booking.bookingType === "CADDIE").length;

    const totalRevenueFromBookings = confirmedBookings.reduce(
      (sum, booking) => sum + Number(booking.price || 0),
      0
    );

    const todayCheckins = confirmedBookings.filter((booking) => {
      const date = toDate(booking.date);
      return date ? isSameDay(date, now) : false;
    }).length;

    const weekYield = confirmedBookings.reduce((sum, booking) => {
      const date = toDate(booking.date);
      if (!date || !isSameWeek(date, now)) return sum;
      return sum + Number(booking.price || 0);
    }, 0);

    const coachUtilization = coaches.length > 0
      ? Math.min(100, Math.round((lessonsBooked / coaches.length) * 100))
      : 0;

    const dashboardRevenue =
      Number(dashboardSnapshot?.course_revenue || 0) ||
      Number(dashboardSnapshot?.revenue || 0) ||
      totalRevenueFromBookings;

    return {
      todayCheckins,
      coachUtilization,
      activeCaddies: caddies.length,
      weekYield,
      usersBooked,
      lessonsBooked,
      caddiesBooked,
      coachesBooked: lessonsBooked,
      totalRevenue: dashboardRevenue,
    };
  }, [bookings, caddies.length, coaches.length, dashboardSnapshot]);

  const topCoaches = useMemo(
    () => [...coaches].sort((left, right) => Number(right.rating || 0) - Number(left.rating || 0)).slice(0, 8),
    [coaches]
  );

  const topCaddies = useMemo(
    () => [...caddies].sort((left, right) => Number(right.rating || 0) - Number(left.rating || 0)).slice(0, 8),
    [caddies]
  );

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
            <h2 className="text-[40px] leading-[1.02] sm:text-[44px]">Run one course like a premium golf experience.</h2>
            <p className="font-abel mt-4 max-w-2xl text-base text-white/80 sm:text-[17px]">
              Monitor bookings, lesson demand, coach performance, caddie activity, and revenue from a course-level command center.
            </p>
            {myCourse?.name && (
              <p className="font-abel mt-3 text-sm text-white/70">Course: {myCourse.name}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Today</p>
              <p className="font-bebas mt-2 text-[30px]">{stats.todayCheckins}</p>
              <p className="font-abel text-sm text-white/70">Course check-ins</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Utilization</p>
              <p className="font-bebas mt-2 text-[30px]">{stats.coachUtilization}%</p>
              <p className="font-abel text-sm text-white/70">Coach schedule filled</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Support</p>
              <p className="font-bebas mt-2 text-[30px]">{stats.activeCaddies}</p>
              <p className="font-abel text-sm text-white/70">Active caddies</p>
            </div>
            <div className="rounded-[24px] bg-white/10 p-4">
              <p className="font-bebas text-xs tracking-[0.25em] text-[#E5D39A]">Yield</p>
              <p className="font-bebas mt-2 text-[30px]">Rs {Number(stats.weekYield || 0).toLocaleString()}</p>
              <p className="font-abel text-sm text-white/70">This week</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Users Booked Course" value={stats.usersBooked} icon={FaUsers} />
        <StatCard title="Lessons Booked" value={stats.lessonsBooked} icon={FaBook} accent="from-[#3E5E49] to-[#798D3D]" />
        <StatCard title="Caddies Booked" value={stats.caddiesBooked} icon={FaGolfBall} accent="from-[#4C5F2D] to-[#8AA24A]" />
        <StatCard title="Coaches Booked" value={stats.coachesBooked} icon={FaChalkboardTeacher} accent="from-[#2E4A37] to-[#5F7248]" />
        <StatCard title="Total Revenue" value={`Rs ${Number(stats.totalRevenue || 0).toLocaleString()}`} icon={FaDollarSign} accent="from-[#7E6527] to-[#C7A94A]" />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-[30px] leading-none text-ink">Top Coaches</h2>
          <p className="font-abel text-base text-ink/65">Highest-impact instructors across your course operations.</p>
        </div>
        <DataTable columns={coachColumns} data={loading ? [] : topCoaches} />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-[30px] leading-none text-ink">Top Caddies</h2>
          <p className="font-abel text-base text-ink/65">Trusted caddies delivering premium round support.</p>
        </div>
        <DataTable columns={caddieColumns} data={loading ? [] : topCaddies} />
      </section>

      {loading && <p className="font-abel text-sm text-ink/60">Loading dashboard insights...</p>}
    </div>
  );
}
