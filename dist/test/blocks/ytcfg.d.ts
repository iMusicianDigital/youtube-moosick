import type { YtCfgMain } from '../resources/etc/cfgInterface.js';
/**
 * Extracts the first `ytcfg.set({ ... })` config object from YouTube Music
 * homepage HTML.
 *
 * YouTube emits several `ytcfg.set(...)` calls — some with non-object arguments
 * and frequently several on a single line — so the previous greedy
 * `/(?<=ytcfg\.set\().+(?=\);)/` regex over-matched (a `);` can appear inside a
 * string in the ~62 KB config) and broke `JSON.parse`. This locates the first
 * `ytcfg.set(` whose argument is an object literal and returns it by matching
 * brace depth, ignoring braces inside string literals.
 *
 * @param html - Raw homepage HTML returned by `GET /`.
 * @returns The parsed first ytcfg config object.
 * @throws IllegalStateError - if no object config is present, or it fails to parse.
 * @internal
 */
export declare function extractYtcfgConfig(html: string): YtCfgMain;
//# sourceMappingURL=ytcfg.d.ts.map