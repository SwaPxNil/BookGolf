import { NavLink } from "react-router-dom";
import { FaGolfBall } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ items, role }) {
  const { logout } = useAuth();
  const isSuperAdmin = role === "superadmin";

  return (
    <aside className="w-full px-4 py-4 text-white lg:min-h-screen lg:w-[290px] lg:py-6">
      <div className={`flex h-full flex-col rounded-[34px] px-5 py-6 shadow-soft ${
        isSuperAdmin
          ? "bg-[linear-gradient(180deg,#2A2417_0%,#2E4A37_100%)]"
          : "bg-[linear-gradient(180deg,#262B27_0%,#223329_100%)]"
      }`}>
      <div className="flex items-center gap-3 px-3">
        <div className={`rounded-[22px] p-3 text-xl text-charcoal shadow-md ${isSuperAdmin ? "bg-[linear-gradient(180deg,#F3D87A_0%,#C7A94A_100%)]" : "bg-[linear-gradient(180deg,#F3D87A_0%,#B8A03B_100%)]"}`}>
          <FaGolfBall />
        </div>
        <div>
          <p className="font-bebas text-xs tracking-[0.35em] text-[#F3D87A]/80">{isSuperAdmin ? "Super Suite" : "Course Suite"}</p>
          <h2 className="font-bebas text-[28px] leading-none">{isSuperAdmin ? "Super Admin" : "Course Admin"}</h2>
        </div>
      </div>

      <nav className="mt-8 flex-1 space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `font-abel flex items-center gap-3 rounded-[24px] px-4 py-3 text-base transition ${
                isActive
                  ? isSuperAdmin
                    ? "bg-[linear-gradient(180deg,#F3D87A_0%,#C7A94A_100%)] text-charcoal"
                    : "bg-[linear-gradient(180deg,#7E9144_0%,#798D3D_100%)] text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <item.icon className="text-lg" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <button onClick={logout} className={`font-bebas rounded-[24px] px-4 py-3 text-left text-base transition hover:text-white ${
        isSuperAdmin
          ? "bg-[#C7A94A]/20 text-[#F3D87A] hover:bg-[#C7A94A]/30"
          : "bg-[#C7A94A]/18 text-[#F3D87A] hover:bg-[#C7A94A]/28"
      }`}>
        Logout
      </button>
      </div>
    </aside>
  );
}
