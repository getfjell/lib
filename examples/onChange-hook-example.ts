/**
 * onChange Hook Example
 *
 * This example demonstrates the new onChange hook feature that simplifies
 * detecting field changes during update operations.
 *
 * The onChange hook:
 * - Receives both the original item (before update) and updated item (after update)
 * - Eliminates the need for manual context tracking
 * - Is called after the update completes successfully
 * - Can be used to trigger side effects based on specific field changes
 */

import { createOptions } from '../src/Options';

// Define our data model
interface Order {
  id: string;
  orderNumber: string;
  orderStateId: string;
  orderState?: {
    name: string;
  };
  key: any;
}

interface OrderForm {
  id: string;
  orderId: string;
  bootStatusId: string;
  bootStatus?: {
    name: string;
  };
  key: any;
}

// Example 1: Order State Change Detection
// ========================================
// Before onChange hook, this required manual context tracking with Maps.
// Now it's much simpler!

const orderOptions = createOptions<Order, 'order'>({
  hooks: {
    onChange: async (originalOrder: Order, updatedOrder: Order) => {
      // Simple comparison - no context Maps needed!
      if (originalOrder.orderStateId !== updatedOrder.orderStateId) {
        const orderStateName = updatedOrder.orderState?.name;
        
        console.log(`📊 Order state changed!`);
        console.log(`   From: ${originalOrder.orderStateId}`);
        console.log(`   To: ${updatedOrder.orderStateId}`);
        
        // Handle specific state transitions
        if (orderStateName === 'In-progress') {
          console.log(`✅ Order ${updatedOrder.orderNumber} is now in progress`);
          // Trigger notifications, update related records, etc.
          await handleOrderStateInProgressChange(updatedOrder);
        } else if (orderStateName === 'Completed') {
          console.log(`✅ Order ${updatedOrder.orderNumber} is completed`);
          await handleOrderCompletion(updatedOrder);
        }
      }
    }
  }
});

// Example 2: OrderForm Boot Status Change Detection
// =================================================

const orderFormOptions = createOptions<OrderForm, 'orderForm'>({
  hooks: {
    onChange: async (originalForm: OrderForm, updatedForm: OrderForm) => {
      // Direct comparison - much cleaner than before!
      if (originalForm.bootStatusId !== updatedForm.bootStatusId) {
        console.log(`👢 Boot status changed!`);
        console.log(`   From: ${originalForm.bootStatusId}`);
        console.log(`   To: ${updatedForm.bootStatusId}`);
        
        await handleBootStatusChange(
          updatedForm,
          originalForm.bootStatusId,
          updatedForm.bootStatusId
        );
      }
    }
  }
});

// Example 3: Multiple Field Change Detection
// ==========================================

interface Product {
  id: string;
  name: string;
  price: number;
  stockLevel: number;
  isActive: boolean;
  key: any;
}

const productOptions = createOptions<Product, 'product'>({
  hooks: {
    onChange: async (originalProduct: Product, updatedProduct: Product) => {
      const changes: string[] = [];
      
      // Track multiple field changes
      if (originalProduct.price !== updatedProduct.price) {
        changes.push(`Price: $${originalProduct.price} → $${updatedProduct.price}`);
        await handlePriceChange(updatedProduct);
      }
      
      if (originalProduct.stockLevel !== updatedProduct.stockLevel) {
        changes.push(`Stock: ${originalProduct.stockLevel} → ${updatedProduct.stockLevel}`);
        
        // Alert if stock is low
        if (updatedProduct.stockLevel < 10) {
          await sendLowStockAlert(updatedProduct);
        }
      }
      
      if (originalProduct.isActive !== updatedProduct.isActive) {
        changes.push(`Active: ${originalProduct.isActive} → ${updatedProduct.isActive}`);
        
        if (!updatedProduct.isActive) {
          await handleProductDeactivation(updatedProduct);
        }
      }
      
      if (changes.length > 0) {
        console.log(`📝 Product ${updatedProduct.name} updated:`);
        changes.forEach(change => console.log(`   - ${change}`));
      }
    }
  }
});

// Example 4: Combining onChange with Other Hooks
// ==============================================

interface User {
  id: string;
  email: string;
  status: string;
  lastModifiedAt?: Date;
  key: any;
}

const userOptions = createOptions<User, 'user'>({
  hooks: {
    // preUpdate: Modify data before update
    preUpdate: async (key, item) => {
      return {
        ...item,
        lastModifiedAt: new Date()
      };
    },
    
    // postUpdate: Modify the result
    postUpdate: async (user) => {
      console.log(`✅ User ${user.email} updated successfully`);
      return user;
    },
    
    // onChange: Detect and react to specific changes
    onChange: async (originalUser, updatedUser) => {
      if (originalUser.email !== updatedUser.email) {
        console.log(`📧 Email changed: ${originalUser.email} → ${updatedUser.email}`);
        await sendEmailChangeNotification(updatedUser);
      }
      
      if (originalUser.status !== updatedUser.status) {
        console.log(`📊 Status changed: ${originalUser.status} → ${updatedUser.status}`);
        
        if (updatedUser.status === 'suspended') {
          await handleUserSuspension(updatedUser);
        }
      }
    }
  }
});

// Helper functions (mock implementations)
// =======================================

/* eslint-disable @typescript-eslint/no-unused-vars */

async function handleOrderStateInProgressChange(_order: Order) {
  console.log(`   → Sending notification to customer`);
  console.log(`   → Updating inventory`);
  console.log(`   → Creating shipping label`);
}

async function handleOrderCompletion(_order: Order) {
  console.log(`   → Sending completion email`);
  console.log(`   → Updating analytics`);
  console.log(`   → Triggering review request`);
}

async function handleBootStatusChange(
  _form: OrderForm,
  _oldStatusId: string,
  _newStatusId: string
) {
  console.log(`   → Updating related order records`);
  console.log(`   → Logging status change history`);
}

async function handlePriceChange(_product: Product) {
  console.log(`   → Updating price history`);
  console.log(`   → Notifying subscribers`);
}

async function sendLowStockAlert(product: Product) {
  console.log(`   ⚠️  Low stock alert for ${product.name}`);
}

async function handleProductDeactivation(_product: Product) {
  console.log(`   → Removing from active listings`);
  console.log(`   → Notifying affected customers`);
}

async function sendEmailChangeNotification(user: User) {
  console.log(`   → Sending verification email to ${user.email}`);
}

async function handleUserSuspension(_user: User) {
  console.log(`   → Revoking active sessions`);
  console.log(`   → Sending suspension notification`);
}

/* eslint-enable @typescript-eslint/no-unused-vars */

// Benefits of onChange Hook
// =========================
console.log(`
✨ Benefits of the onChange Hook:

1. ✅ Simplified Code
   - No manual context Maps needed
   - No cleanup required
   - Clear before/after comparison

2. ✅ More Reliable
   - No risk of context leaks
   - Automatic cleanup
   - Type-safe parameters

3. ✅ Better Performance
   - Only fetches original item when onChange is present
   - No unnecessary operations

4. ✅ Easier to Reason About
   - Single function with clear inputs
   - No state management across hooks
   - Direct field comparison

5. ✅ Composable
   - Works with preUpdate and postUpdate
   - Integrates with validation
   - Can be combined with other hooks
`);

export {
  orderOptions,
  orderFormOptions,
  productOptions,
  userOptions
};

