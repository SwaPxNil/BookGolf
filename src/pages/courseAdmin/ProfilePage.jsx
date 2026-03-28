import { useState } from "react";
import FormInput from "../../components/FormInput";
import { courseAdminProfile } from "../../data/dummyData";

export default function CourseAdminProfilePage() {
  const [form, setForm] = useState(courseAdminProfile);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  return (
    <div className="rounded-[30px] border border-white/60 bg-sand p-6 shadow-soft">
      <div className="mb-6 flex items-center gap-4">
        <img src={form.image} alt={form.fullName} className="h-20 w-20 rounded-[24px] object-cover" />
        <div>
          <h2 className="text-[40px] leading-none text-ink">Profile</h2>
          <p className="font-abel text-base text-ink/65">Update course admin details and course presentation copy.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Full Name" value={form.fullName} onChange={update("fullName")} />
        <FormInput label="Email" value={form.email} onChange={update("email")} />
        <FormInput label="Phone" value={form.phone} onChange={update("phone")} />
        <FormInput label="Course Name" value={form.courseName} onChange={update("courseName")} />
        <FormInput label="Location" value={form.location} onChange={update("location")} />
        <FormInput label="Profile Image" value={form.image} onChange={update("image")} />
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
          <textarea value={form.description} onChange={update("description")} rows="4" className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15" />
        </label>
      </div>
      <div className="mt-6 flex justify-end">
        <button className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]">Save</button>
      </div>
    </div>
  );
}
