import contentful from 'contentful';
import { pipe } from 'fp-ts/lib/function';
import * as IO from 'fp-ts/lib/IO';
import * as ReaderTask from 'fp-ts/lib/ReaderTask';
import * as ReadonlyArray from 'fp-ts/lib/ReadonlyArray';
import * as Ord from 'fp-ts/lib/Ord';
import * as _Date from 'fp-ts/lib/Date';
import * as Either from 'fp-ts/lib/Either';
import type * as contentfulExtension from 'src/lib/contentful';
import type { Router } from 'src/capabilities/router';
import type { Time } from 'src/capabilities/time';
import type * as core from 'src/core';
import * as types from 'src/app/types';
import * as validation from 'src/lib/validation';

export { types };

export const toRouter = (context: types.AppPageContext): Router => {
  return {
    locale: context.locale,
    locales: context.locales,
  };
};

export const toTime = (_: types.AppPageContext): Time => {
  return {
    now: () => new Date(),
  };
};

export const getAppConfig: IO.IO<types.AppConfig> = pipe(
  types.AppConfig.decode({
    defaultLocale: import.meta.env.DEFAULT_LOCALE,
    contentfulEnvironmentId: import.meta.env.CONTENTFUL_ENVIRONMENT_ID,
    contentfulSpaceId: import.meta.env.CONTENTFUL_SPACE_ID,
    contentfulAccessToken: import.meta.env.CONTENTFUL_ACCESS_TOKEN,
    contentfulHost: import.meta.env.CONTENTFUL_HOST,
  }),
  validation.toIO
);

export const getAppContext: IO.IO<types.AppContext> = pipe(
  getAppConfig,
  IO.map((config) => ({
    ...config,
    now: new Date(),
    locales: ['en', 'ja'],
    contentfulClientApi: contentful.createClient({
      environment: config.contentfulEnvironmentId,
      space: config.contentfulSpaceId,
      accessToken: config.contentfulAccessToken,
      host: config.contentfulHost,
    }),
  }))
);

export const getEntries = (
  contentType: string
): ReaderTask.ReaderTask<
  types.AppPageContext,
  ReadonlyArray<contentfulExtension.types.Entry>
> => {
  return pipe(
    ReaderTask.Do,
    ReaderTask.apS('context', ReaderTask.ask<types.AppPageContext>()),
    ReaderTask.chain(
      ({
        context,
      }): ReaderTask.ReaderTask<
        types.AppPageContext,
        ReadonlyArray<contentfulExtension.types.Entry>
      > =>
        pipe(
          ReaderTask.fromTask(async () => {
            return await context.contentfulClientApi.getEntries({
              locale: context.locale,
              content_type: contentType,
            });
          }),
          ReaderTask.map((collection) => collection.items)
        )
    )
  );
};

export const getEntriesByLocale = (
  contentType: string
): ReaderTask.ReaderTask<
  types.AppPageContext,
  Record<core.types.Locale, ReadonlyArray<contentfulExtension.types.Entry>>
> => {
  return pipe(
    ReaderTask.Do,
    ReaderTask.apS('context', ReaderTask.ask<types.AppPageContext>()),
    ReaderTask.chain(
      ({
        context,
      }): ReaderTask.ReaderTask<
        types.AppPageContext,
        Record<
          core.types.Locale,
          ReadonlyArray<contentfulExtension.types.Entry>
        >
      > =>
        pipe(
          context.locales,
          ReaderTask.traverseArray((locale) =>
            pipe(
              getEntries(contentType),
              ReaderTask.local((c: types.AppPageContext) => ({
                ...c,
                defaultLocale: locale,
              })),
              ReaderTask.map((entries) => [locale, entries] as const)
            )
          ),
          ReaderTask.map(
            ReadonlyArray.reduce(
              {} as Record<
                core.types.Locale,
                ReadonlyArray<contentfulExtension.types.Entry>
              >,
              (acc, [locale, entries]) => ({ ...acc, [locale]: entries })
            )
          )
        )
    )
  );
};

export const getProfile: ReaderTask.ReaderTask<
  types.AppPageContext,
  core.types.Profile
> = pipe(
  ReaderTask.Do,
  ReaderTask.apS('context', ReaderTask.ask<types.AppPageContext>()),
  ReaderTask.apS('entries', getEntries('profile')),
  ReaderTask.chain(
    ({
      entries,
    }): ReaderTask.ReaderTask<types.AppPageContext, core.types.Profile> =>
      pipe(
        ReaderTask.fromIO(
          pipe(
            entries,
            IO.traverseArray((entry) =>
              pipe(
                types.ProfileTable.decode(entry.fields),
                Either.map((schema) => ({
                  name: schema.name,
                  title: schema.title,
                  email: schema.email,
                  resumeEn: schema.resumeEn,
                  linkedinUrl:
                    schema.linkedinUrl == undefined ? null : schema.linkedinUrl,
                  instagramUrl:
                    schema.instagramUrl == undefined
                      ? null
                      : schema.instagramUrl,
                  twitterUrl:
                    schema.twitterUrl == undefined ? null : schema.twitterUrl,
                })),
                validation.toIO
              )
            ),
            IO.chain((items) =>
              pipe(
                items,
                ReadonlyArray.matchLeft(
                  () => () => {
                    throw new Error('Item not found');
                  },
                  (item) => () => ({
                    ...item,
                    resumeEn: {
                      url: item.resumeEn.fields.file.url,
                    },
                  })
                )
              )
            )
          )
        )
      )
  )
);

export const getWelcome: ReaderTask.ReaderTask<
  types.AppPageContext,
  core.types.Welcome
> = pipe(
  ReaderTask.Do,
  ReaderTask.apS('context', ReaderTask.ask<types.AppPageContext>()),
  ReaderTask.apS('entries', getEntries('welcome')),
  ReaderTask.chain(
    ({
      entries,
    }): ReaderTask.ReaderTask<types.AppPageContext, core.types.Welcome> =>
      pipe(
        ReaderTask.fromIO(
          pipe(
            entries,
            IO.traverseArray((entry) =>
              pipe(types.WelcomeTable.decode(entry.fields), validation.toIO)
            ),
            IO.chain((items) =>
              pipe(
                items,
                ReadonlyArray.matchLeft(
                  () => () => {
                    throw new Error('Item not found');
                  },
                  (item) => () => item
                )
              )
            )
          )
        )
      )
  )
);

export const getAbout: ReaderTask.ReaderTask<
  types.AppPageContext,
  core.types.About
> = pipe(
  ReaderTask.Do,
  ReaderTask.apS('context', ReaderTask.ask<types.AppPageContext>()),
  ReaderTask.apS('entries', getEntries('about')),
  ReaderTask.chain(
    ({
      entries,
    }): ReaderTask.ReaderTask<types.AppPageContext, core.types.About> =>
      pipe(
        ReaderTask.fromIO(
          pipe(
            entries,
            IO.traverseArray((entry) => {
              return pipe(
                types.AboutTable.decode(entry.fields),
                validation.toIO
              );
            }),
            IO.chain((items) => {
              return pipe(
                items,
                ReadonlyArray.matchLeft(
                  () => () => {
                    throw new Error('Item not found');
                  },
                  (item) => (): core.types.About => ({
                    ...item,
                    image: {
                      url: item.image.fields.file.url,
                      width: item.image.fields.file.details.image.width,
                      height: item.image.fields.file.details.image.height,
                    },
                  })
                )
              );
            })
          )
        )
      )
  )
);

export const getBiography: ReaderTask.ReaderTask<
  types.AppPageContext,
  core.types.Biography
> = pipe(
  ReaderTask.Do,
  ReaderTask.apS('context', ReaderTask.ask<types.AppPageContext>()),
  ReaderTask.apS('entries', getEntries('biography')),
  ReaderTask.chain(
    ({
      entries,
    }): ReaderTask.ReaderTask<types.AppPageContext, core.types.Biography> =>
      pipe(
        ReaderTask.fromIO(
          pipe(
            entries,
            IO.traverseArray((entry) =>
              pipe(types.BiographyTable.decode(entry.fields), validation.toIO)
            ),
            IO.chain((items) =>
              pipe(
                items,
                ReadonlyArray.matchLeft(
                  () => () => {
                    throw new Error('Item not found');
                  },
                  (item) => () => ({
                    ...item,
                    image: {
                      url: item.image.fields.file.url,
                      width: item.image.fields.file.details.image.width,
                      height: item.image.fields.file.details.image.height,
                    },
                  })
                )
              )
            )
          )
        )
      )
  )
);

export const getContact: ReaderTask.ReaderTask<
  types.AppPageContext,
  core.types.Contact
> = pipe(
  ReaderTask.Do,
  ReaderTask.apS('context', ReaderTask.ask<types.AppPageContext>()),
  ReaderTask.apS('entries', getEntries('contact')),
  ReaderTask.chain(
    ({
      entries,
    }): ReaderTask.ReaderTask<types.AppPageContext, core.types.Contact> =>
      pipe(
        ReaderTask.fromIO(
          pipe(
            entries,
            IO.traverseArray((entry) =>
              pipe(types.ContactTable.decode(entry.fields), validation.toIO)
            ),
            IO.chain((items) =>
              pipe(
                items,
                ReadonlyArray.matchLeft(
                  () => () => {
                    throw new Error('Item not found');
                  },
                  (item) => () => ({
                    ...item,
                    image: item.image
                      ? {
                          url: item.image.fields.file.url,
                          width: item.image.fields.file.details.image.width,
                          height: item.image.fields.file.details.image.height,
                        }
                      : undefined,
                  })
                )
              )
            )
          )
        )
      )
  )
);

export const getTranslations: ReaderTask.ReaderTask<
  types.AppPageContext,
  ReadonlyArray<core.types.Translation>
> = pipe(
  ReaderTask.Do,
  ReaderTask.apS('context', ReaderTask.ask<types.AppPageContext>()),
  ReaderTask.apS('entries', getEntries('translation')),
  ReaderTask.chain(
    ({
      entries,
    }): ReaderTask.ReaderTask<
      types.AppPageContext,
      ReadonlyArray<core.types.Translation>
    > =>
      pipe(
        ReaderTask.fromIO(
          pipe(
            entries,
            IO.traverseArray((item) =>
              pipe(
                types.TranslationTable.decode(item.fields),
                Either.map((schema) => ({
                  id: item.sys.id,
                  title: schema.title,
                  description: schema.description,
                  publishedAt: new Date(schema.publishedAt),
                  body: schema.body,
                  link: schema.link == undefined ? null : schema.link,
                  tags: item.metadata.tags.map((t) => ({ id: t.sys.id })),
                  image:
                    schema.image == undefined
                      ? null
                      : {
                          url: schema.image.fields.file.url,
                          width: schema.image.fields.file.details.image.width,
                          height: schema.image.fields.file.details.image.height,
                        },
                })),
                validation.toIO
              )
            ),
            IO.map(
              ReadonlyArray.sort(
                pipe(
                  _Date.Ord,
                  Ord.contramap<Date, core.types.Translation>(
                    (p) => p.publishedAt
                  ),
                  Ord.reverse
                )
              )
            )
          )
        )
      )
  )
);

export const getBlogPosts: ReaderTask.ReaderTask<
  types.AppPageContext,
  ReadonlyArray<core.types.BlogPost>
> = pipe(
  ReaderTask.Do,
  ReaderTask.apS('context', ReaderTask.ask<types.AppPageContext>()),
  ReaderTask.apS('entries', getEntries('blogPost')),
  ReaderTask.chain(
    ({
      entries,
    }): ReaderTask.ReaderTask<
      types.AppPageContext,
      ReadonlyArray<core.types.BlogPost>
    > =>
      pipe(
        ReaderTask.fromIO(
          pipe(
            entries,
            IO.traverseArray((item) =>
              pipe(
                types.BlogPostTable.decode(item.fields),
                Either.map((schema) => ({
                  id: item.sys.id,
                  title: schema.title,
                  description: schema.description,
                  publishedAt: new Date(schema.publishedAt),
                  body: schema.body,
                })),
                validation.toIO
              )
            )
          )
        )
      )
  )
);

export const getLocalization: ReaderTask.ReaderTask<
  types.AppPageContext,
  core.types.Localization
> = pipe(
  ReaderTask.Do,
  ReaderTask.apS('context', ReaderTask.ask<types.AppPageContext>()),
  ReaderTask.apS('entriesByLocale', getEntriesByLocale('localization')),
  ReaderTask.chain(
    ({
      context,
      entriesByLocale,
    }): ReaderTask.ReaderTask<types.AppPageContext, core.types.Localization> =>
      pipe(
        ReaderTask.fromIO(
          pipe(
            context.locales,
            IO.traverseArray((locale) =>
              pipe(
                entriesByLocale[locale],
                ReadonlyArray.matchLeft(
                  () => () => {
                    throw new Error('item not found');
                  },
                  (item) => () => item
                ),
                IO.chain((item) =>
                  pipe(
                    types.LocalizationTable.decode(item.fields),
                    Either.map((table) => table.content),
                    validation.toIO
                  )
                ),
                IO.map((localization) => [locale, localization] as const)
              )
            ),
            IO.map(
              ReadonlyArray.reduce(
                {} as core.types.Localization,
                (acc, [locale, entry]) => ({ ...acc, [locale]: entry })
              )
            )
          )
        )
      )
  )
);
