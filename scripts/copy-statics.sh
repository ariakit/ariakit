#! /usr/bin/env bash

#########################################################################
#### Keeps changelog and readme at root in sync with packages/reakit ####
#########################################################################

for file in CHANGELOG.md README.md; do
  rootFile="${PWD}/$file"
  reakitFile="packages/reakit/$file"
  if [[ "$*" =~ $rootFile ]] && [[ "$*" =~ $reakitFile ]]; then
    # If both staged do nothing and let commit continue
    exit 0
  fi

  if [[ "$*" =~ $rootFile ]]; then
    cp "$rootFile" "$reakitFile"
    git add "$reakitFile"
  fi

  if [[ "$*" =~ $reakitFile ]]; then
    cp "$reakitFile" "$rootFile"
    git add "$rootFile"
  fi
done
