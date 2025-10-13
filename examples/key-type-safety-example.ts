/**
 * Type Safety Example: get() Method Key Validation
 *
 * This example demonstrates the type safety improvements for the get() method
 * in both primary and composite item libraries.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { ComKey, PriKey } from '@fjell/core';
import * as Library from '@fjell/lib';

// ============================================================================
// SCENARIO 1: Primary Item Library (Correct Usage)
// ============================================================================

interface Document {
  kt: 'documents';
  pk: string;
  title: string;
  content: string;
}

async function getPrimaryItemCorrect(
  documentLib: Library.Primary.Library<Document, 'documents'>
) {
  // ✅ CORRECT: Using PriKey for a primary library
  const document = await documentLib.operations.get({
    kt: 'documents',
    pk: 'doc-123'
  });
  
  console.log('Document:', document.title);
}

async function getPrimaryItemIncorrect(
  documentLib: Library.Primary.Library<Document, 'documents'>
) {
  // ❌ COMPILE ERROR: Type error - cannot pass ComKey to primary library
  // TypeScript will show:
  // "Argument of type 'ComKey<"documents", "sections">' is not assignable to parameter of type 'PriKey<"documents">'"
  
  /*
  const document = await documentLib.operations.get({
    kt: 'documents',
    pk: 'doc-123',
    loc: [{ kt: 'sections', lk: 'section-1' }]
  });
  */
  
  // ❌ RUNTIME ERROR: If somehow TypeScript doesn't catch it
  // Error message will be:
  //
  // Invalid key type for get operation.
  // Expected: PriKey with format: { kt: 'documents', pk: string|number }
  // Received: ComKey: documents:doc-123:sections:section-1
  //
  // This is a primary item library. You should provide just the primary key.
  //
  // Example correct usage:
  //   library.operations.get({ kt: 'documents', pk: 'item-id' })
}

// ============================================================================
// SCENARIO 2: Composite Item Library (Correct Usage)
// ============================================================================

interface Annotation {
  kt: 'annotations';
  pk: string;
  loc: [{ kt: 'documents'; lk: string }];
  content: string;
  author: string;
}

async function getCompositeItemCorrect(
  annotationLib: Library.Contained.Library<Annotation, 'annotations', 'documents'>
) {
  // ✅ CORRECT: Using ComKey for a composite library
  const annotation = await annotationLib.operations.get({
    kt: 'annotations',
    pk: 'anno-456',
    loc: [{ kt: 'documents', lk: 'doc-123' }]
  });
  
  console.log('Annotation:', annotation.content);
}

async function getCompositeItemIncorrect(
  annotationLib: Library.Contained.Library<Annotation, 'annotations', 'documents'>
) {
  // ❌ COMPILE ERROR: Type error - cannot pass PriKey to composite library
  // TypeScript will show:
  // "Argument of type 'PriKey<"annotations">' is not assignable to parameter of type 'ComKey<"annotations", "documents">'"
  
  /*
  const annotation = await annotationLib.operations.get({
    kt: 'annotations',
    pk: 'anno-456'
  });
  */
  
  // ❌ RUNTIME ERROR: If somehow TypeScript doesn't catch it
  // Error message will be:
  //
  // Invalid key type for get operation.
  // Expected: ComKey with format: { kt: 'annotations', pk: string|number, loc: [{ kt: 'documents', lk: string|number }] }
  // Received: PriKey: annotations:anno-456
  //
  // This is a composite item library. You must provide both the parent key and location keys.
  //
  // Example correct usage:
  //   library.operations.get({ kt: 'annotations', pk: 'parent-id', loc: [{ kt: 'documents', lk: 'child-id' }] })
}

// ============================================================================
// SCENARIO 3: Invalid Key Formats (Always Runtime Errors)
// ============================================================================

async function getWithInvalidFormats(
  documentLib: Library.Primary.Library<Document, 'documents'>
) {
  // ❌ RUNTIME ERROR: Passing a string instead of a key object
  try {
    // @ts-ignore - bypassing TypeScript to demonstrate runtime error
    await documentLib.operations.get('doc-123');
  } catch (error) {
    console.error('Error:', (error as Error).message);
    // Error message:
    //
    // Invalid key type for get operation.
    // Expected: PriKey with format: { kt: 'documents', pk: string|number }
    // Received: a string value: "doc-123"
    //
    // This is a primary item library. You should provide just the primary key.
    //
    // Example correct usage:
    //   library.operations.get({ kt: 'documents', pk: 'item-id' })
  }
  
  // ❌ RUNTIME ERROR: Passing incomplete key object
  try {
    // @ts-ignore - bypassing TypeScript to demonstrate runtime error
    await documentLib.operations.get({ kt: 'documents' });
  } catch (error) {
    console.error('Error:', (error as Error).message);
    // Error message will indicate that the key is invalid
  }
  
  // ❌ RUNTIME ERROR: Passing null or undefined
  try {
    // @ts-ignore - bypassing TypeScript to demonstrate runtime error
    await documentLib.operations.get(null);
  } catch (error) {
    console.error('Error:', (error as Error).message);
  }
}

// ============================================================================
// SCENARIO 4: Multi-Level Composite Items
// ============================================================================

interface Comment {
  kt: 'comments';
  pk: string;
  loc: [
    { kt: 'documents'; lk: string },
    { kt: 'annotations'; lk: string }
  ];
  text: string;
}

async function getMultiLevelCompositeItem(
  commentLib: Library.Contained.Library<Comment, 'comments', 'documents', 'annotations'>
) {
  // ✅ CORRECT: Using ComKey with multiple location levels
  const comment = await commentLib.operations.get({
    kt: 'comments',
    pk: 'comment-789',
    loc: [
      { kt: 'documents', lk: 'doc-123' },
      { kt: 'annotations', lk: 'anno-456' }
    ]
  });
  
  console.log('Comment:', comment.text);
}

// ============================================================================
// COMPARISON: Before vs After
// ============================================================================

/**
 * BEFORE (Without Type Safety Improvements):
 *
 * // This code would compile but fail at runtime with:
 * // "Item not found for key - annotations:xxx"
 * //
 * // This error message was misleading because:
 * // 1. It suggested the item didn't exist
 * // 2. It didn't indicate the key type was wrong
 * // 3. Required hours of debugging to discover the root cause
 *
 * const annotation = await annotationLib.operations.get({
 *   kt: 'annotations',
 *   pk: 'xxx'  // Missing the loc array!
 * });
 */

/**
 * AFTER (With Type Safety Improvements):
 *
 * // OPTION 1: Compile-time error
 * // TypeScript immediately shows:
 * // "Argument of type 'PriKey<"annotations">' is not assignable to
 * //  parameter of type 'ComKey<"annotations", "documents">'"
 *
 * // OPTION 2: Runtime error with clear message
 * // If TypeScript is bypassed, runtime error shows:
 * //
 * // Invalid key type for get operation.
 * // Expected: ComKey with format: { kt: 'annotations', pk: string|number, loc: [{ kt: 'documents', lk: string|number }] }
 * // Received: PriKey: annotations:xxx
 * //
 * // This is a composite item library. You must provide both the parent key and location keys.
 * //
 * // Example correct usage:
 * //   library.operations.get({ kt: 'annotations', pk: 'parent-id', loc: [{ kt: 'documents', lk: 'child-id' }] })
 *
 * // BENEFIT: Error is caught immediately with clear guidance on how to fix it!
 */

// ============================================================================
// TYPE SAFETY BENEFITS
// ============================================================================

/**
 * 1. COMPILE-TIME SAFETY
 *    - TypeScript enforces correct key types
 *    - IDEs provide proper auto-completion
 *    - Errors caught before code runs
 *
 * 2. RUNTIME VALIDATION
 *    - Validates key structure even if TypeScript is bypassed
 *    - Catches errors immediately with clear messages
 *    - Provides examples of correct usage
 *
 * 3. BETTER ERROR MESSAGES
 *    - Clear explanation of what went wrong
 *    - Shows expected vs received key format
 *    - Indicates whether library is primary or composite
 *    - Provides example of correct usage
 *
 * 4. DEVELOPER EXPERIENCE
 *    - Saves hours of debugging time
 *    - Makes the library easier to learn and use
 *    - Prevents subtle bugs from incorrect key usage
 *    - Improves code maintainability
 */

export {
  getPrimaryItemCorrect,
  getCompositeItemCorrect,
  getMultiLevelCompositeItem
};

