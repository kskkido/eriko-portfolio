import type { Validation, ValidationError } from 'io-ts';
import { pipe } from 'fp-ts/lib/function';
import type * as IO from 'fp-ts/lib/IO';
import * as Either from 'fp-ts/lib/Either';
import * as ReadonlyArray from 'fp-ts/lib/ReadonlyArray';
import * as ReadonlyNonEmptyArray from 'fp-ts/lib/ReadonlyNonEmptyArray';
import * as Record from 'fp-ts/Record';

export const toIO = <A>(vx: Validation<A>): IO.IO<A> =>
  pipe(
    vx,
    Either.fold(
      (errors) => () => {
        throw validationErrorToError(errors);
      },
      (value) => () => value
    )
  );

// TODO: Support nested properties
export const validationErrorToSchema = (
  errors: ReadonlyArray<ValidationError>
): Record<string, ReadonlyArray<string>> => {
  return pipe(
    errors,
    ReadonlyArray.chain((error) => error.context),
    ReadonlyNonEmptyArray.groupBy((entry) => entry.key),
    Record.map(ReadonlyNonEmptyArray.map((entry) => entry.type.name))
  );
};

export const validationErrorToPaths = (
  errors: ReadonlyArray<ValidationError>
): ReadonlyArray<string> => {
  return pipe(
    errors,
    ReadonlyArray.map((error) =>
      pipe(
        error.context,
        ReadonlyArray.filter((c) => c.key.length > 0),
        ReadonlyArray.map((c) => `${c.key}: ${c.type.name}`)
      ).join('/')
    )
  );
};

export const validationErrorToError = (
  errors: ReadonlyArray<ValidationError>
): Error => {
  return new Error(
    `Invalid values at: ${validationErrorToPaths(errors).join(',')}`
  );
};
