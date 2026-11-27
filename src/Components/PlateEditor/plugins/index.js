import {
  PlateFloatingLink,
  createPlugins,
  createBasicElementsPlugin,
  createBasicMarksPlugin,
  createHeadingPlugin,
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createParagraphPlugin,
  createBoldPlugin,
  createItalicPlugin,
  createUnderlinePlugin,
  createStrikethroughPlugin,
  createCodePlugin,
  createFontColorPlugin,
  createListPlugin,
  createIndentPlugin,
  createTablePlugin,
  createLinkPlugin,
  createMediaEmbedPlugin,
  createExitBreakPlugin,
  createSoftBreakPlugin,
  createResetNodePlugin,
  createNormalizeTypesPlugin,
  createTrailingBlockPlugin,
  createPluginFactory,
  KEYS_HEADING,
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  isBlockAboveEmpty,
  isCodeBlockEmpty,
  isSelectionAtBlockStart,
  isSelectionAtCodeBlockStart,
  unwrapCodeBlock,
} from "@udecode/plate";
import { ELEMENT_TITLE } from "../constants";
import { plateUI } from "../plateUI";
import { openColorContextMenu } from "../ToolbarButtons";

const createTitlePlugin = createPluginFactory({
  key: ELEMENT_TITLE,
  isElement: true,
});

const createParagraphAltPlugin = createPluginFactory({
  key: "paragraph",
  isElement: true,
});

const stripPolishDiacritics = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase();

const createTabletAutocompleteFixPlugin = createPluginFactory({
  key: "tabletAutocompleteFix",
  withOverrides: (editor) => {
    const { insertText } = editor;
    let isPasteOrDrop = false;

    editor._setPasteOrDrop = (val) => {
      isPasteOrDrop = val;
    };

    editor.insertText = (text) => {
      if (!isPasteOrDrop && typeof text === "string" && editor.selection) {
        const trimmed = text.trim();
        const { anchor, focus } = editor.selection;
        const isCollapsed =
          anchor &&
          focus &&
          anchor.offset === focus.offset &&
          anchor.path.length === focus.path.length &&
          anchor.path.every((v, i) => v === focus.path[i]);

        if (isCollapsed && trimmed.length >= 2 && !/^\s/.test(text) && !/\s/.test(trimmed)) {
          try {
            let node = editor;
            for (const idx of anchor.path) {
              node = node?.children?.[idx];
            }
            if (node && typeof node.text === "string") {
              const beforeCursor = node.text.slice(0, anchor.offset);
              const wordMatch = beforeCursor.match(
                /([^\s.,!?;:()[\]{}"'`~@#$%^&*+=<>\\/|]+)$/
              );
              if (wordMatch) {
                const typedWord = wordMatch[1];
                const normTrimmed = stripPolishDiacritics(trimmed);
                const normTyped = stripPolishDiacritics(typedWord);
                if (normTrimmed.startsWith(normTyped) && normTrimmed.length >= normTyped.length) {
                  const wordStartOffset = anchor.offset - typedWord.length;
                  if (typeof editor.select === "function") {
                    editor.select({
                      anchor: { path: anchor.path, offset: wordStartOffset },
                      focus: anchor,
                    });
                  }
                }
              }
            }
          } catch (_e) {}
        }
      }
      insertText(text);
    };

    return editor;
  },
  handlers: {
    onPaste: (editor) => () => {
      if (editor._setPasteOrDrop) {
        editor._setPasteOrDrop(true);
        setTimeout(() => editor._setPasteOrDrop(false), 0);
      }
    },
    onDrop: (editor) => () => {
      if (editor._setPasteOrDrop) {
        editor._setPasteOrDrop(true);
        setTimeout(() => editor._setPasteOrDrop(false), 0);
      }
    },
  },
});

let isRightAltDown = false;
if (typeof window !== "undefined") {
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.code === "AltRight") isRightAltDown = true;
    },
    true
  );
  window.addEventListener(
    "keyup",
    (e) => {
      if (e.code === "AltRight") isRightAltDown = false;
    },
    true
  );
  window.addEventListener("blur", () => {
    isRightAltDown = false;
  });
}

export const getEditorPlugins = () =>
  createPlugins(
    [
      createBasicElementsPlugin(),
      createTitlePlugin(),
      createParagraphAltPlugin(),
      createNormalizeTypesPlugin({
        options: {
          rules: [{ path: [0], strictType: ELEMENT_TITLE }],
        },
      }),
      createTrailingBlockPlugin({
        options: {
          type: ELEMENT_PARAGRAPH,
        },
      }),
      createExitBreakPlugin({
        options: {
          rules: [
            {
              hotkey: "mod+enter",
            },
            {
              hotkey: "mod+shift+enter",
              before: true,
            },
            {
              hotkey: "enter",
              query: {
                start: true,
                end: true,
                allow: [...KEYS_HEADING, ELEMENT_TITLE],
              },
              relative: true,
              level: 1,
            },
          ],
        },
      }),
      createResetNodePlugin({
        options: {
          rules: [
            {
              types: [ELEMENT_BLOCKQUOTE],
              defaultType: ELEMENT_PARAGRAPH,
              hotkey: "Enter",
              predicate: isBlockAboveEmpty,
            },
            {
              types: [ELEMENT_BLOCKQUOTE],
              defaultType: ELEMENT_PARAGRAPH,
              hotkey: "Backspace",
              predicate: isSelectionAtBlockStart,
            },
            {
              types: [ELEMENT_CODE_BLOCK],
              defaultType: ELEMENT_PARAGRAPH,
              onReset: unwrapCodeBlock,
              hotkey: "Enter",
              predicate: isCodeBlockEmpty,
            },
            {
              types: [ELEMENT_CODE_BLOCK],
              defaultType: ELEMENT_PARAGRAPH,
              onReset: unwrapCodeBlock,
              hotkey: "Backspace",
              predicate: isSelectionAtCodeBlockStart,
            },
          ],
        },
      }),
      createBasicMarksPlugin(),
      createHeadingPlugin(),
      createBlockquotePlugin(),
      createCodeBlockPlugin(),
      createParagraphPlugin(),
      createBoldPlugin(),
      createItalicPlugin(),
      createUnderlinePlugin(),
      createStrikethroughPlugin(),
      createCodePlugin(),
      createFontColorPlugin({
        handlers: {
          onKeyDown: (editor) => (e) => {
            if (e.defaultPrevented) return;
            const lower = (e.key || "").toLowerCase();
            const isCtrlM =
              (e.ctrlKey || e.metaKey) &&
              !e.shiftKey &&
              !e.altKey &&
              (lower === "m" || e.code === "KeyM");
            const isLeftAltC =
              e.altKey &&
              !e.ctrlKey &&
              !e.metaKey &&
              !e.shiftKey &&
              !isRightAltDown &&
              (lower === "c" || e.code === "KeyC");
            if (isCtrlM || isLeftAltC) {
              e.preventDefault();
              e.stopPropagation();
              openColorContextMenu(editor);
            }
          },
        },
      }),
      createListPlugin(),
      createIndentPlugin({
        offset: 24,
        unit: "px",
      }),
      createTablePlugin({
        options: {
          initialTableWidth: 600,
        },
      }),
      createLinkPlugin({
        renderAfterEditable: PlateFloatingLink,
      }),
      createMediaEmbedPlugin(),
      createSoftBreakPlugin(),
      createTabletAutocompleteFixPlugin(),
    ],
    {
      components: plateUI,
    }
  );
