import { useEffect, useRef } from "react";

export function useDragAndDropSwap<T extends HTMLElement>() {
  const parentRef = useRef<T | null>(null);
  const draggedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleDragStart = (event: DragEvent) => {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }

      const draggableElement = event.target.closest("[draggable]");

      if (draggableElement instanceof HTMLElement) {
        draggableElement.dataset.active = "true";
        draggedElementRef.current = draggableElement;
      }
    };

    const handleDragEnter = (event: DragEvent) => {
      if (
        !(event.target instanceof HTMLElement) ||
        event.target === draggedElementRef.current
      ) {
        return;
      }

      event.target.dataset.drop = "true";
    };

    const handleDragLeave = (event: DragEvent) => {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }

      delete event.target.dataset.drop;
    };

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();

      if (
        !draggedElementRef.current ||
        !(event.target instanceof HTMLElement)
      ) {
        return;
      }

      const target = event.target.closest("[draggable]");

      if (
        !(target instanceof HTMLElement) ||
        target === draggedElementRef.current
      ) {
        return;
      }

      const onTransitionEnd = (event: TransitionEvent) => {
        if (
          event.propertyName !== "transform" ||
          !draggedElementRef.current ||
          !target
        ) {
          return;
        }

        draggedElementRef.current.style.transform = "";
        target.style.transform = "";

        const tempNode = document.createTextNode("");
        target.before(tempNode);
        draggedElementRef.current.replaceWith(target);
        tempNode.replaceWith(draggedElementRef.current);

        draggedElementRef.current.removeEventListener(
          "transitionend",
          onTransitionEnd,
        );
        target.removeEventListener("transitionend", onTransitionEnd);

        draggedElementRef.current = null;

        delete parentRef.current?.dataset.animating;
      };

      draggedElementRef.current.addEventListener(
        "transitionend",
        onTransitionEnd,
      );
      target.addEventListener("transitionend", onTransitionEnd);

      const originRect = draggedElementRef.current.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const deltaX = targetRect.left - originRect.left;
      const deltaY = targetRect.top - originRect.top;

      draggedElementRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      target.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
      delete target.dataset.drop;

      if (parentRef.current) {
        parentRef.current.dataset.animating = "true";
      }
    };

    const handleDragEnd = () => {
      delete draggedElementRef.current?.dataset.active;
    };

    const parentElement = parentRef.current;

    parentElement?.addEventListener("dragstart", handleDragStart);
    parentElement?.addEventListener("dragenter", handleDragEnter);
    parentElement?.addEventListener("dragleave", handleDragLeave);
    parentElement?.addEventListener("dragover", handleDragOver);
    parentElement?.addEventListener("drop", handleDrop);
    parentElement?.addEventListener("dragend", handleDragEnd);

    return () => {
      parentElement?.removeEventListener("dragstart", handleDragStart);
      parentElement?.removeEventListener("dragenter", handleDragEnter);
      parentElement?.removeEventListener("dragleave", handleDragLeave);
      parentElement?.removeEventListener("dragover", handleDragOver);
      parentElement?.removeEventListener("drop", handleDrop);
      parentElement?.removeEventListener("dragend", handleDragEnd);
    };
  }, []);

  return { parentRef };
}
