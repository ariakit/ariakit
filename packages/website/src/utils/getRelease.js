import {
  repository,
  version as pkgVersion
} from "../../../reakit/package.json";

const version = `v${pkgVersion}`;

const url = () =>
  `https://github.com/${repository}/blob/master/packages/reakit/CHANGELOG.md`;

export default {
  url,
  version
};
