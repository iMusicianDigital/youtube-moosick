import test from 'tape';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { extractYtcfgConfig } from '../../../blocks/ytcfg.js';
import { IllegalStateError } from '../../../resources/errors/index.js';
// Loaded via fs (not a JSON import assertion) so the test is not coupled to a
// particular Node import-assertion syntax (`assert` vs `with`).
const ytcfgHomepage = JSON.parse(readFileSync(fileURLToPath(new URL('../../dummy/ytcfgHomepage.json', import.meta.url)), 'utf8'));
// YMOO-1 reproduction: several `ytcfg.set(...)` calls on ONE line — a
// non-object call first, then two object calls, each containing a literal `);`
// inside a string. The old greedy `/(?<=ytcfg\.set\().+(?=\);)/` over-matched
// this and broke `JSON.parse`.
const multiCallOneLine = '<script>ytcfg.set(0); ytcfg.set({"INNERTUBE_API_KEY":"abc","note":"has ); inside"}); ytcfg.set({"OTHER":"second );"});</script>';
const noConfig = '<html><body>no ytcfg here</body></html>';
test('extractYtcfgConfig (YMOO-1): extracts exactly the first config object from one-line multi-call HTML', (t) => {
    const config = extractYtcfgConfig(multiCallOneLine);
    t.equal(config.INNERTUBE_API_KEY, 'abc', 'returns the first ytcfg object, not an over-matched span');
    t.equal(config.OTHER, undefined, 'does not bleed into the later ytcfg.set call');
    t.end();
});
test('extractYtcfgConfig (YMOO-1): parses real captured YouTube homepage HTML', (t) => {
    const config = extractYtcfgConfig(ytcfgHomepage.html);
    t.ok(typeof config.INNERTUBE_API_KEY === 'string', 'real homepage HTML yields a usable config object');
    t.end();
});
test('extractYtcfgConfig (YMOO-2): throws a typed IllegalStateError when no config is present', (t) => {
    t.throws(() => extractYtcfgConfig(noConfig), IllegalStateError, 'throws IllegalStateError rather than a raw SyntaxError');
    t.end();
});
//# sourceMappingURL=unit_ytcfgExtraction.js.map