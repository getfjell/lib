import { ComKey, PriKey } from "@fjell/core";

/**
 * Type utility to determine the correct key type based on whether the library
 * is for primary items (L1 = never) or composite items (L1 extends string).
 *
 * This enables compile-time type safety by enforcing:
 * - Primary libraries: must use PriKey<S>
 * - Composite libraries: must use ComKey<S, L1, L2, L3, L4, L5>
 */
export type StrictItemKey<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never
> = [L1] extends [never]
  ? PriKey<S>
  : ComKey<S, L1, L2, L3, L4, L5>;

/**
 * Type guard to check if a library is a composite (contained) library.
 * Returns true if L1 is not never.
 */
export type IsComposite<L1 extends string = never> = [L1] extends [never] ? false : true;

/**
 * Helper type to describe the expected key format for error messages
 */
export type ExpectedKeyFormat<
  S extends string,
  L1 extends string = never,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  L2 extends string = never,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  L3 extends string = never,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  L4 extends string = never,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  L5 extends string = never
> = [L1] extends [never]
  ? `PriKey<${S}> with format { kt: '${S}', pk: string | number }`
  : `ComKey<${S}> with format { kt: '${S}', pk: string | number, loc: [{ kt: '${L1}', lk: string | number }, ...] }`;

