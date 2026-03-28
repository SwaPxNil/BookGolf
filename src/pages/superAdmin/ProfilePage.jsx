import { useState } from "react";
import FormInput from "../../components/FormInput";
import { superAdminProfile } from "../../data/dummyData";

export default function SuperAdminProfilePage() {
  const [form, setForm] = useState(superAdminProfile);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <div className="rounded-[30px] border border-white/60 bg-sand p-6 shadow-soft">
      <div className="mb-6 flex items-center gap-4">
        <img src={form.image} alt={form.fullName} className="h-20 w-20 rounded-[24px] object-cover" />
        <div>
          <h2 className="text-[40px] leading-none text-ink">Super Admin Profile</h2>
          <p className="font-abel text-base text-ink/65">Maintain top-level administrator account details.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Name" value={form.fullName} onChange={update("fullName")} />
        <FormInput label="Email" value={form.email} onChange={update("email")} />
        <FormInput label="Profile Image" value={form.image} onChange={update("image")} />
        <FormInput label="Role" value={form.role} onChange={update("role")} />
      </div>
      <div className="mt-6 flex justify-end">
        <button className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]">Save</button>
      </div>
    </div>
  );
}
