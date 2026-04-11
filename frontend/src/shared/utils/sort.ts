class SortHelper {
  compareOldest(a: Date, b: Date) {
    return a.valueOf() - b.valueOf();
  }

  compareNewest(a: Date, b: Date) {
    return b.valueOf() - a.valueOf();
  }

  compareAToZ(a: string, b: string) {
    if (a > b) {
      return 1;
    }

    if (a < b) {
      return -1;
    }

    return 0;
  }

  compareZToA(a: string, b: string) {
    if (a < b) {
      return 1;
    }

    if (a > b) {
      return -1;
    }

    return 0;
  }

  compareHighest(a: number, b: number) {
    return b - a;
  }

  compareLowest(a: number, b: number) {
    return a - b;
  }
}

export const sortHelper = new SortHelper();
