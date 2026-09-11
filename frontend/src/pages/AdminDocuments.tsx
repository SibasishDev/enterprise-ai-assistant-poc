import { useState } from "react";

import {
  createUploadUrl
} from "../services/document";

import {
  uploadFileToS3
} from "../services/s3-upload";

export default function AdminDocuments() {

  const [file, setFile] =
    useState<File | null>(null);

  const [progress, setProgress] =
    useState(0);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    setMessage("");
    setError("");
    setProgress(0);

    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    /*
     * Only PDF files
     */
    if (
      selectedFile.type !==
      "application/pdf"
    ) {

      setError(
        "Only PDF files are allowed."
      );

      setFile(null);

      return;
    }

    /*
     * Maximum 50 MB
     */
    const maxSize =
      50 * 1024 * 1024;

    if (
      selectedFile.size > maxSize
    ) {

      setError(
        "File size cannot exceed 50 MB."
      );

      setFile(null);

      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload() {

    if (!file) {
      setError(
        "Please select a PDF file."
      );
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
       */

      console.log("here");
      
      const upload =
        await createUploadUrl({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size
        });

      /*
       * Step 2:
       * Upload directly to S3
       */
      await uploadFileToS3(
        upload.uploadUrl,
        file,
        (percentage) => {
          setProgress(percentage);
        }
      );

      setMessage(
        `Document "${file.name}" uploaded successfully.`
      );

      setFile(null);
      setProgress(100);

    } catch (error) {

      console.error(
        "Upload failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Document upload failed."
      );

    } finally {

      setUploading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "24px"
      }}
    >

      <h1>
        Document Management
      </h1>

      <p>
        Upload enterprise knowledge documents
        for your tenant.
      </p>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "24px",
          marginTop: "24px"
        }}
      >

        <h2>
          Upload Document
        </h2>

        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
        />

        {file && (
          <div
            style={{
              marginTop: "16px"
            }}
          >

            <strong>
              Selected file:
            </strong>

            <div>
              {file.name}
            </div>

            <div>
              {(file.size / 1024 / 1024)
                .toFixed(2)} MB
            </div>

          </div>
        )}

        {uploading && (
          <div
            style={{
              marginTop: "20px"
            }}
          >

            <div>
              Uploading: {progress}%
            </div>

            <progress
              value={progress}
              max={100}
              style={{
                width: "100%"
              }}
            />

          </div>
        )}

        {message && (
          <div
            style={{
              marginTop: "20px"
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "20px"
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={
            !file ||
            uploading
          }
          style={{
            marginTop: "20px",
            padding: "10px 20px"
          }}
        >
          {uploading
            ? "Uploading..."
            : "Upload Document"}
        </button>

      </div>

    </div>
  );
}