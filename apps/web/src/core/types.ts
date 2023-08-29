import * as t from 'io-ts';
import * as td from 'io-ts-types';
import * as contentful from 'src/lib/contentful/types';

export const Locale = t.union([t.literal('ja'), t.literal('en')]);

export type Locale = t.TypeOf<typeof Locale>;

export type Localization = Record<Locale, string>;

export const Image = t.type({
  url: t.string,
  width: t.number,
  height: t.number,
});

export type Image = t.TypeOf<typeof Image>;

export const Media = t.type({
  url: t.string,
});

export type Media = t.TypeOf<typeof Media>;

export const About = t.type({
  title: t.string,
  body: contentful.RichTextDocument,
  image: Image,
});

export type About = t.TypeOf<typeof About>;

export const Biography = t.type({
  title: t.string,
  body: contentful.RichTextDocument,
  image: Image,
});

export type Biography = t.TypeOf<typeof Biography>;

export const Contact = t.intersection([
  t.type({
    title: t.string,
    body: contentful.RichTextDocument,
  }),
  t.partial({
    image: Image,
  }),
]);

export type Contact = t.TypeOf<typeof Contact>;

export const Tag = t.type({
  id: t.string,
});

export type Tag = t.TypeOf<typeof Tag>;

export const Translation = t.type({
  id: t.string,
  title: t.string,
  description: t.string,
  publishedAt: td.date,
  link: t.union([t.string, t.null]),
  image: t.union([Image, t.null]),
  body: contentful.RichTextDocument,
  tags: t.array(Tag),
});

export type Translation = t.TypeOf<typeof Translation>;

export type Profile = {
  email: string;
  resumeEn: Media;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
};

export type Article = {
  id: string;
  title: string;
  description: string;
  publishedAt: Date;
  body: contentful.RichTextDocument;
};

export type BlogPost = {
  id: string;
  title: string;
  description: string;
  publishedAt: Date;
  body: contentful.RichTextDocument;
};

export const Welcome = t.type({
  title: t.string,
  body: contentful.RichTextDocument,
});

export type Welcome = t.TypeOf<typeof Welcome>;

export class Exception extends Error {}

export type TableOfContents = TableOfContentsNode[];

export type TableOfContentsNode = {
  header: TableOfContentsHeader;
  children: TableOfContents;
};

export const TableOfContentsHeader = t.type({
  id: t.string,
  level: t.number,
  title: t.string,
});

export type TableOfContentsHeader = t.TypeOf<typeof TableOfContentsHeader>;
