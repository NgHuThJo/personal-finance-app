import { useRef, type MouseEvent } from "react";

export function useDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = () => {
    dialogRef.current?.showModal();
  };

  const closeDialog = () => {
    dialogRef.current?.close();
  };

  const handleDialogBackgroundClick = (
    event: MouseEvent<HTMLDialogElement>,
  ) => {
    if (event.currentTarget == event.target) {
      dialogRef.current?.close();
    }
  };

  return { dialogRef, openDialog, closeDialog, handleDialogBackgroundClick };
}
