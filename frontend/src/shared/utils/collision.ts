type Rectangle = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type CollisionDirection = "top" | "right" | "bottom" | "left" | "none";

export function doesRectangleCrossContainerBoundary(
  rectangle: Rectangle,
  container: Rectangle,
): CollisionDirection[] {
  const collisions: CollisionDirection[] = [];

  if (rectangle.top < container.top) {
    collisions.push("top");
  }
  if (rectangle.right > container.right) {
    collisions.push("right");
  }
  if (rectangle.bottom > container.bottom) {
    collisions.push("bottom");
  }
  if (rectangle.left < container.left) {
    collisions.push("left");
  }

  return collisions.length ? collisions : ["none"];
}
