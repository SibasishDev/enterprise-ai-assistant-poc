export async function uploadFileToS3(
    uploadUrl: string,
    file: File,
    onProgress: (progess: number) => void
): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("PUT", uploadUrl);

        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (event) => {
            if(!event.lengthComputable){
                return;
            }

            const progress = Math.round((event.loaded / event.total) * 100);

            onProgress?.(progress);
        };

        xhr.onload = () => {
            if(xhr.status >= 200 && xhr.status < 300){
                resolve();
            }else{
                reject(new Error(`S3 upload failed with status ${xhr.status}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error("Network error while uploading file"));
        };

        xhr.onabort = () => {
            reject(new Error("Upload was cancelled"));
        };

        xhr.send(file);
    });
}