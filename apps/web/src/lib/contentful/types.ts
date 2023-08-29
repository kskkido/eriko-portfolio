import * as t from 'io-ts';
import type contentful from 'contentful';

export type Entry = {
  metadata: contentful.Metadata;
  sys: contentful.EntrySys;
  fields: unknown;
};

export type RichTextBlock = {
  value?: string;
  nodeType:
    | 'document'
    | 'paragraph'
    | 'heading-1'
    | 'heading-2'
    | 'heading-3'
    | 'heading-4'
    | 'heading-5'
    | 'heading-6'
    | 'ordered-list'
    | 'unordered-list'
    | 'list-item'
    | 'hr'
    | 'blockquote'
    | 'embedded-entry-block'
    | 'embedded-asset-block'
    | 'embedded-resource-block'
    | 'table'
    | 'table-row'
    | 'table-cell'
    | 'table-header-cell';
  data: Record<string, unknown>;
  content: Array<RichTextBlock | RichTextInline | RichTextText>;
};

export const RichTextBlock: t.Type<RichTextBlock> = t.recursion(
  'RichTextBlock',
  () =>
    t.intersection([
      t.type({
        nodeType: t.union([
          t.literal('document'),
          t.literal('paragraph'),
          t.literal('heading-1'),
          t.literal('heading-2'),
          t.literal('heading-3'),
          t.literal('heading-4'),
          t.literal('heading-5'),
          t.literal('heading-6'),
          t.literal('ordered-list'),
          t.literal('unordered-list'),
          t.literal('list-item'),
          t.literal('hr'),
          t.literal('blockquote'),
          t.literal('embedded-entry-block'),
          t.literal('embedded-asset-block'),
          t.literal('embedded-resource-block'),
          t.literal('table'),
          t.literal('table-row'),
          t.literal('table-cell'),
          t.literal('table-header-cell'),
        ]),
        data: t.record(t.string, t.unknown),
        content: t.array(
          t.union([RichTextBlock, RichTextInline, RichTextText])
        ),
      }),
      t.partial({
        value: t.string,
      }),
    ])
);

export type RichTextInline = {
  data: Record<string, unknown>;
  nodeType:
    | 'hyperlink'
    | 'entry-hyperlink'
    | 'asset-hyperlink'
    | 'embedded-entry-inline';
  content: Array<RichTextInline | RichTextText>;
};

export const RichTextInline: t.Type<RichTextInline> = t.recursion(
  'RichTextInline',
  () =>
    t.type({
      nodeType: t.union([
        t.literal('hyperlink'),
        t.literal('entry-hyperlink'),
        t.literal('asset-hyperlink'),
        t.literal('embedded-entry-inline'),
      ]),
      data: t.record(t.string, t.unknown),
      content: t.array(t.union([RichTextInline, RichTextText])),
    })
);

export type RichTextText = {
  data: Record<string, unknown>;
  nodeType: 'text';
  value: string;
  marks: Array<{ type: string }>;
};

export const RichTextText: t.Type<RichTextText> = t.recursion(
  'RichTextText',
  () =>
    t.type({
      nodeType: t.literal('text'),
      data: t.record(t.string, t.unknown),
      value: t.string,
      marks: t.array(
        t.type({
          type: t.string,
        })
      ),
    })
);

export type RichTextTopLevelBlock = {
  nodeType:
    | 'paragraph'
    | 'heading-1'
    | 'heading-2'
    | 'heading-3'
    | 'heading-4'
    | 'heading-5'
    | 'heading-6'
    | 'ordered-list'
    | 'unordered-list'
    | 'hr'
    | 'blockquote'
    | 'embedded-entry-block'
    | 'embedded-asset-block'
    | 'embedded-resource-block'
    | 'table';
  data: Record<string, unknown>;
  content: Array<RichTextBlock | RichTextInline | RichTextText>;
};

export const RichTextTopLevelBlock: t.Type<RichTextTopLevelBlock> = t.recursion(
  'RichTextTopLevelBlock',
  () =>
    t.type({
      nodeType: t.union([
        t.literal('paragraph'),
        t.literal('heading-1'),
        t.literal('heading-2'),
        t.literal('heading-3'),
        t.literal('heading-4'),
        t.literal('heading-5'),
        t.literal('heading-6'),
        t.literal('ordered-list'),
        t.literal('unordered-list'),
        t.literal('hr'),
        t.literal('blockquote'),
        t.literal('embedded-entry-block'),
        t.literal('embedded-asset-block'),
        t.literal('embedded-resource-block'),
        t.literal('table'),
      ]),
      data: t.record(t.string, t.unknown),
      content: t.array(t.union([RichTextBlock, RichTextInline, RichTextText])),
    })
);

export type RichTextDocument = {
  nodeType: 'document';
  data: Record<string, unknown>;
  content: Array<RichTextTopLevelBlock>;
};

export const RichTextDocument: t.Type<RichTextDocument> = t.recursion(
  'RichTextDocument',
  () =>
    t.type({
      nodeType: t.literal('document'),
      data: t.record(t.string, t.unknown),
      content: t.array(RichTextTopLevelBlock),
    })
);

export type RichTextListItemBlock = {
  nodeType:
    | 'paragraph'
    | 'heading-1'
    | 'heading-2'
    | 'heading-3'
    | 'heading-4'
    | 'heading-5'
    | 'heading-6'
    | 'ordered-list'
    | 'unordered-list'
    | 'hr'
    | 'blockquote'
    | 'embedded-entry-block'
    | 'embedded-asset-block'
    | 'embedded-resource-block';
  data: Record<string, unknown>;
  content: Array<RichTextBlock | RichTextInline | RichTextText>;
};

export const RichTextListItemBlock: t.Type<RichTextListItemBlock> = t.recursion(
  'RichTextListItemBlock',
  () =>
    t.type({
      nodeType: t.union([
        t.literal('paragraph'),
        t.literal('heading-1'),
        t.literal('heading-2'),
        t.literal('heading-3'),
        t.literal('heading-4'),
        t.literal('heading-5'),
        t.literal('heading-6'),
        t.literal('ordered-list'),
        t.literal('unordered-list'),
        t.literal('hr'),
        t.literal('blockquote'),
        t.literal('embedded-entry-block'),
        t.literal('embedded-asset-block'),
        t.literal('embedded-resource-block'),
      ]),
      data: t.record(t.string, t.unknown),
      content: t.array(t.union([RichTextBlock, RichTextInline, RichTextText])),
    })
);

export const RichText = t.union([RichTextBlock, RichTextInline, RichTextText]);

export type RichText = t.TypeOf<typeof RichText>;

export const MediaFile = t.type({
  url: t.string,
  fileName: t.string,
  contentType: t.string,
});

export type MediaFile = t.TypeOf<typeof MediaFile>;

export const ImageFile = t.intersection([
  MediaFile,
  t.type({
    details: t.type({
      size: t.number,
      image: t.type({
        width: t.number,
        height: t.number,
      }),
    }),
  }),
]);

export type ImageFile = t.TypeOf<typeof ImageFile>;
