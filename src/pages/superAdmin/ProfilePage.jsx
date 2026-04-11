import { useEffect, useState } from "react";
import FormInput from "../../components/FormInput";
import { getMyProfile, updateMyProfile } from "../../api/authAPI";

export default function SuperAdminProfilePage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    image: "",
    role: "SUPER_ADMIN",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profile = await getMyProfile();
      setForm({
        fullName: profile?.full_name || "",
        email: profile?.email || "",
        image: profile?.profile_img || "",
        role: profile?.role || "SUPER_ADMIN",
      });
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to load super admin profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await updateMyProfile({
        full_name: form.fullName,
        email: form.email,
        profile_img: form.image,
      });
      window.alert("Profile updated successfully.");
      await loadProfile();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-[30px] border border-white/60 bg-sand p-6 shadow-soft">
      <div className="mb-6 flex items-center gap-4">
        <img
          src={form.image || "https://via.placeholder.com/96x96?text=Super+Admin"}
          alt={form.fullName || "Super Admin"}
          className="h-20 w-20 rounded-[24px] object-cover"
        />
        <div>
          <h2 className="text-[40px] leading-none text-ink">Super Admin Profile</h2>
          <p className="font-abel text-base text-ink/65">Maintain top-level administrator account details.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Name" value={form.fullName} onChange={update("fullName")} />
        <FormInput label="Email" value={form.email} onChange={update("email")} />
        <FormInput label="Profile Image" value={form.image} onChange={update("image")} />
        <FormInput label="Role" value={form.role} readOnly />
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={loading || saving}
          className={`font-bebas rounded-[24px] px-5 py-3 text-xl ${loading || saving ? "bg-black/10 text-ink/40" : "bg-[#C7A94A] text-[#192016]"}`}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
