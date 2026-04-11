import { useEffect, useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import TableActions from "../../components/TableActions";
import { deleteCourse, getCourses, updateCourse, updateCourseStatus } from "../../api/courseAPI";
import { getCourseAdmins } from "../../api/superAdminAPI";

export default function SuperAdminCoursesPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [courseAdmins, setCourseAdmins] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [openViewer, setOpenViewer] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [assignAdminId, setAssignAdminId] = useState("");

  const loadCourses = async () => {
    setLoading(true);
    try {
      const [list, admins] = await Promise.all([getCourses(), getCourseAdmins()]);
      setCourses(list);
      setCourseAdmins(admins);
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filtered = useMemo(
    () => courses.filter((course) => `${course.name} ${course.location}`.toLowerCase().includes(query.toLowerCase())),
    [courses, query]
  );

  const openViewModal = (course) => {
    setSelectedCourse(course);
    setOpenViewer(true);
  };

  const openAssignAdminModal = (course) => {
    setSelectedCourse(course);
    setAssignAdminId(course?.createdById || "");
    setOpenAssignModal(true);
  };

  const assignAdmin = async () => {
    if (!selectedCourse?.id || !assignAdminId) {
      window.alert("Please select a course admin.");
      return;
    }

    try {
      await updateCourse(selectedCourse.id, {
        ...selectedCourse,
        createdBy: assignAdminId,
      });
      setOpenAssignModal(false);
      await loadCourses();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to assign course admin");
    }
  };

  const unassignAdmin = async (course) => {
    if (!window.confirm(`Unassign course admin from ${course.name}?`)) return;

    try {
      await updateCourse(course.id, {
        ...course,
        createdBy: null,
      });
      await loadCourses();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to unassign course admin");
    }
  };

  const changeStatus = async (course, status) => {
    try {
      await updateCourseStatus(course.id, status);
      await loadCourses();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to update course status");
    }
  };

  const removeCourse = async (course) => {
    if (!window.confirm(`Delete course ${course.name}? This cannot be undone.`)) return;

    try {
      await deleteCourse(course.id);
      await loadCourses();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to delete course");
    }
  };

  const columns = [
    { key: "name", header: "Course Name" },
    { key: "location", header: "Location" },
    { key: "courseRating", header: "Course Rating" },
    { key: "slopeRating", header: "Slope Rating" },
    { key: "teeTimePrice", header: "Tee Time Price", render: (value) => `Rs ${Number(value || 0).toLocaleString()}` },
    { key: "createdByName", header: "Assigned Admin" },
    { key: "status", header: "Status" },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <TableActions
          actions={[
            { label: "View", onClick: () => openViewModal(row) },
            { label: "Assign Admin", tone: "update", onClick: () => openAssignAdminModal(row) },
            {
              label: "Unassign Admin",
              tone: "delete",
              disabled: !row.createdById,
              onClick: () => unassignAdmin(row),
            },
            { label: "Approve", tone: "update", onClick: () => changeStatus(row, "APPROVED") },
            { label: "Reject", tone: "delete", onClick: () => changeStatus(row, "REJECTED") },
            { label: "Delete", tone: "delete", onClick: () => removeCourse(row) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[40px] leading-none text-ink">Courses</h2>
          <p className="font-abel text-base text-ink/65">Oversee every golf course connected to the platform.</p>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search courses" className="font-abel rounded-[24px] border-b border-ink/40 bg-transparent px-4 py-3 text-base outline-none" />
      </div>
      <DataTable columns={columns} data={loading ? [] : filtered} />

      {loading && <p className="font-abel text-sm text-ink/60">Loading courses...</p>}

      <Modal open={openViewer} title="Course Details" onClose={() => setOpenViewer(false)}>
        {selectedCourse && (
          <div className="space-y-2 font-abel text-base text-ink/80">
            <p><span className="font-semibold text-ink">Course:</span> {selectedCourse.name}</p>
            <p><span className="font-semibold text-ink">Location:</span> {selectedCourse.location}</p>
            <p><span className="font-semibold text-ink">Assigned Admin:</span> {selectedCourse.createdByName || "Unassigned"}</p>
            <p><span className="font-semibold text-ink">Status:</span> {selectedCourse.status}</p>
            <p><span className="font-semibold text-ink">Course Rating:</span> {selectedCourse.courseRating}</p>
            <p><span className="font-semibold text-ink">Slope Rating:</span> {selectedCourse.slopeRating}</p>
            <p><span className="font-semibold text-ink">Tee Time Price:</span> Rs {Number(selectedCourse.teeTimePrice || 0).toLocaleString()}</p>
          </div>
        )}
      </Modal>

      <Modal open={openAssignModal} title="Assign Course Admin" onClose={() => setOpenAssignModal(false)}>
        <div className="space-y-4">
          <label className="block">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Course</span>
            <input
              value={selectedCourse?.name || ""}
              disabled
              className="font-abel w-full rounded-[24px] border border-black/10 bg-black/5 px-4 py-3 text-base text-ink/70 outline-none"
            />
          </label>

          <label className="block">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Assign To</span>
            <select
              value={assignAdminId}
              onChange={(event) => setAssignAdminId(event.target.value)}
              className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            >
              <option value="">Select course admin</option>
              {courseAdmins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.fullName} ({admin.email})
                </option>
              ))}
            </select>
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!selectedCourse) return;
                unassignAdmin(selectedCourse);
                setOpenAssignModal(false);
              }}
              className="font-bebas mr-3 rounded-[24px] bg-[#C24D5A] px-5 py-3 text-xl text-white"
            >
              Unassign
            </button>
            <button
              type="button"
              onClick={assignAdmin}
              className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]"
            >
              Save Assignment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
