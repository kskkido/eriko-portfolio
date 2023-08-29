import { BLOCKS } from '@contentful/rich-text-types';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { identity, flow, pipe, absurd } from 'fp-ts/lib/function';
import * as Array from 'fp-ts/lib/Array';
import * as NonEmptyArray from 'fp-ts/lib/NonEmptyArray';
import * as Eq from 'fp-ts/lib/Eq';
import * as Option from 'fp-ts/lib/Option';
import * as Either from 'fp-ts/lib/Either';
import type * as types from './types';
import * as contentful from 'src/lib/contentful/types';

export const fromRichTextDocument = (
  doc: contentful.RichTextDocument
): types.TableOfContents => {
  return pipe(headersFromRichTextBlocks(doc.content), fromHeaders);
};

export const fromHeaders = (
  headers: types.TableOfContentsHeader[]
): types.TableOfContents => {
  return pipe(
    headers,
    NonEmptyArray.group(
      Eq.fromEquals<types.TableOfContentsHeader>((x, y) => x.level > y.level)
    ),
    Array.map(
      NonEmptyArray.matchLeft((header, rest) => ({
        header,
        children: fromHeaders(rest),
      }))
    )
  );
};

export const htmlFromRichTextDocument = (
  doc: contentful.RichTextDocument
): string => {
  return documentToHtmlString(doc as any, {
    renderNode: {
      [BLOCKS.HEADING_1]: (node, next) => {
        const id = pipe(
          node,
          Option.fromEitherK(contentful.RichTextBlock.decode),
          Option.chain(textContentFromRichTextBlock),
          Option.map(headerIdFromTitle),
          Option.toNullable
        );
        return `<h1 ${id == undefined ? '' : `id="${id}"`}>${next(
          node.content
        )}</h1>`;
      },
      [BLOCKS.HEADING_2]: (node, next) => {
        const id = pipe(
          node,
          Option.fromEitherK(contentful.RichTextBlock.decode),
          Option.chain(textContentFromRichTextBlock),
          Option.map(headerIdFromTitle),
          Option.toNullable
        );
        return `<h2 ${id == undefined ? '' : `id="${id}"`}>${next(
          node.content
        )}</h2>`;
      },
      [BLOCKS.HEADING_3]: (node, next) => {
        const id = pipe(
          node,
          Option.fromEitherK(contentful.RichTextBlock.decode),
          Option.chain(textContentFromRichTextBlock),
          Option.map(headerIdFromTitle),
          Option.toNullable
        );
        return `<h3 ${id == undefined ? '' : `id="${id}"`}>${next(
          node.content
        )}</h3>`;
      },
      [BLOCKS.HEADING_4]: (node, next) => {
        const id = pipe(
          node,
          Option.fromEitherK(contentful.RichTextBlock.decode),
          Option.chain(textContentFromRichTextBlock),
          Option.map(headerIdFromTitle),
          Option.toNullable
        );
        return `<h4 ${id == undefined ? '' : `id="${id}"`}>${next(
          node.content
        )}</h4>`;
      },
      [BLOCKS.HEADING_5]: (node, next) => {
        const id = pipe(
          node,
          Option.fromEitherK(contentful.RichTextBlock.decode),
          Option.chain(textContentFromRichTextBlock),
          Option.map(headerIdFromTitle),
          Option.toNullable
        );
        return `<h5 ${id == undefined ? '' : `id="${id}"`}>${next(
          node.content
        )}</h5>`;
      },
      [BLOCKS.HEADING_6]: (node, next) => {
        const id = pipe(
          node,
          Option.fromEitherK(contentful.RichTextBlock.decode),
          Option.chain(textContentFromRichTextBlock),
          Option.map(headerIdFromTitle),
          Option.toNullable
        );
        return `<h6 ${id == undefined ? '' : `id="${id}"`}>${next(
          node.content
        )}</h6>`;
      },
    },
  });
};

export const headerIdFromTitle = (title: string) => {
  return title.replace(/\W+/g, '-');
};

export const headersFromRichTextBlocks = (
  blocks: contentful.RichTextBlock[]
): types.TableOfContentsHeader[] => {
  return pipe(
    blocks,
    mapRichTextBlocks(headerFromRichTextBlock),
    Array.filterMap(identity)
  );
};

export const headerFromRichTextBlock = (
  block: contentful.RichTextBlock
): Option.Option<types.TableOfContentsHeader> => {
  return pipe(
    Option.Do,
    Option.apS('level', headerLevelFromRichTextBlock(block)),
    Option.apS('title', textContentFromRichTextBlock(block)),
    Option.map(({ level, title }) => ({
      level,
      title,
      id: headerIdFromTitle(title),
    }))
  );
};

export const headerLevelFromRichTextBlock = (
  block: contentful.RichTextBlock
): Option.Option<number> => {
  switch (block.nodeType) {
    case 'heading-1': {
      return Option.of(1);
    }
    case 'heading-2': {
      return Option.of(2);
    }
    case 'heading-3': {
      return Option.of(3);
    }
    case 'heading-4': {
      return Option.of(4);
    }
    case 'heading-5': {
      return Option.of(5);
    }
    case 'heading-6': {
      return Option.of(6);
    }
    default: {
      return Option.none;
    }
  }
};

export const textContentFromRichTextBlock = (
  block: contentful.RichTextBlock
): Option.Option<string> => {
  return pipe(
    block,
    mapRichTextText((text) => text.value),
    Array.matchLeft(
      () => Option.none,
      (head, rest) => Option.of([head, ...rest].join(' '))
    )
  );
};

export const mapRichTextBlocks =
  <A>(fn: (block: contentful.RichTextBlock) => A) =>
  (seed: contentful.RichTextBlock[]): A[] => {
    const iter = (blocks: contentful.RichTextBlock[]): A[] => {
      return blocks.flatMap((block) => {
        return [
          fn(block),
          ...iter(
            pipe(
              block.content,
              Array.filterMap(
                flow(
                  contentful.RichTextBlock.decode,
                  Either.fold(() => Option.none, Option.of)
                )
              )
            )
          ),
        ];
      });
    };
    return iter(seed);
  };

export const mapRichTextText =
  <A>(fn: (block: contentful.RichTextText) => A) =>
  (seed: contentful.RichTextBlock): A[] => {
    const iter = (blocks: contentful.RichText[]): A[] => {
      return blocks.flatMap((block) => {
        if (contentful.RichTextText.is(block)) {
          return [fn(block)];
        } else if (contentful.RichTextBlock.is(block)) {
          return iter(block.content);
        } else if (contentful.RichTextInline.is(block)) {
          return iter(block.content);
        } else {
          return absurd(block);
        }
      });
    };
    return iter(seed.content);
  };
