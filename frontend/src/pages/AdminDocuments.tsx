import React, { useState, useEffect } from "react";
import { createUploadUrl } from "../services/document";
import { uploadFileToS3 } from "../services/s3-upload";
import { getDepartments } from "../services/department";

type DepartmentItem = { id: string; name: string };

export default function AdminDocuments() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 🛠️ NEW: Form states for dropdown parameters
  const [department, setDepartment] = useState("");
  const [category, setCategory] = useState("");
  const [docType, setDocType] = useState("");
  const [accessLevel, setAccessLevel] = useState("PRIVATE");

  // 🛠️ NEW: State for API dynamic department list
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);

  // 🛠️ NEW: Dummy options for Category and Document Type
  const categories = [
    { id: "policy", name: "Policy" },
    { id: "compliance", name: "Compliance" },
    { id: "finance", name: "Finance" },
    { id: "technical", name: "Technical" },
  ];

  const documentTypes = [
    { id: "hr_policy", name: "HR Policy" },
    { id: "user_guide", name: "User Guide" },
    { id: "contract", name: "Contract" },
    { id: "invoice", name: "Invoice" },
  ];

  async function loadDepartments() {
      try {
        const data = await getDepartments();
        setDepartments(data.data);
      } catch (error) {
        console.error("Failed to load departments:", error);
      }
    }
  
    useEffect(() => {
        loadDepartments();
    }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setMessage("");
    setError("");
    setProgress(0);
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("File size cannot exceed 50 MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    setUploading(true);
    setMessage("");
    setError("");
    setProgress(0);

    try {
      /*
       * Step 1:
       * Ask backend for S3 presigned URL
       * 🛠️ NEW: Passing down selected metadata values along with payload parameters
       */
      const upload = await createUploadUrl({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
        departmentId: department,
        category,
        documentType: docType,
        accessLevel,
      });

      /*
       * Step 2:
       * Upload directly to S3
       */
      await uploadFileToS3(upload.uploadUrl, file, (percentage) => {
        setProgress(percentage);
      });

      setMessage(`Document "${file.name}" uploaded successfully.`);
      setFile(null);
      setProgress(100);
      
      // Reset dropdown choices after successful ingestion
      setDepartment("");
      setCategory("");
      setDocType("");
      setAccessLevel("PRIVATE");
    } catch (error) {
      console.error("Upload failed:", error);
      setError(
        error instanceof Error ? error.message : "Document upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "24px" }}>
      <h1> Document Management </h1>
      <p> Upload enterprise knowledge documents for your tenant. </p>
      
      <div style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "24px", marginTop: "24px" }}>
        <h2> Upload Document </h2>
        <hr style={{ marginBottom: "20px", borderColor: "#eee", borderStyle: "solid" }} />
        
        {/* File Picker row */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>File Selection:</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} disabled={uploading} />
        </div>

        {/* 🛠️ NEW: Form Selection Rows */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Department:</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} disabled={uploading} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
              <option value="">Select Department --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Category:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={uploading} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
              <option value="">Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Document Type:</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)} disabled={uploading} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
              <option value="">Select Type --</option>
              {documentTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Access level:</label>
            <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)} disabled={uploading} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}>
              <option value="PRIVATE">Private</option>
              <option value="DEPARTMENT">Department</option>
              <option value="TENANT">Tenant</option>
            </select>
          </div>
        </div>

        {file && (
          <div style={{ marginTop: "16px", backgroundColor: "#f9f9f9", padding: "12px", borderRadius: "4px" }}>
            <strong> Selected file: </strong>
            <div> {file.name} </div>
            <div> {(file.size / 1024 / 1024).toFixed(2)} MB </div>
          </div>
        )}

        {uploading && (
          <div style={{ marginTop: "20px" }}>
            <div> Uploading: {progress}% </div>
            <progress value={progress} max={100} style={{ width: "100%" }} />
          </div>
        )}

        {message && <div style={{ marginTop: "20px", color: "green", fontWeight: "bold" }}> {message} </div>}
        {error && <div style={{ marginTop: "20px", color: "red", fontWeight: "bold" }}> {error} </div>}

        <button onClick={handleUpload} disabled={!file || uploading} style={{ marginTop: "20px", padding: "10px 20px", cursor: !file || uploading ? "not-allowed" : "pointer" }}>
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>
    </div>
  );
}
