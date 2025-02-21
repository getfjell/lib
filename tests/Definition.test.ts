import { createCoordinate } from "@/Coordinate";
import { createDefinition } from "@/Definition";
import { Options } from "@/Options";
import { Item } from "@fjell/core";

jest.mock('@fjell/logging', () => {
  return {
    get: jest.fn().mockReturnThis(),
    getLogger: jest.fn().mockReturnThis(),
    default: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    emergency: jest.fn(),
    alert: jest.fn(),
    critical: jest.fn(),
    notice: jest.fn(),
    time: jest.fn().mockReturnThis(),
    end: jest.fn(),
    log: jest.fn(),
  }
});

describe('Definition', () => {
  // Mock interfaces and types
  interface TestItem extends Item<'test', 'loc1', 'loc2'> {
    name: string;
  }

  describe('createDefinition', () => {
    const mockCoordinate = createCoordinate(['test'], ['scope1', 'scope2']);
    
    test('should create definition with coordinate and default options when no options provided', () => {
      const definition = createDefinition<TestItem, 'test', 'loc1', 'loc2'>(mockCoordinate);

      expect(definition.coordinate).toBe(mockCoordinate);
      expect(definition.options).toBeDefined();
      expect(definition.options?.hooks).toBeDefined();
      expect(definition.options?.hooks?.preCreate).toBeDefined();
      expect(definition.options?.hooks?.preUpdate).toBeDefined();
    });

    test('should create definition with provided options', () => {
      const mockOptions: Options<TestItem, 'test', 'loc1', 'loc2'> = {
        hooks: {
          preCreate: async (item) => item,
          preUpdate: async (key, item) => item
        }
      };

      const definition = createDefinition<TestItem, 'test', 'loc1', 'loc2'>(
        mockCoordinate,
        mockOptions
      );

      expect(definition.coordinate).toBe(mockCoordinate);
      expect(definition.options).toBeDefined();
      expect(definition.options?.hooks).toStrictEqual(mockOptions.hooks);
    });

    test('should merge provided options with default options', () => {
      const partialOptions: Partial<Options<TestItem, 'test', 'loc1', 'loc2'>> = {
        hooks: {
          preCreate: async (item) => ({ ...item, name: 'modified' })
        }
      };

      const definition = createDefinition<TestItem, 'test', 'loc1', 'loc2'>(
        mockCoordinate,
        partialOptions
      );

      expect(definition.coordinate).toBe(mockCoordinate);
      expect(definition.options?.hooks?.preCreate).toBeDefined();
      expect(definition.options?.hooks?.preUpdate).toBeDefined();
    });
  });
});
