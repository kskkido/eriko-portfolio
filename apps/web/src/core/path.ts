import { constant, pipe } from 'fp-ts/lib/function';
import * as ReadonlyArray from 'fp-ts/lib/ReadonlyArray';
import * as Either from 'fp-ts/lib/Either';
import * as array from 'src/lib/array';
import * as types from './types';

export const exactMatch = (pa: string, pb: string) => {
  const tokensA = pa.split('/').filter((i) => i.length > 0);
  const tokensB = pb.split('/').filter((i) => i.length > 0);
  return (
    tokensA.length === tokensB.length &&
    pipe(
      tokensA,
      ReadonlyArray.zip(tokensB),
      ReadonlyArray.every(([tokenA, tokenB]) => tokenA === tokenB)
    )
  );
};

export const startsWith = (pa: string, pb: string) => {
  const tokensA = pa.split('/');
  const tokensB = pb.split('/');
  return (
    tokensA.length >= tokensB.length &&
    pipe(
      tokensA,
      ReadonlyArray.zip(tokensB),
      ReadonlyArray.every(([tokenA, tokenB]) => tokenA === tokenB)
    )
  );
};

export const fromPathByLocale =
  (path: string) =>
  (locale: types.Locale): string => {
    return pipe(
      [locale, ...path.split('/').filter((c) => c.length > 0)],
      array.prependAll('/')
    ).join('');
  };

export const fromLocalizedPathByLocale =
  (path: string) =>
  (locale: types.Locale): string => {
    return pipe(
      path.split('/'),
      ReadonlyArray.map((token) =>
        pipe(
          types.Locale.decode(token),
          Either.fold(() => token, constant(locale))
        )
      )
    ).join('/');
  };
