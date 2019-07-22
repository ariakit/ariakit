import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { css } from "@emotion/core";
import MagnifierIcon from "../icons/Magnifier";
import addStyleSheet from "../utils/addStyleSheet";

const docSearchCSSPath =
  "https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css";
const searchInputId = "docsearch-input";

interface ISearchBarProps {
  variant?: "negative" | "default";
}

export default function SearchBar({ variant = "default" }: ISearchBarProps) {
  const inputEl = useRef(null);
  const [isOpen, setOpen] = useState(false);
  const toggleSearch = () => setOpen(!isOpen);
  const isNegativeVariant = variant === "negative";

  useEffect(() => {
    import("docsearch.js").then(module => {
      module.default({
        apiKey: "2f44778ac6ae42bb4edea44efbb0b647",
        indexName: "reakit",
        inputSelector: `#${searchInputId}`,
        debug: false
      });

      addStyleSheet(docSearchCSSPath);
    });
  }, []);

  useLayoutEffect(() => {
    isOpen && inputEl.current
      ? inputEl.current.focus()
      : inputEl.current.blur();
  }, [isOpen]);

  return (
    <>
      <MagnifierIcon
        onClick={toggleSearch}
        onFocus={toggleSearch}
        negative={isNegativeVariant}
      />
      <label
        htmlFor={searchInputId}
        css={css`
          display: none;
        `}
      >
        Search documentation
      </label>
      <input
        type="text"
        name={searchInputId}
        ref={inputEl}
        onBlur={toggleSearch}
        placeholder="Start typing to search"
        css={css`
          padding: 0;
          margin: 0;
          font-size: 100%;
          border: none;
          width: ${isOpen ? "200px" : "0"};
          color: ${isNegativeVariant ? "white" : "unset"};
          background: transparent;
          transition: width 0.3s ease-in-out;
        `}
      />
    </>
  );
}
