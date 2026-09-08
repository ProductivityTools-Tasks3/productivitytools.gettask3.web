import {
  createPlateUI,
  ELEMENT_CODE_BLOCK,
  CodeBlockElement,
  ELEMENT_H1,
  StyledElement,
  withProps,
} from "@udecode/plate";
import { ELEMENT_TITLE } from "./constants";

export const plateUI = createPlateUI({
  [ELEMENT_CODE_BLOCK]: CodeBlockElement,
  [ELEMENT_TITLE]: withProps(StyledElement, {
    styles: {
      root: {
        margin: "0 0 0 0",
        fontSize: "25px",
        fontWeight: "1000",
        color: "gray",
      },
    },
  }),
  [ELEMENT_H1]: withProps(StyledElement, {
    styles: {
      root: {
        margin: "0 0 0 0",
        fontSize: "20px",
        fontWeight: "1000",
      },
    },
  }),
});
