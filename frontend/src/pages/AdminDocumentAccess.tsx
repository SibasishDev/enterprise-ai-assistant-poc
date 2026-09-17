import React, { useState, useEffect } from "react";
// import AdminDocuments from "./AdminDocuments";
import { uploadFileToS3 } from "../services/s3-upload"; // The fixed engine we checked earlier

type DynamicItem = { id: string; name: string };

export default function AdminDocuments() {
  const [file, setFile] = useState<File | null>(null);
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [docType, setDocType] = useState("");
  const [accessLevel, setAccessLevel] = useState("PRIVATE");
  
  // State for created document tracking
  const [createdDocumentId, setCreatedDocumentId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  // Dynamic & Static API fields
  const [departments, setDepartments] = useState<DynamicItem[]>([]);
  
  // Dummy data arrays for Category and Document Type
  const categories = [
    { id: "policy", name: "Policy" },
    { id: "compliance", name: "Compliance" },
    { id: "finance", name: "Finance" },
    { id: "technical", name: "Technical" }
  ];

  const documentTypes = [
    { id: "hr_policy", name: "HR Policy" },
    { id: "user_guide", name: "User Guide" },
    { id: "contract", name: "Contract" },
    { id: "invoice", name: "Invoice" }
  ];

  // Fetch dynamic departments on mount
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/v1/departments`)
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error("Failed to load departments:", err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first");

    setIsUploading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      
      // Step 1: Tell backend to prepare a record and generate a presigned S3 url
      const response = await fetch(`${API_URL}/api/v1/documents/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          department,
          category,
          documentType: docType,
          accessLevel
        })
      });

      const { documentId, uploadUrl } = await response.json();

      // Step 2: Upload raw binary directly to S3 using your original XMLHttpRequest hook
      await uploadFileToS3(uploadUrl, file, (progress) => {
        setUploadProgress(progress);
      });

      setCreatedDocumentId(documentId);
      alert("Document uploaded successfully! Now assign granular access weights.");
    } catch (error) {
      console.error("Upload workflow failed:", error);
      alert("Error occurred during ingestion processing loop.");
    } finally {
      setIsUploading(false);
    }
  };

  // Mock users list context parameter to satisfy AdminDocumentAccess requirements
  const dummyUsers: any[] = [
    { id: "u-1", email: "manager@company.com", role: "USER", isActive: true },
    { id: "u-2", email: "engineer@company.com", role: "USER", isActive: true }
  ];

  return (
    <div style={{ maxWidth: "500px", padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Upload Document</h2>
      <hr style={{ marginBottom: "20px" }} />
      
      <form onSubmit={handleUploadSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>File:</label>
          <input type="file" accept=".pdf" onChange={handleFileChange} />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Department:</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)} style={{ width: "100%", padding: "8px" }}>
            <option value="">Select Department --</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: "8px" }}>
            <option value="">Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Document Type:</label>
          <select value={docType} onChange={(e) => setDocType(e.target.value)} style={{ width: "100%", padding: "8px" }}>
            <option value="">Select Type --</option>
            {documentTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Access Level:</label>
          <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)} style={{ width: "100%", padding: "8px" }}>
            <option value="PRIVATE">Private</option>
            <option value="DEPARTMENT">Department</option>
            <option value="TENANT">Tenant</option>
          </select>
        </div>

        <button type="submit" disabled={isUploading} style={{ padding: "10px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
          {isUploading ? `Uploading (${uploadProgress}%)` : "Upload"}
        </button>
      </form>

      {/* Render access permission checkbox matrix only after upload finishes successfully */}
      {/* {createdDocumentId && (
        <div style={{ marginTop: "30px", padding: "15px", border: "1px dashed #ccc" }}>
          <AdminDocumentAccess documentId={createdDocumentId} users={dummyUsers} />
        </div>
      )} */}
    </div>
  );
}
