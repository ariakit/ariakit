import { repository, version as pkgVersion } from "../../../package.json";

const version = `v${pkgVersion}`;

const url = () => `https://github.com/${repository}/blob/master/CHANGELOG.md`;

export default {
  url,
  version
};
