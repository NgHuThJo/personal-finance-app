import { FormEvent, useState } from "react";

export function useProgress() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload =
    (url: string) => (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setUploadProgress(0);
      setDownloadProgress(0);
      setIsUploading(true);

      const formData = new FormData(event.currentTarget);
      const xhr = new XMLHttpRequest();

      xhr.open("POST", url);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded * 50) / event.total);
          setUploadProgress(percentComplete);
          console.log(`Upload progress: ${percentComplete}%`);
        }
      };
      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded * 50) / event.total);
          setDownloadProgress(percentComplete);
          console.log(`Download progress: ${percentComplete}%`);
        }
      };
      xhr.onload = () => {
        console.log("File upload done");
        setIsUploading(false);
      };
      xhr.onerror = () => {
        console.error("Error occured during file upload");
        setIsUploading(false);
      };

      xhr.send(formData);
    };

  return { handleFileUpload, isUploading, downloadProgress, uploadProgress };
}
