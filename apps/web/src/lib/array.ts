import { pipe } from 'fp-ts/lib/function';
import type * as Eq from 'fp-ts/lib/Eq';
import * as Option from 'fp-ts/lib/Option';
import * as ReadonlyArray from 'fp-ts/lib/ReadonlyArray';
import * as NonEmptyArray from 'fp-ts/lib/NonEmptyArray';

export const prependAll =
  <A>(delimitter: A) =>
  (xs: ReadonlyArray<A>): ReadonlyArray<A> => {
    return pipe(
      xs,
      ReadonlyArray.chain((x) => [delimitter, x])
    );
  };

export const lookaround = <A>(
  xs: ReadonlyArray<A>
): ReadonlyArray<[Option.Option<A>, A, Option.Option<A>]> => {
  const axs = pipe(
    pipe(
      xs,
      ReadonlyArray.matchLeft(
        () => [],
        (_, tail) => tail
      ),
      ReadonlyArray.map(Option.of),
      ReadonlyArray.append(Option.none as Option.Option<A>)
    ),
    ReadonlyArray.zip([Option.none, ...xs.map(Option.of)])
  );
  return pipe(
    ReadonlyArray.zipWith(xs, axs, (curr, [prev, next]) => [prev, curr, next])
  );
};

export const before =
  <A>(eq: Eq.Eq<A>) =>
  (target: A) =>
  (xs: ReadonlyArray<A>): Option.Option<A> => {
    return pipe(
      lookaround(xs),
      ReadonlyArray.findFirstMap(([prev, x]) =>
        pipe(
          Option.guard(eq.equals(target, x)),
          Option.chain(() => prev)
        )
      )
    );
  };

export const after =
  <A>(eq: Eq.Eq<A>) =>
  (target: A) =>
  (xs: ReadonlyArray<A>): Option.Option<A> => {
    return pipe(
      lookaround(xs),
      ReadonlyArray.findFirstMap(([_, x, next]) =>
        pipe(
          Option.guard(eq.equals(target, x)),
          Option.chain(() => next)
        )
      )
    );
  };

export const groupByList =
  <A>(eq: Eq.Eq<A>) =>
  (xs: ReadonlyArray<A>): ReadonlyArray<NonEmptyArray.NonEmptyArray<A>> => {
    let out: ReadonlyArray<NonEmptyArray.NonEmptyArray<A>> = [];
    for (const x of xs) {
      out = pipe(
        out,
        ReadonlyArray.matchRight(
          () => Option.none,
          (init, prev) =>
            pipe(
              Option.guard(eq.equals(NonEmptyArray.last(prev), x)),
              Option.map(() => [...init, NonEmptyArray.concat(prev)([x])])
            )
        ),
        Option.fold(
          () => [...out, NonEmptyArray.of(x)],
          (i) => i
        )
      );
    }
    return out;
  };
