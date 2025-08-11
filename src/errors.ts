import { abbrevIK, ComKey, Item, LocKeyArray, PriKey } from "@fjell/core";
import { Coordinate } from "@fjell/registry";

export class LibError<
  S extends string,
  L1 extends string,
  L2 extends string,
  L3 extends string,
  L4 extends string,
  L5 extends string,
> extends Error {
  private operation: string;
  private coordinate: Coordinate<S, L1, L2, L3, L4, L5>;

  constructor(
    message: string,
    operation: string,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    options?: {
      cause?: Error
    }
  ) {
    super(`${message} - ${coordinate} - ${operation}`, options);

    this.operation = operation;
    this.coordinate = coordinate;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LibError);
    }
  }
}

export class NotFoundError<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> extends LibError<S, L1, L2, L3, L4, L5> {
  private key: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>;

  constructor(
    operation: string,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    options?: {
      cause?: Error
    }
  ) {
    // Use abbrevIK to properly format the key instead of relying on object stringification
    super(`Item not found for key - ${abbrevIK(key)}`, operation, coordinate, options);
    this.key = key;
  }
}

export class NotUpdatedError<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> extends LibError<S, L1, L2, L3, L4, L5> {
  private key: ComKey<S, L1, L2, L3, L4, L5> | PriKey<S>;

  constructor(
    operation: string,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5>,
    options?: {
      cause?: Error
    }
  ) {
    // Use abbrevIK to properly format the key instead of JSON.stringify
    super(`Item not updated for key ${abbrevIK(key)}`, operation, coordinate, options);
    this.key = key;
  }
}

export class ValidationError<
  S extends string,
  L1 extends string,
  L2 extends string,
  L3 extends string,
  L4 extends string,
  L5 extends string,
> extends LibError<S, L1, L2, L3, L4, L5> {

  constructor(
    message: string,
    operation: string,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    options?: {
      cause?: Error
    }
  ) {
    super(`Validation failed: ${message}`, operation, coordinate, options);
  }
}

export class CreateValidationError<
  S extends string,
  L1 extends string,
  L2 extends string,
  L3 extends string,
  L4 extends string,
  L5 extends string,
> extends ValidationError<S, L1, L2, L3, L4, L5> {

  constructor(
    parameters: {
      item: Partial<Item<S, L1, L2, L3, L4, L5>>,
      options?: {
        key?: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5> | undefined,
        locations?: LocKeyArray<L1, L2, L3, L4, L5> | [] | undefined,
      }
    },
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    options?: {
      cause?: Error
    }
  ) {
    super(
      `Create Validation Failed: ${JSON.stringify(parameters)}`,
      'create',
      coordinate,
      options
    );
  }
}

export class UpdateValidationError<
  S extends string,
  L1 extends string,
  L2 extends string,
  L3 extends string,
  L4 extends string,
  L5 extends string,
> extends ValidationError<S, L1, L2, L3, L4, L5> {

  constructor(
    parameters: {
      item: Partial<Item<S, L1, L2, L3, L4, L5>>,
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5> | undefined,
    },
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    options?: {
      cause?: Error
    }
  ) {
    super(
      `Update Validation Failed: ${JSON.stringify(parameters)}`,
      'update',
      coordinate,
      options
    );
  }
}

export class RemoveValidationError<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> extends ValidationError<S, L1, L2, L3, L4, L5> {

  constructor(
    parameters: {
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5> | undefined,
    },
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    options?: {
      cause?: Error
    }
  ) {
    const keyInfo = parameters.key ? `key: ${abbrevIK(parameters.key)}` : 'key: undefined';
    super(
      `Remove Validation Failed: ${keyInfo}`,
      'remove',
      coordinate,
      options
    );
  }
}

export class UpdateError<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> extends LibError<S, L1, L2, L3, L4, L5> {
  constructor(
    parameters: {
      item: Partial<Item<S, L1, L2, L3, L4, L5>>,
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5> | undefined,
    },
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    options?: {
      cause?: Error
    }
  ) {
    const keyInfo = parameters.key ? `key: ${abbrevIK(parameters.key)}` : 'key: undefined';
    super(
      `Update Failed: ${keyInfo}`,
      'update',
      coordinate,
      options
    );
  }
}

export class RemoveError<
  S extends string,
  L1 extends string = never,
  L2 extends string = never,
  L3 extends string = never,
  L4 extends string = never,
  L5 extends string = never,
> extends LibError<S, L1, L2, L3, L4, L5> {
  constructor(
    parameters: {
      key: PriKey<S> | ComKey<S, L1, L2, L3, L4, L5> | undefined,
    },
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    options?: {
      cause?: Error
    }
  ) {
    const keyInfo = parameters.key ? `key: ${abbrevIK(parameters.key)}` : 'key: undefined';
    super(
      `Remove Failed: ${keyInfo}`,
      'remove',
      coordinate,
      options
    );
  }
}

export class HookError<
  S extends string,
  L1 extends string,
  L2 extends string,
  L3 extends string,
  L4 extends string,
  L5 extends string,
> extends LibError<S, L1, L2, L3, L4, L5> {
  constructor(
    message: string,
    operation: string,
    coordinate: Coordinate<S, L1, L2, L3, L4, L5>,
    options?: {
      cause?: Error
    }
  ) {
    super(`${message}`, operation, coordinate, options);
  }
}
