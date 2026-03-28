import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGolfBall, FaLock, FaRegEnvelope } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const role = login({ email, password });
    navigate(role === "superadmin" ? "/superadmin/dashboard" : "/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[rgba(20,26,18,0.55)] p-5">
      <div className="w-full max-w-[520px] rounded-[28px] border border-[#d4ceb8] bg-[linear-gradient(180deg,#f6f0e3_0%,#ede2c9_100%)] p-8 shadow-soft">
        <div className="mb-[14px] flex justify-start">
          <div className="flex items-center gap-2 rounded-full border border-[#d4c489] bg-[linear-gradient(180deg,#f4dea0_0%,#d8bb62_100%)] px-4 py-2 shadow-sm">
            <FaGolfBall className="text-sm text-[#1f251f]" />
            <span className="font-abel text-base text-[#2a3428]">Golf Booking</span>
          </div>
        </div>

        <h1 className="font-bebas text-[48px] tracking-[0.05em] text-[#1f251f]">Welcome Back</h1>
        <p className="font-abel mb-6 mt-2 text-[19px] text-[#304233]">
          Sign in to continue your next round
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center rounded-[16px] border border-[#c7c1ac] bg-[#fffdf6] pl-3">
            <FaRegEnvelope className="mr-2 text-[18px] text-[#5f6a44]" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="font-abel flex-1 bg-transparent px-1.5 py-[14px] text-[17px] text-[#1f251f] outline-none placeholder:text-[#7d7d7d]"
            />
          </div>

          <div className="flex items-center rounded-[16px] border border-[#c7c1ac] bg-[#fffdf6] pl-3">
            <FaLock className="mr-2 text-[18px] text-[#5f6a44]" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="font-abel flex-1 bg-transparent px-1.5 py-[14px] text-[17px] text-[#1f251f] outline-none placeholder:text-[#7d7d7d]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="px-3 py-2 text-[#5f6a44]"
            >
              {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
            </button>
          </div>

          <button
            type="submit"
            className="font-bebas mt-2 w-full rounded-[16px] bg-[linear-gradient(180deg,#F3D87A_0%,#C7A94A_60%,#A88421_100%)] py-3.5 text-[26px] tracking-[0.05em] text-[#192016] shadow-md transition hover:brightness-105"
          >
            Continue
          </button>
        </form>

        <p className="font-abel mt-3 text-center text-base text-[#57624a]">
          Use an email containing <span className="font-semibold">superadmin</span> for the Super Admin dashboard.
        </p>

        <p className="font-abel mt-4 text-center text-[18px] text-[#304233]">
          UI demo only for the dashboard application
        </p>
      </div>
    </div>
  );
}
