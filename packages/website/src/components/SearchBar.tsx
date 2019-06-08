import React from "react";
import { css } from "@emotion/core";
import SearchIcon from "../icons/Search";

class SearchBar extends React.Component {
  componentDidMount() {
    import("docsearch.js").then(function(module) {
      module.default({
        apiKey: "2f44778ac6ae42bb4edea44efbb0b647",
        indexName: "reakit",
        inputSelector: "#docsearch-field",
        debug: true
      });

      const path = `https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css`;
      const link = document.createElement(`link`);
      link.setAttribute(`rel`, `stylesheet`);
      link.setAttribute(`type`, `text/css`);
      link.setAttribute(`href`, path);
      document.head.appendChild(link);
    });
  }

  render() {
    return (
      <>
        <label
          css={css`
            display: flex;
            align-items: center;
            border-radius: 0.2rem;
            background: #fff;
            overflow: hidden;
          `}
        >
          <span
            css={css`
              padding: 0.5em 0 0.5em 0.75em;
            `}
          >
            <SearchIcon />
          </span>
          <input
            css={css`
              margin-left: 10px;
              outline: none;
              font-family: -apple-system, system-ui, BlinkMacSystemFont,
                "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif,
                "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
              color: #dc3545;
              display: inline-block;
              padding: 0.5em 0.65em 0.5em 0.2em;
              font-size: 100%;
              border: 1px solid rgba(0, 0, 0, 0.25);
              color: #4d4d4d;
              background: transparent;
              border: none;
              transition: 0.22s all linear;

              &:focus {
                width: 500px;
                background: #fff;
                transition: 0.22s all linear;

                & ~ span {
                  display: none;
                }
              }
            `}
            type="text"
            id="docsearch-field"
            placeholder="Type to search"
          />
        </label>
      </>
    );
  }
}

export default SearchBar;
