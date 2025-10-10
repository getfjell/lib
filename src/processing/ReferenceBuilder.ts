import type { Registry } from "../Registry";
import { OperationContext } from "./OperationContext";

/**
 * Base definition for a reference relationship.
 * This is the minimal common structure shared by all implementations.
 *
 * @deprecated Use implementation-specific reference definitions instead:
 * - `SequelizeReferenceDefinition` from `@fjell/lib-sequelize` for SQL databases
 * - `FirestoreReferenceDefinition` from `@fjell/lib-firestore` for Firestore
 *
 * This interface remains for backwards compatibility only.
 */
export interface ReferenceDefinition {
  /** Key type array of the referenced item - optional as different implementations may use different identification strategies */
  kta?: string[];
  /** Allow implementations to add their own properties */
  [key: string]: any;
}

/**
 * @deprecated This function is deprecated and no longer functional.
 * Use implementation-specific reference builders instead:
 * - `buildSequelizeReference` from `@fjell/lib-sequelize` for SQL databases
 * - `buildFirestoreReference` from `@fjell/lib-firestore` for Firestore
 *
 * This function will throw an error if called.
 *
 * @param item - The item to populate with reference data
 * @param referenceDefinition - Definition of what to reference
 * @param registry - Registry to look up library instances
 * @param context - Optional operation context for caching and cycle detection
 * @throws Always throws an error directing users to implementation-specific builders
 */
export const buildReference = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  item: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  referenceDefinition: ReferenceDefinition,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registry: Registry,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  context?: OperationContext
): Promise<any> => {
  throw new Error(
    'buildReference() from @fjell/lib is deprecated and no longer functional. ' +
    'Use implementation-specific builders instead:\n' +
    '- buildSequelizeReference from @fjell/lib-sequelize for SQL databases\n' +
    '- buildFirestoreReference from @fjell/lib-firestore for Firestore'
  );
};
