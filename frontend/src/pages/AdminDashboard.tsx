import {
    Link
  } from "react-router-dom";
  
  export default function AdminDashboard() {
  
    return (
      <div
        style={{
          maxWidth: "1000px",
          margin: "40px auto",
          padding: "24px"
        }}
      >
  
        <h1>
          Admin Dashboard
        </h1>
  
        <p>
          Manage your enterprise knowledge base.
        </p>
  
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "30px"
          }}
        >
  
          <Link
            to="/admin/documents"
            style={{
              border: "1px solid #ddd",
              padding: "20px",
              borderRadius: "8px",
              textDecoration: "none"
            }}
          >
            <h3>
              Documents
            </h3>
  
            <p>
              Upload and manage knowledge documents.
            </p>
          </Link>
  
        </div>
  
      </div>
    );
  }