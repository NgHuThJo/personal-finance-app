export function areSetsEqual<K>(setA: Set<unknown>, setB: Set<K>) {
  if (setA.size !== setB.size) {
    return false;
  }

  for (const item of setB) {
    if (!setA.has(item)) {
      return false;
    }
  }

  return true;
}
