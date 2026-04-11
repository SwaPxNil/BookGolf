import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGolfBall, FaLock, FaRegEnvelope } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, authLoading, login, completeTwoFactorLogin, resendTwoFactorCode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpStep, setShowOtpStep] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    navigate(user.role === "superadmin" ? "/superadmin/dashboard" : "/dashboard", { replace: true });
  }, [authLoading, user, navigate]);

  const parseError = (error, fallback) => error?.response?.data?.msg || fallback;

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setInfoMessage("");
    setIsSubmitting(true);

    try {
      const result = await login({ email, password });
      if (!result?.tempToken) {
        throw new Error("Temporary login token was not returned.");
      }

      setTempToken(result.tempToken);
      setShowOtpStep(true);
      setInfoMessage(result?.message || "2FA code sent. Enter the code to continue.");
    } catch (error) {
      setErrorMessage(parseError(error, "Login failed."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setInfoMessage("");
    setIsSubmitting(true);

    try {
      const currentUser = await completeTwoFactorLogin({ tempToken, code: otpCode });
      navigate(currentUser.role === "superadmin" ? "/superadmin/dashboard" : "/dashboard", { replace: true });
    } catch (error) {
      setErrorMessage(parseError(error, "2FA verification failed."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setErrorMessage("");
    setInfoMessage("");
    setIsSubmitting(true);

    try {
      const result = await resendTwoFactorCode({ tempToken });
      if (result?.tempToken) {
        setTempToken(result.tempToken);
      }
      setInfoMessage(result?.message || "A new 2FA code was sent.");
    } catch (error) {
      setErrorMessage(parseError(error, "Failed to resend 2FA code."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToPasswordStep = () => {
    setShowOtpStep(false);
    setOtpCode("");
    setTempToken("");
    setInfoMessage("");
    setErrorMessage("");
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
          {showOtpStep ? "Enter your 2FA code to finish login" : "Sign in to continue your next round"}
        </p>

        {errorMessage && <p className="font-abel mb-3 rounded-[12px] bg-[#f8dfe3] px-3 py-2 text-sm text-[#a33545]">{errorMessage}</p>}
        {infoMessage && <p className="font-abel mb-3 rounded-[12px] bg-[#e6efe1] px-3 py-2 text-sm text-[#2f5037]">{infoMessage}</p>}

        {!showOtpStep ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="flex items-center rounded-[16px] border border-[#c7c1ac] bg-[#fffdf6] pl-3">
              <FaRegEnvelope className="mr-2 text-[18px] text-[#5f6a44]" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
                onChange={(event) => setPassword(event.target.value)}
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
              disabled={isSubmitting}
              className={`font-bebas mt-2 w-full rounded-[16px] py-3.5 text-[26px] tracking-[0.05em] shadow-md transition ${isSubmitting ? "bg-[#c7c1ac] text-[#505050]" : "bg-[linear-gradient(180deg,#F3D87A_0%,#C7A94A_60%,#A88421_100%)] text-[#192016] hover:brightness-105"}`}
            >
              {isSubmitting ? "Signing In..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="flex items-center rounded-[16px] border border-[#c7c1ac] bg-[#fffdf6] pl-3">
              <FaLock className="mr-2 text-[18px] text-[#5f6a44]" />
              <input
                type="text"
                placeholder="6-digit code"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                className="font-abel flex-1 bg-transparent px-1.5 py-[14px] text-[17px] tracking-[0.3em] text-[#1f251f] outline-none placeholder:text-[#7d7d7d]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-bebas mt-2 w-full rounded-[16px] py-3.5 text-[26px] tracking-[0.05em] shadow-md transition ${isSubmitting ? "bg-[#c7c1ac] text-[#505050]" : "bg-[linear-gradient(180deg,#F3D87A_0%,#C7A94A_60%,#A88421_100%)] text-[#192016] hover:brightness-105"}`}
            >
              {isSubmitting ? "Verifying..." : "Verify 2FA"}
            </button>

            <div className="flex items-center justify-between">
              <button type="button" onClick={backToPasswordStep} className="font-abel text-sm text-[#425540] underline underline-offset-4">Back</button>
              <button type="button" onClick={handleResendCode} disabled={isSubmitting} className={`font-abel text-sm underline underline-offset-4 ${isSubmitting ? "text-[#7a7a7a]" : "text-[#425540]"}`}>Resend Code</button>
            </div>
          </form>
        )}

        <p className="font-abel mt-4 text-center text-[18px] text-[#304233]">
          Secure login with backend-issued OTP verification
        </p>
      </div>
    </div>
  );
}
