import React, { useEffect, useState, useRef } from "react";
import { css } from "@emotion/core";
import { useFade, usePalette } from "reakit-system-palette/utils";
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
  const [withError, setError] = useState(false);
  const isNegativeVariant = variant === "negative";
  const dropdownStyles = `
    .algolia-autocomplete {
      .algolia-docsearch-footer {
        height: 30px;
      }

      .algolia-docsearch-suggestion {
        width: 100%;
      }

      .algolia-docsearch-suggestion--title {
        text-transform: capitalize;
      }

      .algolia-docsearch-suggestion--text {
        text-transform: lowercase;
      }

      .ds-dropdown-menu {
        box-shadow: 0 1px 2px ${useFade(usePalette("foregroud"), 0.85)};
      }

      a {
        text-decoration: none;
      }
    }
  `;

  useEffect(() => {
    import("docsearch.js")
      .then(module => {
        module.default({
          apiKey: "2f44778ac6ae42bb4edea44efbb0b647",
          indexName: "reakit",
          inputSelector: `#${searchInputId}`,
          debug: false
        });

        addStyleSheet(docSearchCSSPath);
      })
      .catch(() => setError(true));
  }, []);

  if (withError) return null;

  return (
    <div
      css={css`
        display: flex;
        background: #d0d0d042;
        ${dropdownStyles};
      `}
    >
      <MagnifierIcon
        negative={isNegativeVariant}
        css={css`
          display: inline-block;
          margin-left: 10px;
        `}
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
        id={searchInputId}
        name={searchInputId}
        ref={inputEl}
        placeholder="Start typing to search"
        css={css`
          padding: 10px;
          margin: 0 0 0 5px;
          font-size: 100%;
          border: none;
          outline: none;
          width: 170px;
          transition: width 0.3s ease-in-out;
          background: transparent;

          ${isNegativeVariant
            ? `
            color: white;
          `
            : `
          background: transparent;
          color: unset;
          `} &::placeholder {
            color: ${isNegativeVariant ? "rgba(255,255,255, .6)" : "#9E9E9E"};
          }
        `}
      />
    </div>
  );
}
