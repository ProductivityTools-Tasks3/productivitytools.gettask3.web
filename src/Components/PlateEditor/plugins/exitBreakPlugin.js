import { KEYS_HEADING } from "@udecode/plate";
import { ELEMENT_TITLE } from "../constants";

export const exitBreakPlugin = {
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
};
