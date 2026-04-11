import { Navigate, Route, Routes } from "react-router-dom";
import { FaBook, FaCalendarCheck, FaChalkboardTeacher, FaFlag, FaGolfBall, FaHistory, FaHome, FaIdBadge, FaUserCircle, FaUsersCog } from "react-icons/fa";
import AdminLayout from "./components/AdminLayout";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import CourseAdminBookingsPage from "./pages/courseAdmin/BookingsPage";
import CourseAdminCaddiesPage from "./pages/courseAdmin/CaddiesPage";
import CourseAdminDashboardPage from "./pages/courseAdmin/DashboardPage";
import CourseAdminLessonsPage from "./pages/courseAdmin/LessonsPage";
import CourseAdminProfilePage from "./pages/courseAdmin/ProfilePage";
import CourseAdminCoachesPage from "./pages/courseAdmin/CoachesPage";
import SuperAdminActivitiesPage from "./pages/superAdmin/ActivitiesPage";
import SuperAdminCourseAdminsPage from "./pages/superAdmin/CourseAdminsPage";
import SuperAdminCoursesPage from "./pages/superAdmin/CoursesPage";
import SuperAdminDashboardPage from "./pages/superAdmin/DashboardPage";
import SuperAdminProfilePage from "./pages/superAdmin/ProfilePage";

const courseAdminSidebar = [
  { label: "Dashboard", path: "/dashboard", icon: FaHome },
  { label: "Coaches", path: "/coaches", icon: FaChalkboardTeacher },
  { label: "Lessons", path: "/lessons", icon: FaBook },
  { label: "Caddies", path: "/caddies", icon: FaGolfBall },
  { label: "Bookings", path: "/bookings", icon: FaCalendarCheck },
  { label: "Profile", path: "/profile", icon: FaUserCircle },
];

const superAdminSidebar = [
  { label: "Dashboard", path: "/superadmin/dashboard", icon: FaHome },
  { label: "Courses", path: "/superadmin/courses", icon: FaFlag },
  { label: "Course Admins", path: "/superadmin/course-admins", icon: FaUsersCog },
  { label: "Admin Activities", path: "/superadmin/activities", icon: FaHistory },
  { label: "Profile", path: "/superadmin/profile", icon: FaIdBadge },
];

function ProtectedRoute({ role, children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) {
    return <div className="font-abel p-6 text-base text-ink/70">Checking session...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === "superadmin" ? "/superadmin/dashboard" : "/dashboard"} replace />;
  return children;
}

function CourseAdminShell({ children }) {
  return <AdminLayout sidebarItems={courseAdminSidebar} role="courseAdmin">{children}</AdminLayout>;
}

function SuperAdminShell({ children }) {
  return <AdminLayout sidebarItems={superAdminSidebar} role="superadmin">{children}</AdminLayout>;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={<ProtectedRoute role="courseAdmin"><CourseAdminShell><CourseAdminDashboardPage /></CourseAdminShell></ProtectedRoute>} />
      <Route path="/coaches" element={<ProtectedRoute role="courseAdmin"><CourseAdminShell><CourseAdminCoachesPage /></CourseAdminShell></ProtectedRoute>} />
      <Route path="/caddies" element={<ProtectedRoute role="courseAdmin"><CourseAdminShell><CourseAdminCaddiesPage /></CourseAdminShell></ProtectedRoute>} />
      <Route path="/lessons" element={<ProtectedRoute role="courseAdmin"><CourseAdminShell><CourseAdminLessonsPage /></CourseAdminShell></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute role="courseAdmin"><CourseAdminShell><CourseAdminBookingsPage /></CourseAdminShell></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute role="courseAdmin"><CourseAdminShell><CourseAdminProfilePage /></CourseAdminShell></ProtectedRoute>} />

      <Route path="/superadmin/dashboard" element={<ProtectedRoute role="superadmin"><SuperAdminShell><SuperAdminDashboardPage /></SuperAdminShell></ProtectedRoute>} />
      <Route path="/superadmin/courses" element={<ProtectedRoute role="superadmin"><SuperAdminShell><SuperAdminCoursesPage /></SuperAdminShell></ProtectedRoute>} />
      <Route path="/superadmin/course-admins" element={<ProtectedRoute role="superadmin"><SuperAdminShell><SuperAdminCourseAdminsPage /></SuperAdminShell></ProtectedRoute>} />
      <Route path="/superadmin/activities" element={<ProtectedRoute role="superadmin"><SuperAdminShell><SuperAdminActivitiesPage /></SuperAdminShell></ProtectedRoute>} />
      <Route path="/superadmin/profile" element={<ProtectedRoute role="superadmin"><SuperAdminShell><SuperAdminProfilePage /></SuperAdminShell></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={user ? (user.role === "superadmin" ? "/superadmin/dashboard" : "/dashboard") : "/login"} replace />} />
    </Routes>
  );
}
