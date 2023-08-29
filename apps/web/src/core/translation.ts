import { pipe } from 'fp-ts/lib/function';
import * as Eq from 'fp-ts/lib/Eq';
import * as Ord from 'fp-ts/lib/Ord';
import * as Monoid from 'fp-ts/lib/Monoid';
import * as ReadonlyArray from 'fp-ts/lib/ReadonlyArray';
import * as ReadonlyNonEmptyArray from 'fp-ts/lib/ReadonlyNonEmptyArray';
import * as Record from 'fp-ts/lib/Record';
import * as string from 'fp-ts/lib/string';
import * as number from 'fp-ts/lib/number';
import * as array from 'src/lib/array';
import type { Tag, Translation } from './types';

export const toTags = (
  translations: ReadonlyArray<Translation>
): ReadonlyArray<Tag> =>
  pipe(
    translations,
    ReadonlyArray.chain((translations) => translations.tags),
    ReadonlyArray.uniq(
      pipe(
        string.Eq,
        Eq.contramap((t) => t.id)
      )
    )
  );

export const groupByTags = (translations: ReadonlyArray<Translation>) =>
  pipe(
    ReadonlyArray.Do,
    ReadonlyArray.apS('translation', translations),
    ReadonlyArray.bind('tag', ({ translation }) => translation.tags),
    ReadonlyNonEmptyArray.groupBy(({ tag }) => tag.id),
    Record.toEntries,
    ReadonlyArray.map(([tagId, group]): [Tag, ReadonlyArray<Translation>] => [
      { id: tagId },
      group.map(({ translation }) => translation),
    ]),
    ReadonlyArray.sort(
      pipe(
        [
          pipe(
            number.Ord,
            Ord.contramap(
              ([_, group]: [Tag, ReadonlyArray<Translation>]) => group.length
            ),
            Ord.reverse
          ),
          pipe(
            string.Ord,
            Ord.contramap(
              ([tag, _]: [Tag, ReadonlyArray<Translation>]) => tag.id
            )
          ),
        ],
        Monoid.concatAll(Ord.getMonoid())
      )
    )
  );

export const groupByPublishYearDesc = (
  translations: ReadonlyArray<Translation>
) =>
  pipe(
    translations,
    ReadonlyArray.sort(
      pipe(
        number.Ord,
        Ord.contramap((translation: Translation) =>
          translation.publishedAt.getTime()
        )
      )
    ),
    array.groupByList(
      pipe(
        number.Eq,
        Eq.contramap((translation: Translation) =>
          translation.publishedAt.getFullYear()
        )
      )
    ),
    ReadonlyArray.map((group): [number, typeof group] => [
      ReadonlyNonEmptyArray.head(group).publishedAt.getFullYear(),
      group,
    ])
  );
