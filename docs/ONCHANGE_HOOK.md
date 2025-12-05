# onChange Hook Documentation

## Overview

The `onChange` hook is a new feature in Fjell that simplifies detecting and reacting to field changes during update operations. It eliminates the need for manual context tracking and provides a clean, type-safe way to compare the state of an item before and after an update.

## Motivation

### The Problem

Previously, detecting changes to specific fields during an update operation required a cumbersome pattern:

1. In `preUpdate`: Fetch the current item, extract the previous value, store it in a context Map
2. In `postUpdate`: Retrieve the previous value, compare with new value, perform actions, clean up context

This pattern was:
- **Error-prone**: Context leaks if cleanup fails
- **Verbose**: Required Map management and key generation
- **Hard to maintain**: State scattered across multiple hooks

### The Solution

The `onChange` hook provides:
- **Automatic fetching** of the original item before update
- **Direct comparison** between original and updated items
- **No manual state management** required
- **Type-safe** parameters with full item types

## API

### Hook Signature

```typescript
onChange?: (originalItem: V, updatedItem: V) => Promise<void> | void;
```

### Parameters

- `originalItem`: The complete item as it existed before the update operation
- `updatedItem`: The complete item as it exists after the update operation

### Return Value

The hook can return either:
- `Promise<void>`: For asynchronous operations
- `void`: For synchronous operations

## Usage

### Basic Example

```typescript
import { createOptions } from '@fjell/lib';

interface Order {
  id: string;
  orderStateId: string;
  orderState?: { name: string };
  key: any;
}

const orderOptions = createOptions<Order, 'order'>({
  hooks: {
    onChange: async (originalOrder, updatedOrder) => {
      // Simple comparison - no context needed!
      if (originalOrder.orderStateId !== updatedOrder.orderStateId) {
        console.log('Order state changed!');
        await handleOrderStateChange(updatedOrder);
      }
    }
  }
});
```

### Multiple Field Detection

```typescript
const productOptions = createOptions<Product, 'product'>({
  hooks: {
    onChange: async (originalProduct, updatedProduct) => {
      // Track multiple changes
      if (originalProduct.price !== updatedProduct.price) {
        await handlePriceChange(updatedProduct);
      }
      
      if (originalProduct.stockLevel !== updatedProduct.stockLevel) {
        await handleStockChange(updatedProduct);
      }
      
      if (originalProduct.isActive !== updatedProduct.isActive) {
        await handleActiveStatusChange(updatedProduct);
      }
    }
  }
});
```

### Combining with Other Hooks

The `onChange` hook works seamlessly with other hooks:

```typescript
const userOptions = createOptions<User, 'user'>({
  hooks: {
    // Runs before update
    preUpdate: async (key, item) => {
      return {
        ...item,
        lastModifiedAt: new Date()
      };
    },
    
    // Runs after update, can modify result
    postUpdate: async (user) => {
      console.log('Update completed');
      return user;
    },
    
    // Runs after postUpdate, detects changes
    onChange: async (originalUser, updatedUser) => {
      if (originalUser.email !== updatedUser.email) {
        await sendEmailChangeNotification(updatedUser);
      }
    }
  }
});
```

## Execution Order

The hooks execute in the following order:

1. **Fetch original item** (if `onChange` is present)
2. **preUpdate** hook
3. **Validation**
4. **Update operation**
5. **postUpdate** hook
6. **onChange** hook
7. Return updated item

## Error Handling

### onChange Hook Errors

If the `onChange` hook throws an error, it is wrapped in a `HookError`:

```typescript
try {
  await library.operations.update(key, updates);
} catch (error) {
  if (error.cause instanceof HookError) {
    console.error('onChange hook failed:', error.cause);
  }
}
```

### Original Item Fetch Errors

If fetching the original item fails:
- A warning is logged
- The update continues normally
- The `onChange` hook is **not called**

This ensures that failures to fetch the original item don't block updates.

## Performance Considerations

### Automatic Optimization

The original item is only fetched when:
- An `onChange` hook is defined in the options
- The update operation is about to execute

If no `onChange` hook is present, no additional fetch occurs.

### Best Practices

1. **Keep onChange logic fast**: The hook runs synchronously in the update flow
2. **Use async operations wisely**: Long-running tasks should be queued or backgrounded
3. **Avoid heavy computations**: Defer expensive operations when possible

## Comparison: Before vs After

### Before: Manual Context Tracking

```typescript
// Context Map for tracking previous values
const orderStateUpdateContext = new Map<string, string | null>();

const orderOptions = createOptions<Order, 'order'>({
  hooks: {
    preUpdate: async (key, itemToUpdate) => {
      if ('orderStateId' in itemToUpdate) {
        const contextKey = getOrderStateContextKey(key);
        
        // Fetch current order
        const orderLib = registry.get(['order']);
        const currentOrder = await orderLib.operations.get(key);
        const previousOrderStateId = currentOrder?.orderStateId || null;
        
        // Store in context
        orderStateUpdateContext.set(contextKey, previousOrderStateId);
      }
      return itemToUpdate;
    },
    
    postUpdate: async (item) => {
      const contextKey = getOrderStateContextKey(item.key);
      const previousOrderStateId = orderStateUpdateContext.get(contextKey);
      
      if (previousOrderStateId !== undefined) {
        // Clean up context
        orderStateUpdateContext.delete(contextKey);
        
        // Compare and act
        if (item.orderStateId && item.orderStateId !== previousOrderStateId) {
          await handleOrderStateChange(item);
        }
      }
      return item;
    }
  }
});
```

### After: Using onChange Hook

```typescript
const orderOptions = createOptions<Order, 'order'>({
  hooks: {
    onChange: async (originalOrder, updatedOrder) => {
      // Simple comparison - no context needed!
      if (originalOrder.orderStateId !== updatedOrder.orderStateId) {
        await handleOrderStateChange(updatedOrder);
      }
    }
  }
});
```

**Benefits:**
- ✅ 80% less code
- ✅ No context management
- ✅ No cleanup required
- ✅ No memory leaks
- ✅ Easier to understand

## Advanced Patterns

### Conditional Logic Based on Multiple Fields

```typescript
onChange: async (original, updated) => {
  // Only notify if both status and assignee changed
  if (original.status !== updated.status && 
      original.assigneeId !== updated.assigneeId) {
    await notifyStatusAndAssigneeChange(updated);
  }
}
```

### Change History Tracking

```typescript
onChange: async (original, updated) => {
  const changes: ChangeRecord[] = [];
  
  // Track all changes
  Object.keys(updated).forEach(key => {
    if (original[key] !== updated[key]) {
      changes.push({
        field: key,
        oldValue: original[key],
        newValue: updated[key],
        timestamp: new Date()
      });
    }
  });
  
  if (changes.length > 0) {
    await saveChangeHistory(updated.id, changes);
  }
}
```

### Cascading Updates

```typescript
onChange: async (original, updated) => {
  // If parent category changed, update all related items
  if (original.categoryId !== updated.categoryId) {
    const relatedItems = await findRelatedItems(updated.id);
    
    for (const item of relatedItems) {
      await updateItemCategory(item.id, updated.categoryId);
    }
  }
}
```

## Testing

### Testing onChange Hooks

```typescript
import { describe, test, expect, vi } from 'vitest';

describe('Order onChange hook', () => {
  test('should detect orderStateId changes', async () => {
    const handleChange = vi.fn();
    
    const options = createOptions<Order, 'order'>({
      hooks: {
        onChange: async (original, updated) => {
          if (original.orderStateId !== updated.orderStateId) {
            handleChange(original.orderStateId, updated.orderStateId);
          }
        }
      }
    });
    
    // Mock operations
    const mockOps = {
      get: vi.fn().mockResolvedValue({
        id: '1',
        orderStateId: 'pending',
        key: { kt: 'order', pk: '1' }
      }),
      update: vi.fn().mockResolvedValue({
        id: '1',
        orderStateId: 'in-progress',
        key: { kt: 'order', pk: '1' }
      })
    };
    
    const updateOp = wrapUpdateOperation(
      mockOps,
      options,
      createCoordinate(['order']),
      registry
    );
    
    await updateOp({ kt: 'order', pk: '1' }, { orderStateId: 'in-progress' });
    
    expect(handleChange).toHaveBeenCalledWith('pending', 'in-progress');
  });
});
```

## Migration Guide

### Migrating from Context-Based Tracking

1. **Identify context Maps**: Look for Maps used to track previous values
2. **Find preUpdate/postUpdate pairs**: Locate hooks that work together
3. **Replace with onChange**: Move comparison logic to onChange hook
4. **Remove context management**: Delete Map declarations and cleanup code
5. **Test thoroughly**: Ensure behavior is preserved

### Example Migration

**Before:**
```typescript
const statusContext = new Map();

hooks: {
  preUpdate: async (key, item) => {
    if ('statusId' in item) {
      const current = await lib.operations.get(key);
      statusContext.set(key.pk, current.statusId);
    }
    return item;
  },
  postUpdate: async (item) => {
    const prev = statusContext.get(item.key.pk);
    if (prev !== undefined) {
      statusContext.delete(item.key.pk);
      if (item.statusId !== prev) {
        await handleStatusChange(item);
      }
    }
    return item;
  }
}
```

**After:**
```typescript
hooks: {
  onChange: async (original, updated) => {
    if (original.statusId !== updated.statusId) {
      await handleStatusChange(updated);
    }
  }
}
```

## Limitations

1. **Original item must be fetchable**: If `get` operation fails, onChange won't be called
2. **Runs after update**: Cannot prevent the update based on change detection
3. **No access to partial update**: Only sees the full items, not the update delta
4. **Single hook**: Cannot chain multiple onChange hooks (use a single hook with multiple checks)

## FAQ

### Q: When should I use onChange vs postUpdate?

**Use `onChange` when:**
- You need to compare before/after values
- You want to detect specific field changes
- You need the original item state

**Use `postUpdate` when:**
- You need to modify the returned item
- You want to run logic after every update
- You don't need the original item

### Q: Can I use both onChange and postUpdate?

Yes! They work together:
- `postUpdate` runs first and can modify the result
- `onChange` runs second with the final updated item

### Q: What if I only want to track certain fields?

Just check those fields in your onChange hook:

```typescript
onChange: async (original, updated) => {
  // Only care about status changes
  if (original.status !== updated.status) {
    await handleStatusChange(updated);
  }
  // Ignore all other changes
}
```

### Q: Does onChange affect update performance?

Minimally. The original item is fetched before the update begins, so it adds one additional `get` operation per update when the hook is present. If no `onChange` hook is defined, there's zero performance impact.

### Q: Can onChange prevent an update?

No. The `onChange` hook runs after the update completes. If you need to prevent updates, use validation or the `preUpdate` hook.

## See Also

- [Hooks Documentation](./HOOKS.md)
- [Update Operation Documentation](./OPERATIONS.md#update)
- [Error Handling Guide](./ERROR_HANDLING.md)
- [Examples](../examples/onChange-hook-example.ts)

