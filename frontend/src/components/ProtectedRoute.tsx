import {
    Navigate
  } from "react-router-dom";
  
  interface ProtectedRouteProps {
    children: React.ReactNode;
  
    allowedRoles?: string[];
  
    userRole: string | null;
  }
  
  export default function ProtectedRoute({
    children,
    allowedRoles,
    userRole
  }: ProtectedRouteProps) {
  
    /*
     * User isn't authenticated
     */
    if (!userRole) {
      return (
        <Navigate
          to="/chat"
          replace
        />
      );
    }
  
    /*
     * Role isn't allowed
     */
    if (
      allowedRoles &&
      !allowedRoles.includes(userRole)
    ) {
  
      return (
        <Navigate
          to="/chat"
          replace
        />
      );
    }
  
    return children;
  }