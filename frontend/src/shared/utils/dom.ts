export function swapDomElementNodes(
  element1: HTMLElement,
  element2: HTMLElement,
) {
  const parent1 = element1.parentElement;
  const parent2 = element2.parentElement;

  if (!parent1 || !parent2) {
    throw new Error(
      `DOM element does not have parent in ${swapDomElementNodes.name}`,
    );
  }

  const sibling1 = element1.nextElementSibling;
  const sibling2 = element2.nextElementSibling;

  parent1.insertBefore(element2, sibling1);
  parent2.insertBefore(element1, sibling2);
}
