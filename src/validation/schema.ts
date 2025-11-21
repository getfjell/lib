import { FieldError, ValidationError } from "@fjell/core";
import { SchemaValidator } from "../Options";

export async function validateSchema<T>(
  data: unknown,
  schema?: SchemaValidator<T>
): Promise<T> {
  if (!schema) {
    return data as T;
  }

  // Handle Zod-like schemas
  try {
    if (schema.parseAsync) {
      return await schema.parseAsync(data);
    }
    
    const result = schema.safeParse(data);
    if (result.success) {
      return result.data;
    } else {
      // It's an error, throw it to be caught below
      throw result.error;
    }
  } catch (error: any) {
    // Check if it's a ZodError (has issues property)
    if (error && Array.isArray(error.issues)) {
      const fieldErrors: FieldError[] = error.issues.map((issue: any) => ({
        path: issue.path,
        message: issue.message,
        code: issue.code
      }));
      
      // Explicitly constructing the error with all fields
      const validationError = new ValidationError(
        "Schema validation failed",
        // eslint-disable-next-line no-undefined
        undefined,
        // eslint-disable-next-line no-undefined
        undefined,
        // eslint-disable-next-line no-undefined
        undefined,
        fieldErrors
      );
      
      throw validationError;
    }
    
    // Re-throw if it's already a ValidationError or unknown error
    if (error instanceof ValidationError) {
      throw error;
    }
    
    // Fallback for non-Zod errors
    throw new ValidationError(`Validation failed: ${error.message || "Unknown error"}`);
  }
}
