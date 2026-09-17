import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import React, { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDocuments from "./pages/AdminDocuments";
import ChatPage from "./pages/ChatPage";
import AdminUsers from "./pages/AdminUsers";

// 🛡️ NEW: Role-based route guard wrapper component
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdminRole() {
      try {
        const session = await fetchAuthSession();
        const userRole = session?.tokens?.idToken?.payload?.["cognito:groups"]?.[0] || "User";

        if (userRole.includes('Admin')) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth role evaluation exception:", error);
        setIsAdmin(false);
      }
    }
    checkAdminRole();
  }, []);

  // While evaluating token states, render a clean loading element placeholder block
  if (isAdmin === null) {
    return <div style={{ padding: "20px" }}>Evaluating application security clear privileges...</div>;
  }

  // Redirect to the generic user chat terminal dashboard if they are unauthorized
  return isAdmin ? <>{children}</> : <Navigate to="/chat" replace />;
}

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>
          <div style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                Welcome, {user?.signInDetails?.loginId || user?.username}
              </div>
              <button onClick={signOut}> Sign Out </button>
            </div>
            
            <Routes>
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="/chat" element={<ChatPage />} />
              
              {/* ⚡ Protect your admin layout screens by wrapping them inside the route guard */}
              <Route path="/admin" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedAdminRoute>
                  <AdminUsers />
                </ProtectedAdminRoute>
              } />
              
              <Route path="/admin/documents" element={
                <ProtectedAdminRoute>
                  <AdminDocuments />
                </ProtectedAdminRoute>
              } />
              
              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      )}
    </Authenticator>
  );
}
