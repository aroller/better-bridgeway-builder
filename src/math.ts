import * as math from 'mathjs';

export function matricesIntersect(matrix1: math.Matrix, matrix2: math.Matrix): boolean {
  const array1: number[] = math.flatten(matrix1.toArray()) as number[];
  const array2: number[] = math.flatten(matrix2.toArray()) as number[];

  for (const value1 of array1) {
    if (array2.includes(value1)) {
      return true;
    }
  }
  return false;
}
