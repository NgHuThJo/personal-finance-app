import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useReducer, useRef } from "react";
import styles from "./board.module.css";
import { AddPotDialog } from "#frontend/features/pots/components/add-pot-dialog";
import { PotCard } from "#frontend/features/pots/components/pot-card";
import { clientWithAuth } from "#frontend/shared/api/client";
import { getAllPotsOptions } from "#frontend/shared/client/@tanstack/react-query.gen";
import { useThrottle } from "#frontend/shared/hooks/use-throttle";
import { swapDomElementNodes } from "#frontend/shared/utils/dom";

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
  const origins = useRef({
    eventPageX: 0,
    eventPageY: 0,
    currentElementPageX: 0,
    currentElementPageY: 0,
    currentTranslatePageX: 0,
    currentTranslatePageY: 0,
  });
  const potListRef = useRef<HTMLUListElement>(null);
  const currentTargetRef = useRef<HTMLElement>(null);
  const throttledPointerMoveCallback = useThrottle((e: PointerEvent) => {
    if (state !== "dragging" || !currentTargetRef.current) {
      return;
    }

    const rawX = e.pageX - origins.current.eventPageX;
    const rawY = e.pageY - origins.current.eventPageY;
    const transforms = {
      x: rawX,
      y: rawY,
    };
    const targetRect = currentTargetRef.current.getBoundingClientRect();

    const minX = -origins.current.currentElementPageX;
    const minY = -origins.current.currentElementPageY;
    const maxX =
      document.documentElement.scrollWidth -
      origins.current.currentElementPageX -
      targetRect.width;
    const maxY =
      document.documentElement.scrollHeight -
      origins.current.currentElementPageY -
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
    currentTargetRef.current.style.translate = `${transforms.x}px ${transforms.y}px`;
    origins.current.currentTranslatePageX = transforms.x;
    origins.current.currentTranslatePageY = transforms.y;
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
      const target = event.target as HTMLElement;

      const nearestPotCard = target.closest(`li`);

      if (!nearestPotCard) {
        return;
      }

      currentTargetRef.current = nearestPotCard;
      // currentTargetRef.current.setPointerCapture(event.pointerId);

      const currentTargetRect = nearestPotCard.getBoundingClientRect();
      const currentTargetPageX = window.pageXOffset + currentTargetRect.left;
      const currentTargetPageY = window.pageYOffset + currentTargetRect.top;

      origins.current.eventPageX = event.pageX;
      origins.current.eventPageY = event.pageY;
      origins.current.currentElementPageX = currentTargetPageX;
      origins.current.currentElementPageY = currentTargetPageY;

      if (styles["dragging"] === undefined) {
        throw new Error(
          `${PotsBoard.name} stylesheet does not have "dragging" class`,
        );
      }
      currentTargetRef.current.classList.add(styles?.["dragging"]);

      currentTargetRef.current.ondragstart = disableBrowserDefaultDragStart;
    };

    const handlePointerUp = (event: PointerEvent) => {
      currentTargetRef.current?.releasePointerCapture(event.pointerId);
      dispatch({ type: "dragEnd" });

      if (!currentTargetRef.current) {
        return;
      }

      // VERY IMPORTANT: if you do not remove the inline styles, then they would be reapplied after the animation has finished
      currentTargetRef.current.style.translate = "";
      currentTargetRef.current.classList.remove(styles["dragging"] as string);
      const matchedElement = document
        .elementsFromPoint(event.clientX, event.clientY)
        .filter((element) => {
          const dataId = element.getAttribute("data-id");

          return (
            dataId !== null &&
            dataId !== currentTargetRef.current?.getAttribute("data-id")
          );
        })[0] as HTMLElement;

      if (!matchedElement) {
        return;
      }

      const matchedRect = matchedElement.getBoundingClientRect();
      const currentTargetRect =
        currentTargetRef.current.getBoundingClientRect();
      if (styles["switching"] === undefined) {
        throw new Error(
          `${PotsBoard.name} stylesheet does not have "switching" class`,
        );
      }
      const elementMap = new Map<HTMLElement, DOMRect>();
      elementMap.set(matchedElement, matchedRect);
      elementMap.set(currentTargetRef.current, currentTargetRect);

      swapDomElementNodes(matchedElement, currentTargetRef.current);

      elementMap.forEach((prevRect, element) => {
        const currRect = element.getBoundingClientRect();

        const dx = prevRect.left - currRect.left;
        const dy = prevRect.top - currRect.top;

        matchedElement.classList.add(styles["switching"] as string);
        currentTargetRef.current?.classList.add(styles["switching"] as string);

        const animation = element.animate(
          [
            {
              transform: `translate(${dx}px, ${dy}px)`,
            },
            {
              transform: `translate(${0}px, ${0}px)`,
            },
          ],
          {
            easing: "linear",
            duration: 1000,
          },
        );

        animation.finished.then(() => {
          matchedElement.classList.add(styles["switching"] as string);
          currentTargetRef.current?.classList.add(
            styles["switching"] as string,
          );
        });
      });
    };

    potListElement.addEventListener("pointerdown", handlePointerDown);
    potListElement.addEventListener(
      "pointermove",
      throttledPointerMoveCallback,
    );
    potListElement.addEventListener("pointerup", handlePointerUp);

    return () => {
      potListElement.removeEventListener("pointerdown", handlePointerDown);
      potListElement.removeEventListener(
        "pointermove",
        throttledPointerMoveCallback,
      );
      potListElement.removeEventListener("pointerup", handlePointerUp);
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
