import { createPluginFactory } from "@udecode/plate";
import { ELEMENT_TITLE } from "../constants";

export const createTitlePlugin = createPluginFactory({
  key: ELEMENT_TITLE,
  isElement: true,
});
