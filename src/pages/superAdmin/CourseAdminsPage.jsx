import { useEffect, useMemo, useState } from "react";
import DataTable from "../../components/DataTable";
import FormInput from "../../components/FormInput";
import Modal from "../../components/Modal";
import TableActions from "../../components/TableActions";
import { getCourses, updateCourse } from "../../api/courseAPI";
import {
  createCourseAdmin,
  getCourseAdmins,
  updateCourseAdminStatus,
} from "../../api/superAdminAPI";

const emptyAdminForm = {
  fullName: "",
  email: "",
  password: "",
};

export default function SuperAdminCourseAdminsPage() {
  const [query, setQuery] = useState("");
  const [admins, setAdmins] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [openUnassignModal, setOpenUnassignModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedUnassignCourseId, setSelectedUnassignCourseId] = useState("");
  const [createForm, setCreateForm] = useState(emptyAdminForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminList, courseList] = await Promise.all([getCourseAdmins(), getCourses()]);
      setAdmins(adminList);
      setCourses(courseList);
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to load course admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const adminRows = useMemo(() => {
    const assignedByAdmin = courses.reduce((accumulator, course) => {
      const key = course.createdById;
      if (!key) return accumulator;

      accumulator[key] = accumulator[key] || [];
      accumulator[key].push({
        id: course.id,
        name: course.name,
      });
      return accumulator;
    }, {});

    return admins.map((admin) => {
      const assignedCourses = assignedByAdmin[admin.id] || [];
      return {
        ...admin,
        assignedCourses,
        assignedCount: assignedCourses.length,
      };
    });
  }, [admins, courses]);

  const filtered = useMemo(
    () =>
      adminRows.filter((admin) =>
        `${admin.fullName} ${admin.email} ${admin.status}`.toLowerCase().includes(query.toLowerCase())
      ),
    [adminRows, query]
  );

  const unassignedOrOtherCourses = useMemo(() => {
    if (!selectedAdmin) return courses;

    return courses.filter((course) => course.createdById !== selectedAdmin.id);
  }, [courses, selectedAdmin]);

  const openAssign = (admin) => {
    setSelectedAdmin(admin);
    setSelectedCourseId("");
    setOpenAssignModal(true);
  };

  const openUnassign = (admin) => {
    setSelectedAdmin(admin);
    setSelectedUnassignCourseId("");
    setOpenUnassignModal(true);
  };

  const assignCourse = async () => {
    if (!selectedAdmin?.id || !selectedCourseId) {
      window.alert("Please choose a course to assign.");
      return;
    }

    const targetCourse = courses.find((course) => course.id === selectedCourseId);
    if (!targetCourse) {
      window.alert("Selected course was not found.");
      return;
    }

    try {
      await updateCourse(targetCourse.id, {
        ...targetCourse,
        createdBy: selectedAdmin.id,
      });
      setOpenAssignModal(false);
      await loadData();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to assign course admin");
    }
  };

  const unassignCourse = async () => {
    if (!selectedUnassignCourseId) {
      window.alert("Please choose a course to unassign.");
      return;
    }

    const targetCourse = courses.find((course) => course.id === selectedUnassignCourseId);
    if (!targetCourse) {
      window.alert("Selected course was not found.");
      return;
    }

    try {
      await updateCourse(targetCourse.id, {
        ...targetCourse,
        createdBy: null,
      });
      setOpenUnassignModal(false);
      await loadData();
    } catch (error) {
      window.alert(error?.response?.data?.msg || "Failed to unassign course");
    }
  };

  const saveCourseAdmin = async () => {
    try {
      await createCourseAdmin(createForm);
      setOpenCreateModal(false);
      setCreateForm(emptyAdminForm);
      await loadData();
    } catch (error) {
      if (error?.response?.status === 404 || error?.response?.status === 405) {
        window.alert("Create course-admin endpoint is not exposed by backend yet.");
        return;
      }

      window.alert(error?.response?.data?.msg || "Failed to create course admin");
    }
  };

  const toggleAdminStatus = async (admin) => {
    const nextStatus = admin.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await updateCourseAdminStatus(admin.id, nextStatus);
      await loadData();
    } catch (error) {
      if (error?.response?.status === 404 || error?.response?.status === 405) {
        window.alert("Deactivate/activate endpoint is not exposed by backend yet.");
        return;
      }

      window.alert(error?.response?.data?.msg || "Failed to update course admin status");
    }
  };

  const columns = [
    { key: "fullName", header: "Course Admin" },
    { key: "email", header: "Email" },
    { key: "status", header: "Status" },
    { key: "assignedCount", header: "Assigned Courses" },
    {
      key: "assignedList",
      header: "Managed Courses",
      render: (_, row) => (row.assignedCourses.length ? row.assignedCourses.map((course) => course.name).join(", ") : "-"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <TableActions
          actions={[
            { label: "Assign Course", tone: "update", onClick: () => openAssign(row) },
            {
              label: "Unassign Course",
              tone: "update",
              disabled: row.assignedCount === 0,
              onClick: () => openUnassign(row),
            },
            {
              label: row.status === "ACTIVE" ? "Deactivate" : "Activate",
              tone: row.status === "ACTIVE" ? "delete" : "update",
              onClick: () => toggleAdminStatus(row),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[40px] leading-none text-ink">Course Admins</h2>
          <p className="font-abel text-base text-ink/65">
            Manage all course admins and assign courses for operational ownership.
          </p>
        </div>
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search course admins"
            className="font-abel rounded-[24px] border-b border-ink/40 bg-transparent px-4 py-3 text-base outline-none"
          />
          <button
            type="button"
            onClick={() => setOpenCreateModal(true)}
            className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]"
          >
            Add Admin
          </button>
        </div>
      </div>

      <DataTable columns={columns} data={loading ? [] : filtered} />
      {loading && <p className="font-abel text-sm text-ink/60">Loading course admins...</p>}

      <Modal
        open={openAssignModal}
        title={`Assign Course${selectedAdmin ? ` - ${selectedAdmin.fullName}` : ""}`}
        onClose={() => setOpenAssignModal(false)}
      >
        <div className="space-y-4">
          <label className="block">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Course</span>
            <select
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
              className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            >
              <option value="">Select a course</option>
              {unassignedOrOtherCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.createdByName || "Unassigned"})
                </option>
              ))}
            </select>
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={assignCourse}
              className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]"
            >
              Assign
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={openUnassignModal}
        title={`Unassign Course${selectedAdmin ? ` - ${selectedAdmin.fullName}` : ""}`}
        onClose={() => setOpenUnassignModal(false)}
      >
        <div className="space-y-4">
          <label className="block">
            <span className="font-abel mb-2 block text-sm font-medium text-ink/80">Assigned Course</span>
            <select
              value={selectedUnassignCourseId}
              onChange={(event) => setSelectedUnassignCourseId(event.target.value)}
              className="font-abel w-full rounded-[24px] border border-black/10 bg-sand px-4 py-3 text-base text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/15"
            >
              <option value="">Select assigned course</option>
              {(selectedAdmin?.assignedCourses || []).map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={unassignCourse}
              className="font-bebas rounded-[24px] bg-[#C24D5A] px-5 py-3 text-xl text-white"
            >
              Unassign
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={openCreateModal} title="Create Course Admin" onClose={() => setOpenCreateModal(false)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput
            label="Full Name"
            value={createForm.fullName}
            onChange={(event) => setCreateForm((current) => ({ ...current, fullName: event.target.value }))}
          />
          <FormInput
            label="Email"
            type="email"
            value={createForm.email}
            onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
          />
          <FormInput
            label="Password"
            type="password"
            className="md:col-span-2"
            value={createForm.password}
            onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={saveCourseAdmin}
            className="font-bebas rounded-[24px] bg-[#C7A94A] px-5 py-3 text-xl text-[#192016]"
          >
            Create Admin
          </button>
        </div>
      </Modal>
    </div>
  );
}
