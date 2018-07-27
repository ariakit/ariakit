import { repository, version as pkgVersion } from "../../../package.json"

const version = `v${pkgVersion}`;

const url = () => `https://github.com/${repository}/releases/tag/${version}`;

export default {
  url,
  version
}
