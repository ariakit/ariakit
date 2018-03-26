import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import debounce from 'lodash/debounce'
import { compose, setPropTypes, getContext, lifecycle } from 'recompose'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/mode/jsx/jsx'
import 'codemirror/lib/codemirror.css'
import 'codemirror-one-dark-theme/one-dark.css'
import as from '../../src'

const StyledCodeMirror = styled(CodeMirror)`
  .CodeMirror {
    font-family: 'Fira Code', monospace;
    line-height: 150%;
    background-color: rgb(40, 44, 52);
    padding: 8px;
    height: auto;

    .CodeMirror-lines {
      font-size: 16px;
      font-weight: 400;

      @media screen and (max-width: 640px) {
        font-size: 14px;
      }
    }
  }
`

const handleChange = onChange =>
  debounce((editor, metadata, newCode) => {
    onChange(newCode)
  }, 10)

const Editor = ({ code, onChange, config, options, ...props }) => (
  <StyledCodeMirror
    value={code}
    onChange={handleChange(onChange)}
    options={{ ...config.editorConfig, theme: 'one-dark', ...options }}
    {...props}
  />
)

const enhance = compose(
  as('div'),
  setPropTypes({
    code: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    options: PropTypes.object,
  }),
  getContext({
    config: PropTypes.object.isRequired,
  }),
  lifecycle({
    shouldComponentUpdate() {
      return false
    },
  }),
)

export default enhance(Editor)
