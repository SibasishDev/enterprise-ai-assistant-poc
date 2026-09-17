import React, { useEffect, useState } from "react";
import { getUsers, toggleUserDepartment, updateUserRole } from "../services/user";
import { getDepartments } from "../services/department";

// 🛠️ Update Type definition to match your Prisma relation array mapping
type User = {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "TENANT_ADMIN" | "USER";
  tenantId: string;
  departments: { departmentId: string; department: { name: string } }[]; // Refers to UserDepartment join table
  jobTitle?: string;
  location?: string;
  isActive: boolean;
};

type DepartmentItem = { id: string; name: string };

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const [allDepartments, setAllDepartments] = useState<DepartmentItem[]>([]);
  const [activeDropdownUserId, setActiveDropdownUserId] = useState<string | null>(null);

  async function loadInitialData() {
    try {
      const [usersData, departmentsResponse] = await Promise.all([
        getUsers(),
        getDepartments()
      ]);
      
      setUsers(usersData);
      
      if (Array.isArray(departmentsResponse)) {
        setAllDepartments(departmentsResponse);
      } else if (departmentsResponse && Array.isArray(departmentsResponse.departments)) {
        setAllDepartments(departmentsResponse.departments);
      } else if (departmentsResponse && Array.isArray(departmentsResponse.data)) {
        setAllDepartments(departmentsResponse.data);
      } else {
        console.error("API returned an unexpected structure instead of an array:", departmentsResponse);
        setAllDepartments([]); // Fallback to safe empty array
      }
  
    } catch (error) {
      console.error("Failed to load administration data vectors:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  async function handleRoleChange(userId: string, targetRole: string) {
    setUpdatingId(userId);
    try {
      await updateUserRole(userId, targetRole);
      setUsers((current) =>
        current.map((user) =>
          user.id === userId ? { ...user, role: targetRole as User["role"] } : user
        )
      );
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDepartmentToggle(userId: string, departmentId: string, isCurrentlyAssigned: boolean) {
    setUpdatingId(userId);
    try {
      // 1. Fire network call to assign or remove relations map
      await toggleUserDepartment(userId, departmentId, !isCurrentlyAssigned);

      // 2. Compute live UI updates instantly inside your state hook arrays
      setUsers((currentUsers) =>
        currentUsers.map((user) => {
          if (user.id !== userId) return user;

          const currentDepts = user.departments || [];
          let updatedDepts;

          if (isCurrentlyAssigned) {
            // Remove department tag
            updatedDepts = currentDepts.filter((d) => d.departmentId !== departmentId);
          } else {
            // Add newly checked department tag metadata target block reference
            const targetDeptDetails = allDepartments.find((d) => d.id === departmentId);
            updatedDepts = [
              ...currentDepts,
              { departmentId, department: { name: targetDeptDetails?.name || "" } }
            ];
          }

          return { ...user, departments: updatedDepts };
        })
      );
    } catch (error) {
      console.error("Failed to sync structural multi-department configuration layers:", error);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Loading users...</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>User Management</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ccc" }}>
            <th style={{ padding: "8px" }}>Email</th>
            <th style={{ padding: "8px" }}>Role</th>
            <th style={{ padding: "8px" }}>Department</th>
            <th style={{ padding: "8px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              style={{
                borderBottom: "1px solid #eee",
                opacity: updatingId === user.id ? 0.6 : 1, // Visual feedback during network requests
                transition: "opacity 0.2s ease"
              }}
            >
              <td style={{ padding: "8px" }}>{user.email}</td>
              <td style={{ padding: "8px" }}>
                <select
                  value={user.role}
                  disabled={updatingId === user.id}
                  onChange={(event) => handleRoleChange(user.id, event.target.value)}
                  style={{ padding: "4px", borderRadius: "4px" }}
                >
                  <option value="USER">USER</option>
                  <option value="TENANT_ADMIN">TENANT_ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </td>
              
              {/* 🛠️ IMPROVED CELLS: FLOATING POPOVER MULTI-SELECT INTERFACE */}
              <td style={{ padding: "8px", position: "relative" }}>
  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center", maxWidth: "300px" }}>
    {user.departments && user.departments.length > 0 ? (
      user.departments.map((ud) => (
        <span
          key={ud.departmentId}
          style={{
            backgroundColor: "#e8f0fe",
            color: "#1a73e8",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "500"
          }}
        >
          {ud.department?.name}
        </span>
      ))
    ) : (
      <span style={{ color: "#999", fontSize: "12px", fontStyle: "italic" }}>No Departments</span>
    )}
    
    {/* ⚡ FIXED ACTION TOGGLE: Force explicit block logic on click */}
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation(); // Stops the row from stealing the click focus
        console.log("Clicking dropdown for User ID:", user.id);
        setActiveDropdownUserId(activeDropdownUserId === user.id ? null : user.id);
      }}
      style={{
        marginLeft: "auto",
        padding: "4px 8px",
        fontSize: "11px",
        cursor: "pointer",
        borderRadius: "4px",
        border: "1px solid #ccc",
        backgroundColor: "#fff",
        userSelect: "none"
      }}
    >
      {activeDropdownUserId === user.id ? "Close" : "Edit ▾"}
    </button>
  </div>

  {/* ⚡ FIXED POPUP CARD: Added structural positioning guarantees */}
  {activeDropdownUserId === user.id && (
    <div
      style={{
        position: "absolute",
        zIndex: 9999, // 👈 High z-index to make sure it floats OVER other elements
        top: "100%",  // Opens exactly below the badge list row
        right: "8px",
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        padding: "12px",
        minWidth: "180px",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
      }}
    >
      <span style={{ fontSize: "11px", fontWeight: "bold", color: "#666", marginBottom: "4px", display: "block" }}>
        Assign Departments
      </span>
      
      {allDepartments.length === 0 ? (
        <span style={{ fontSize: "12px", color: "#999" }}>No departments available</span>
      ) : (
        allDepartments.map((dept) => {
          const isAssigned = user.departments?.some((ud: any) => ud.departmentId === dept.id);
          return (
            <label
              key={dept.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                cursor: "pointer",
                padding: "2px 0",
                color: "#333"
              }}
            >
              <input
                type="checkbox"
                checked={!!isAssigned}
                disabled={updatingId === user.id}
                onChange={() => handleDepartmentToggle(user.id, dept.id, !!isAssigned)}
              />
              {dept.name}
            </label>
          );
        })
      )}
    </div>
  )}
</td>

              <td style={{ padding: "8px" }}>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    backgroundColor: user.isActive ? "#e6f4ea" : "#fce8e6",
                    color: user.isActive ? "#137333" : "#c5221f"
                  }}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
