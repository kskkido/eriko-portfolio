import * as t from 'io-ts';
import * as types from 'src/core/types';
import type contentful from 'contentful';
import * as contentfulExtension from 'src/lib/contentful/types';

export const AppConfig = t.type({
  defaultLocale: types.Locale,
  contentfulEnvironmentId: t.string,
  contentfulSpaceId: t.string,
  contentfulAccessToken: t.string,
  contentfulHost: t.string,
});

export type AppConfig = t.TypeOf<typeof AppConfig>;

export type AppContext = {
  now: Date;
  locales: types.Locale[];
  defaultLocale: types.Locale;
  contentfulClientApi: contentful.ContentfulClientApi<undefined>;
};

export type AppPageContext = AppContext & {
  locale: types.Locale;
};

export const ImageEntry = t.type({
  fields: t.type({
    title: t.string,
    description: t.string,
    file: contentfulExtension.ImageFile,
  }),
});

export type ImageEntry = t.TypeOf<typeof ImageEntry>;

export const MediaEntry = t.type({
  fields: t.type({
    title: t.string,
    file: contentfulExtension.MediaFile,
  }),
});

export type MediaEntry = t.TypeOf<typeof MediaEntry>;

export const AboutTable = t.type({
  title: t.string,
  description: t.string,
  body: contentfulExtension.RichTextDocument,
  image: ImageEntry,
});

export type AboutTable = t.TypeOf<typeof AboutTable>;

export const BiographyTable = t.type({
  title: t.string,
  body: contentfulExtension.RichTextDocument,
  image: ImageEntry,
});

export type BiographyTable = t.TypeOf<typeof BiographyTable>;

export const ContactTable = t.intersection([
  t.type({
    title: t.string,
    body: contentfulExtension.RichTextDocument,
  }),
  t.partial({
    image: ImageEntry,
  }),
]);

export type ContactTable = t.TypeOf<typeof BiographyTable>;

export const TranslationTable = t.intersection([
  t.type({
    title: t.string,
    description: t.string,
    publishedAt: t.string,
    body: contentfulExtension.RichTextDocument,
  }),
  t.partial({
    link: t.string,
    image: ImageEntry,
  }),
]);

export type TranslationTable = t.TypeOf<typeof TranslationTable>;

export const ProfileTable = t.intersection([
  t.type({
    name: t.string,
    title: t.string,
    email: t.string,
    resumeEn: MediaEntry,
  }),
  t.partial({
    linkedinUrl: t.string,
    instagramUrl: t.string,
    twitterUrl: t.string,
  }),
]);

export type ProfileTable = t.TypeOf<typeof ProfileTable>;

export const ArticleTable = t.type({
  title: t.string,
  description: t.string,
  publishedAt: t.string,
  body: contentfulExtension.RichTextDocument,
});

export type ArticleTable = t.TypeOf<typeof ArticleTable>;

export const BlogPostTable = t.type({
  title: t.string,
  description: t.string,
  publishedAt: t.string,
  body: contentfulExtension.RichTextDocument,
});

export type BlogPostTable = t.TypeOf<typeof BlogPostTable>;

export const WelcomeTable = t.type({
  title: t.string,
  body: contentfulExtension.RichTextDocument,
});

export type WelcomeTable = t.TypeOf<typeof WelcomeTable>;

export const LocalizationTable = t.type({
  content: t.record(t.string, t.string),
});

export type LocalizationTable = t.TypeOf<typeof LocalizationTable>;
