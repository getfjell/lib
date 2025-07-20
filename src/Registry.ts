import LibLogger from '@/logger';
import {
  Registry as BaseRegistry,
  createRegistry as createBaseRegistry,
  RegistryFactory,
  RegistryHub
} from '@fjell/registry';

const logger = LibLogger.get("LibRegistry");

/**
 * Extended Registry interface for lib-specific functionality
 */
export interface Registry extends BaseRegistry {
  type: 'lib';
}

/**
 * Factory function for creating lib registries
 */
export const createRegistryFactory = (): RegistryFactory => {
  return (type: string, registryHub?: RegistryHub): BaseRegistry => {
    if (type !== 'lib') {
      throw new Error(`LibRegistryFactory can only create 'lib' type registries, got: ${type}`);
    }

    logger.debug("Creating lib registry", { type, registryHub });

    const baseRegistry = createBaseRegistry(type, registryHub);

    // Cast to Registry for type safety
    return baseRegistry as Registry;
  };
};

/**
 * Creates a new lib registry instance
 */
export const createRegistry = (registryHub?: RegistryHub): Registry => {
  const baseRegistry = createBaseRegistry('lib', registryHub);

  return {
    ...baseRegistry,
  } as Registry;
};
