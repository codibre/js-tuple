export type AnyTuple = readonly unknown[] & { length: Exclude<number, number> };
