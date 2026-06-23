import { IllegalStateError } from '../resources/errors/index.js';
/**
 * Scans `source` starting at `start` (which must point at an opening `{`) and
 * returns the substring spanning that brace and its matching close. String
 * literals are tracked so that braces appearing inside strings are ignored.
 * @param source - The text to scan.
 * @param start - Index of the opening `{`.
 * @returns The balanced `{...}` substring, or `undefined` if it never closes.
 * @internal
 */
function sliceBalancedObject(source, start) {
    let depth = 0;
    let inString = false;
    let quote = '';
    let escaped = false;
    for (let i = start; i < source.length; i++) {
        const char = source[i];
        if (inString) {
            if (escaped) {
                escaped = false;
            }
            else if (char === '\\') {
                escaped = true;
            }
            else if (char === quote) {
                inString = false;
            }
            continue;
        }
        if (char === '"' || char === '\'') {
            inString = true;
            quote = char;
        }
        else if (char === '{') {
            depth += 1;
        }
        else if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                return source.slice(start, i + 1);
            }
        }
    }
    return undefined;
}
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
export function extractYtcfgConfig(html) {
    const marker = 'ytcfg.set(';
    let index = html.indexOf(marker);
    while (index !== -1) {
        const argStart = index + marker.length;
        const braceStart = html.indexOf('{', argStart);
        // Only object-argument calls qualify: the first `{` after the call must
        // come before this call's closing `)` (skips e.g. `ytcfg.set(0);`).
        if (braceStart !== -1
            && !html.slice(argStart, braceStart).includes(')')) {
            const raw = sliceBalancedObject(html, braceStart);
            if (raw != null) {
                try {
                    return JSON.parse(raw);
                }
                catch {
                    throw new IllegalStateError('ytcfg config parse failed');
                }
            }
        }
        index = html.indexOf(marker, argStart);
    }
    throw new IllegalStateError('API initialization returned a nullish value');
}
//# sourceMappingURL=ytcfg.js.map