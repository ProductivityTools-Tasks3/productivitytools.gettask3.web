import React from "react";
import { createPlateUI, StyledElement, withProps } from "@udecode/plate";
import { ELEMENT_TITLE } from "./constants";
import {
  TaskTableElement,
  TaskTableRowElement,
  TaskTableCellElement,
  TaskTableCellHeaderElement,
} from "./TableElements";

const LinkComponent = (props) => {
  const { attributes, children, element } = props;
  return (
    <a
      {...attributes}
      href={element.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "#1976d2",
        textDecoration: "underline",
        cursor: "pointer",
        wordBreak: "break-word",
      }}
    >
      {children}
    </a>
  );
};

export const plateUI = createPlateUI({
  [ELEMENT_TITLE]: withProps(StyledElement, {
    as: "h1",
    styles: {
      root: {
        margin: "6px 0 8px 0",
        fontSize: "22px",
        fontWeight: "700",
        color: "#1565c0",
      },
    },
  }),
  paragraph: withProps(StyledElement, {
    as: "p",
    styles: {
      root: {
        margin: "4px 0",
        lineHeight: 1.6,
      },
    },
  }),
  h1: withProps(StyledElement, {
    as: "h1",
    styles: {
      root: {
        margin: "18px 0 6px 0",
        fontSize: "20px",
        fontWeight: "700",
        color: "#222",
      },
    },
  }),
  h2: withProps(StyledElement, {
    as: "h2",
    styles: {
      root: {
        margin: "14px 0 4px 0",
        fontSize: "18px",
        fontWeight: "600",
        color: "#333",
      },
    },
  }),
  code_block: withProps(StyledElement, {
    as: "pre",
    styles: {
      root: {
        backgroundColor: "#f5f5f5",
        padding: "12px 16px",
        borderRadius: "6px",
        fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
        fontSize: "13px",
        lineHeight: "1.45",
        overflowX: "auto",
        margin: "10px 0",
        border: "1px solid #e0e0e0",
      },
    },
  }),
  code_line: withProps(StyledElement, {
    as: "div",
    styles: {
      root: {
        fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
        fontSize: "13px",
        whiteSpace: "pre-wrap",
      },
    },
  }),
  lic: withProps(StyledElement, {
    as: "span",
    styles: {
      root: {
        display: "inline",
      },
    },
  }),
  a: LinkComponent,
  table: TaskTableElement,
  tr: TaskTableRowElement,
  td: TaskTableCellElement,
  th: TaskTableCellHeaderElement,
});
