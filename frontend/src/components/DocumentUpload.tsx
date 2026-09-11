import { useRef, useState } from "react";
import { createUploadUrl } from "../services/document";
import { uploadFileToS3 } from "../services/s3-upload";

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function DocumentUpload(){
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);

    const [progress, setProgress] = useState(0);

    const [uploading, setUploading] = useState(false);

    const [success, setSuccess] = useState("");

    const [error, setError] = useState("");

    function handleFileChange(
        event: React.ChangeEvent<HTMLInputElement>
    ){
        const selectedFile = event.target.files?.[0];

        setSuccess("");
        setError("");
        setProgress(0);

        if(!selectedFile){
            return;
        }

        if(selectedFile.type !== "application/pdf"){
            setError("Only PDF files are allowed");
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError(
              "File size must be less than 50 MB."
            );
            return;
          }
      
          setFile(selectedFile);
        }

          async function handleUpload() {
            if (!file) {
              setError("Please select a PDF file.");
              return;
            }
        
            try {
              setUploading(true);
              setError("");
              setSuccess("");
              setProgress(0);
        
              // Step 1:
              // Ask backend for a presigned S3 URL
        
              const uploadData = await createUploadUrl({
                fileName: file.name,
                contentType: file.type,
                fileSize: file.size
              });
        
              console.log(
                "Document created:",
                uploadData.documentId
              );
        
              // Step 2:
              // Upload directly to S3
        
              await uploadFileToS3(
                uploadData.uploadUrl,
                file,
                setProgress
              );
        
              // Step 3:
              // Upload completed
        
              setSuccess(
                `Document uploaded successfully. ID: ${uploadData.documentId}`
              );
        
              setFile(null);
              setProgress(100);
        
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            } catch (err) {
              console.error(err);
        
              setError(
                err instanceof Error
                  ? err.message
                  : "Upload failed"
              );
            } finally {
              setUploading(false);
            }
        }
        
          return (
            <div style={{ maxWidth: 600 }}>
              <h2>Upload Document</h2>
        
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={uploading}
              />
        
              {file && (
                <div style={{ marginTop: 16 }}>
                  <p>
                    <strong>File:</strong>{" "}
                    {file.name}
                  </p>
        
                  <p>
                    <strong>Size:</strong>{" "}
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
        
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading
                      ? "Uploading..."
                      : "Upload Document"}
                  </button>
                </div>
              )}
        
              {uploading && (
                <div style={{ marginTop: 16 }}>
                  <p>
                    Upload Progress: {progress}%
                  </p>
        
                  <progress
                    value={progress}
                    max={100}
                    style={{
                      width: "100%"
                    }}
                  />
                </div>
              )}
        
              {success && (
                <p
                  style={{
                    marginTop: 16
                  }}
                >
                  ✅ {success}
                </p>
              )}
        
              {error && (
                <p
                  style={{
                    marginTop: 16
                  }}
                >
                  ❌ {error}
                </p>
              )}
            </div>
          );
}