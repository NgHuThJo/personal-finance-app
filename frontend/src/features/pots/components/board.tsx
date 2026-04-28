import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useReducer, useRef } from "react";
import styles from "./board.module.css";
import { AddPotDialog } from "#frontend/features/pots/components/add-pot-dialog";
import { PotCard } from "#frontend/features/pots/components/pot-card";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllPotsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { useThrottle } from "#frontend/shared/hooks/use-throttle";

type Action = {
  type: "dragStart" | "dragEnd";
};

type DragState = "idle" | "dragging";

function reducer(state: DragState, action: Action) {
  switch (action.type) {
    case "dragStart": {
      return "dragging";
    }
    case "dragEnd": {
      return "idle";
    }
    default: {
      throw new Error(`Invalid state transition, ${state} -> ${action.type}`);
    }
  }
}

const SCROLL_FACTOR = 10;

export function PotsBoard() {
  const [state, dispatch] = useReducer(reducer, "idle");
  const { data } = useSuspenseQuery({
    ...getAllPotsOptions({
      client: clientWithAuth,
    }),
  });
  const eventOrigin = useRef({
    eventPageX: 0,
    eventPageY: 0,
  });
  const potListRef = useRef<HTMLUListElement>(null);
  const targetMapRef = useRef<
    Map<
      HTMLElement,
      {
        elementPageX: number;
        elementPageY: number;
        currentTranslateX: number;
        currentTranslateY: number;
      }
    >
  >(new Map());
  const currentTargetRef = useRef<HTMLElement>(null);
  const throttledPointerMoveCallback = useThrottle((e: PointerEvent) => {
    if (state !== "dragging" || !currentTargetRef.current) {
      return;
    }
    const currentElement = targetMapRef.current.get(currentTargetRef.current);

    if (!currentElement) {
      return;
    }

    const rawX = e.pageX - eventOrigin.current.eventPageX;
    const rawY = e.pageY - eventOrigin.current.eventPageY;
    const transforms = {
      x: rawX,
      y: rawY,
    };
    const targetRect = currentTargetRef.current.getBoundingClientRect();

    const minX = -currentElement.elementPageX;
    const minY = -currentElement.elementPageY;
    const maxX =
      document.documentElement.scrollWidth -
      currentElement.elementPageX -
      targetRect.width;
    const maxY =
      document.documentElement.scrollHeight -
      currentElement.elementPageY -
      targetRect.height;

    transforms.x = Math.min(maxX, Math.max(transforms.x, minX));
    transforms.y = Math.min(maxY, Math.max(transforms.y, minY));

    let scrollX = 0;
    let scrollY = 0;

    if (targetRect.left < 0) {
      scrollX = targetRect.left;
    } else if (targetRect.right > document.documentElement.clientWidth) {
      scrollX = targetRect.right - document.documentElement.clientWidth;
    }
    if (targetRect.top < 0) {
      scrollY = targetRect.top;
    } else if (targetRect.bottom > document.documentElement.clientHeight) {
      scrollY = targetRect.bottom - document.documentElement.clientHeight;
    }

    if (scrollX !== 0 || scrollY !== 0) {
      window.scrollBy({
        left: scrollX * SCROLL_FACTOR,
        top: scrollY * SCROLL_FACTOR,
        behavior: "smooth",
      });
    }

    currentElement.currentTranslateX = transforms.x;
    currentElement.currentTranslateY = transforms.y;
    currentTargetRef.current.style.translate = `${transforms.x}px ${transforms.y}px`;
  }, 1000 / 60);

  useEffect(() => {
    const potListElement = potListRef.current;
    if (!potListElement) {
      return;
    }

    const disableBrowserDefaultDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    const handlePointerDown = (event: PointerEvent) => {
      requestAnimationFrame(() => {});

      const target = event.target as HTMLElement;
      const nearestPotCard = target.closest(`li`);

      if (!nearestPotCard) {
        return;
      }

      const rectangle = nearestPotCard.getBoundingClientRect();

      if (!targetMapRef.current.has(nearestPotCard)) {
        targetMapRef.current.set(nearestPotCard, {
          elementPageX: window.pageXOffset + rectangle.left,
          elementPageY: window.pageYOffset + rectangle.top,
          currentTranslateX: 0,
          currentTranslateY: 0,
        });
      }
      currentTargetRef.current = nearestPotCard;
      const currentTarget = targetMapRef.current.get(nearestPotCard);

      if (!currentTarget) {
        return;
      }

      eventOrigin.current.eventPageX =
        event.pageX - currentTarget.currentTranslateX;
      eventOrigin.current.eventPageY =
        event.pageY - currentTarget.currentTranslateY;

      currentTargetRef.current.setPointerCapture(event.pointerId);

      if (styles["dragging"] === undefined) {
        throw new Error(
          `${PotsBoard.name} stylesheet does not have "dragging" class`,
        );
      }
      currentTargetRef.current.classList.add(styles["dragging"]);

      currentTargetRef.current.ondragstart = disableBrowserDefaultDragStart;
      dispatch({
        type: "dragStart",
      });
    };

    const handlePointerUp = (event: PointerEvent) => {
      currentTargetRef.current?.releasePointerCapture(event.pointerId);
      dispatch({ type: "dragEnd" });

      if (!currentTargetRef.current) {
        return;
      }

      const currentElement = targetMapRef.current.get(currentTargetRef.current);
      const matchedElement = document
        .elementsFromPoint(event.clientX, event.clientY)
        .filter((element) => {
          const dataId = element.getAttribute("data-id");

          return (
            dataId !== null &&
            dataId !== currentTargetRef.current?.getAttribute("data-id")
          );
        })[0] as HTMLElement;

      if (!matchedElement || !currentElement) {
        return;
      }

      const matchedRect = matchedElement.getBoundingClientRect();
      const fromMatchedToTarget = {
        dx:
          currentElement.elementPageX - (matchedRect.left + window.pageXOffset),
        dy:
          currentElement.elementPageY - (matchedRect.top + window.pageYOffset),
      };

      matchedElement.style.translate = `${fromMatchedToTarget.dx}px ${fromMatchedToTarget.dy}px`;

      // targetRef.current.style.translate = "";
    };

    potListElement.addEventListener("pointerdown", handlePointerDown);
    potListElement.addEventListener(
      "pointermove",
      throttledPointerMoveCallback,
    );
    potListElement.addEventListener("pointerup", handlePointerUp);

    return () => {
      potListElement.removeEventListener("pointerdown", handlePointerDown);
      potListElement.addEventListener(
        "pointermove",
        throttledPointerMoveCallback,
      );
      potListElement.addEventListener("pointerup", handlePointerUp);
    };
  }, [throttledPointerMoveCallback]);

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Pots</h1>
        <AddPotDialog />
      </header>
      {data.length ? (
        <ul className={styles.body} ref={potListRef}>
          {data.map((pot) => (
            <li key={pot.id} data-id={pot.id}>
              <PotCard potData={pot} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles["status-report"]}>
          You have not created a pot yet.
        </p>
      )}
    </div>
  );
}
