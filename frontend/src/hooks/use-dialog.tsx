import { MouseEvent, useRef } from "react";

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
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  };

  return { dialogRef, openDialog, closeDialog, handleDialogBackgroundClick };
}
