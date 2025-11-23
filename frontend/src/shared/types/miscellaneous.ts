export type Unpack<T> = T extends (infer U)[] ? Unpack<U> : T;

export type ToNumber<T> = T extends `${infer N extends number}` ? N : never;

export type KeyValueTuple<T extends object> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];

export type Primitive =
  | number
  | string
  | boolean
  | bigint
  | symbol
  | null
  | undefined;
