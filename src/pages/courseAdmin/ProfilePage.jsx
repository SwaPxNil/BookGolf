import { useEffect, useState } from "react";
import FormInput from "../../components/FormInput";
import { getMyProfile, updateMyProfile } from "../../api/authAPI";
import { getMyCourse, updateCourse } from "../../api/courseAPI";

export default function CourseAdminProfilePage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    image: "",
    courseName: "",
    location: "",
    courseRating: "",
    slopeRating: "",
    teeTimePrice: "",
    status: "",
  });
  const [courseId, setCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = async () => {
    setLoading(true);

    try {
      const [profile, course] = await Promise.all([getMyProfile(), getMyCourse()]);
      setCourseId(course?.id || null);
      setForm({
        fullName: profile?.full_name || "",
        email: profile?.email || "",
        image: profile?.profile_img || course?.image || "",
        courseName: course?.name || "",
        location: course?.location || "",
        courseRating: String(course?.courseRating ?? ""),
        slopeRating: String(course?.slopeRating ?? ""),
        teeTimePrice: String(course?.teeTimePrice ?? ""),
        status: course?.status || "",
      });
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const saveProfile = async () => {
    setSaving(true);

    try {
      await updateMyProfile({
        full_name: form.fullName,
        email: form.email,
        profile_img: form.image,
      });

      if (courseId) {
        await updateCourse(courseId, {
          name: form.courseName,
          location: form.location,
          image: form.image,
          courseRating: Number(form.courseRating || 0),
          slopeRating: Number(form.slopeRating || 0),
          teeTimePrice: Number(form.teeTimePrice || 0),
          status: form.status || undefined,
        });
      }

      window.alert("Profile and course details updated successfully.");
      await loadProfile();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-[30px] border border-white/60 bg-sand p-6 shadow-soft">
      <div className="mb-6 flex items-center gap-4">
        <img src={form.image || "https://via.placeholder.com/96x96?text=Admin"} alt={form.fullName} className="h-20 w-20 rounded-[24px] object-cover" />
        <div>
          <h2 className="text-[40px] leading-none text-ink">Profile</h2>
          <p className="font-abel text-base text-ink/65">Update course admin details and core course ratings configuration.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormInput label="Full Name" value={form.fullName} onChange={update("fullName")} />
        <FormInput label="Email" value={form.email} onChange={update("email")} />
        <FormInput label="Course Name" value={form.courseName} onChange={update("courseName")} />
        <FormInput label="Location" value={form.location} onChange={update("location")} />
        <FormInput label="Course Rating" type="number" step="0.1" value={form.courseRating} onChange={update("courseRating")} />
        <FormInput label="Slope Rating" type="number" value={form.slopeRating} onChange={update("slopeRating")} />
        <FormInput label="Tee Time Price" type="number" value={form.teeTimePrice} onChange={update("teeTimePrice")} />
        <FormInput label="Status" value={form.status} onChange={update("status")} />
        <FormInput label="Profile Image" value={form.image} onChange={update("image")} />
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={saveProfile} disabled={loading || saving} className={`font-bebas rounded-[24px] px-5 py-3 text-xl ${loading || saving ? "bg-black/10 text-ink/40" : "bg-[#C7A94A] text-[#192016]"}`}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
