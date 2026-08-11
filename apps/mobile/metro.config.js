// Monorepo Metro config — see https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
// Deliberately NOT setting disableHierarchicalLookup: true. It's a common
// monorepo recipe, but it breaks resolution of packages nested inside
// another package's own node_modules (e.g. react-native's private copy of
// regenerator-runtime) because it restricts lookup to only the two paths
// above. Standard hierarchical lookup already checks both those paths (as
// ancestors of any file under workspaceRoot) *and* nested node_modules —
// there's no real tradeoff here, only upside.

module.exports = config;
