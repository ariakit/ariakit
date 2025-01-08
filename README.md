gh release create @sample-test/core@0.6.2 --generate-notes --latest
gh release create @<package-root>/<package-name>@<version> --generate-notes --latest

https://github.com/ShreyDhyani/packaging-sample/compare/@sample-test/react-core@0.6.1...@sample-test/core@0.6.2

Tags mismatch as it is comparing with @sample-test/react-core@0.6.1 instead of @sample-test/core@0.6.1

Can we give a tag to start with using --notes-start-tag?

gh release create @sample-test/core@0.6.2 --notes-start-tag @sample-test/core@0.6.1 --generate-notes

Another method is to create Notes would be:

- To create notes in a temp file
  git log --oneline @sample-test/react-core@0.6.1..HEAD >> release-notes.md -- ./packages/<package_name>
- Pass that file to release notes with tag
  gh release create @sample-test/core@0.6.2 --notes-file release-notes.md
