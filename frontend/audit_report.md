The root cause of the scrolling truncation has been identified.

### Root Cause
The page is terminating the scroll boundary early due to a known iOS Safari rendering bug involving flexbox containers with viewport-based minimum heights.

### Exact Element
The container responsible is:
**`.bg-page-wrapper`**

### Exact CSS Rules
The problematic rules applied to `.bg-page-wrapper` in `global.css` (lines 1504-1507) are:
```css
min-height: 100vh;
display: flex;
flex-direction: column;
```

### Explanation of the Failure
1. **Visible content height > scrollable height**: The first parent where this occurs is `.bg-page-wrapper`.
2. **Mechanism**: In iOS Safari, when a container uses `display: flex` with `flex-direction: column` and `min-height: 100vh`, the browser calculates its contribution to the document's `scrollHeight` as exactly `100vh`, even if its children (like `.content-relative`) overflow that height. 
3. **The Result**: The visual content renders correctly out of the container (which is why the page "looks" taller), but the `html`/`body` scroll boundary terminates exactly at 100vh + the parent's padding (`.layout__main`'s padding).
4. **Question 3 Status**: The later questions (Question 3 and beyond) are simply rendered below the browser's incorrectly computed scroll boundary. They are not `overflow: hidden`, but the browser refuses to scroll to them.

### Solution
`.bg-page-wrapper` does not require flexbox since its background layers (`.bg-image`, `.bg-overlay`) are fixed, and its only in-flow child is `.content-relative`. Removing `display: flex;` and `flex-direction: column;` from `.bg-page-wrapper` will restore standard block layout behavior, forcing Safari to correctly expand the document's `scrollHeight` to the full height of the content.
