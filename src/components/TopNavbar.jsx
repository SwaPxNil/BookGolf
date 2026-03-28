import { FaBell, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function TopNavbar({ role }) {
  const { user } = useAuth();
  const isSuperAdmin = role === "superadmin";

  return (
    <header className={`flex items-center justify-between rounded-[30px] border px-6 py-5 shadow-soft ${
      isSuperAdmin
        ? "border-[#6E5A2B] bg-[linear-gradient(135deg,#2A2417_0%,#2E4A37_100%)]"
        : "border-[#39453c] bg-[linear-gradient(135deg,#262B27_0%,#2E4A37_100%)]"
    }`}>
      <div>
        <p className="font-bebas text-xs tracking-[0.35em] text-[#F3D87A]">{isSuperAdmin ? "Platform Command" : "Course Operations"}</p>
        <h1 className="mt-1 text-[34px] leading-none text-sand">Welcome back, {user?.name || "Admin"}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="rounded-[22px] bg-white/10 p-3 text-[#F3D87A]">
          <FaBell />
        </button>
        <div className="flex items-center gap-3 rounded-[22px] bg-white/10 px-4 py-2">
          <FaUserCircle className="text-2xl text-[#F3D87A]" />
          <div className="hidden sm:block">
            <p className="font-bebas text-base text-sand">{user?.name || "Admin User"}</p>
            <p className="font-abel text-xs text-sand/65">{user?.role === "superadmin" ? "Super Admin" : "Course Admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
