# Reakit Codemods

Every package has breaking changes from one version to another and in order to ease those changes, we introduce a package which automates the task of refactoring your codebase and apply those changes.

For each breaking change version a new transformation is going to be created and make available for you all!

## Installation

`yarn add -D reakit-codemods` or `npm i -D reakit-codemods`.

## Usage
If you had installed it locally:

`reakit-codemods <transformationName> <path/to/file/or/folder>`

If you wan't to use it "without" installing:

`npx reakit-codemods <transformationName> <path/to/file/or/folder>`


## Available transformations
* `v016` -> remove `as` and replace with `use`, more [here](https://github.com/reakit/reakit/pull/274)
