import { useProgress } from "#frontend/hooks/use-upload-download-progress";

export function ProgressBar() {
  const { downloadProgress, uploadProgress } = useProgress();

  return (
    <progress value={uploadProgress + downloadProgress} max={100}></progress>
  );
}
