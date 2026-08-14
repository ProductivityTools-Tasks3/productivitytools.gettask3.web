import {
  createPlugins,
  createBasicElementsPlugin,
  createBasicMarksPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  createNormalizeTypesPlugin,
  createTrailingBlockPlugin,
  createExitBreakPlugin,
  createLinkPlugin,
  createListPlugin,
  createIndentListPlugin,
  createIndentPlugin,
  createTablePlugin,
  createImagePlugin,
  createMediaEmbedPlugin,
  createSelectOnBackspacePlugin,
  ELEMENT_IMAGE,
} from "@udecode/plate";

import { createTitlePlugin } from "./titlePlugin";
import { forcedLayoutPlugin } from "./forcedLayoutPlugin";
import { exitBreakPlugin } from "./exitBreakPlugin";
import { resetBlockTypePlugin } from "./resetBlockTypePlugin";
import { softBreakPlugin } from "./softBreakPlugin";
import { trailingBlockPlugin } from "./trailingBlockPlugin";
import { linkPlugin } from "./linkPlugin";
import { indentPlugin, indentListPlugin } from "./indentPlugin";
import { plateUI } from "../plateUI";

export const getEditorPlugins = () =>
  createPlugins(
    [
      createBasicElementsPlugin(),
      createBasicMarksPlugin(),
      createTitlePlugin(),
      createResetNodePlugin(resetBlockTypePlugin),
      createSoftBreakPlugin(softBreakPlugin),
      createNormalizeTypesPlugin(forcedLayoutPlugin),
      createTrailingBlockPlugin(trailingBlockPlugin),
      createExitBreakPlugin(exitBreakPlugin),
      createLinkPlugin(linkPlugin),
      createListPlugin(),
      createIndentListPlugin(indentListPlugin),
      createIndentPlugin(indentPlugin),
      createTablePlugin({
        options: {
          initialTableWidth: 600,
        },
      }),
      createImagePlugin(),
      createMediaEmbedPlugin(),
      createSelectOnBackspacePlugin({
        options: {
          query: {
            allow: [ELEMENT_IMAGE],
          },
        },
      }),
    ],
    {
      components: plateUI,
    }
  );
