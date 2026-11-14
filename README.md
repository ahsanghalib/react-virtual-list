# React Virtual List

`@ahsanizhar/react-virtual-list` is a virtualized list component for React. It
renders the rows around the current scroll position and keeps the full list
height for scrolling.

## Install

```sh
npm install @ahsanizhar/react-virtual-list react styled-components
```

React 18 or newer and styled-components 5.3 or newer are peer dependencies.

## Usage

Give the list a parent with a set height. Each direct child must have a numeric
or pixel-string `height` prop; the value is used to position the row.

```tsx
import { VirtualList } from "@ahsanizhar/react-virtual-list";
import type { ReactNode } from "react";

function Row({ height, children }: { height: number; children: ReactNode }) {
  return <div style={{ height }}>{children}</div>;
}

const rows = Array.from({ length: 1000 }, (_, index) => ({
  id: index,
  label: `Row ${index + 1}`,
}));

export function Example() {
  return (
    <div style={{ height: 400 }}>
      <VirtualList>
        {rows.map((row) => (
          <Row key={row.id} height={48}>
            {row.label}
          </Row>
        ))}
      </VirtualList>
    </div>
  );
}
```

## API

| Prop               | Type                                                           | Description                                                             |
| ------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `children`         | `ReactNode[]`                                                  | Rows to render. Each row needs a numeric or pixel-string `height` prop. |
| `height`           | `CSSProperties["height"]`                                      | Accepted by the current type; it does not set the viewport height.      |
| `scrollToIndex`    | `number`                                                       | Scroll to this zero-based row index when set or changed.                |
| `onVisibleIndexes` | `(indexes: { startIndex: number; stopIndex: number }) => void` | Called with the first and last observed row indexes.                    |
| `getOffsetValue`   | `(scrollTop: number) => void`                                  | Called with the scroll position when visible rows are recalculated.     |
| `updateScroll`     | `boolean`                                                      | Changing this value recalculates the visible rows and scroll position.  |
| `testid`           | `string`                                                       | Sets the `data-testid` attribute on the list sizer.                     |

The component uses browser layout APIs and `IntersectionObserver`; use it in a
browser environment that supports `IntersectionObserver`. Give the parent a
fixed or otherwise constrained height to create a scrollable viewport. The
`height` prop on `VirtualList` currently does not set that height.

## jsDelivr

After publishing, import a specific published version from jsDelivr's ESM
endpoint:

```js
import { VirtualList } from "https://cdn.jsdelivr.net/npm/@ahsanizhar/react-virtual-list@0.1.0/+esm";
```

Replace `0.1.0` with the version you want to use. The consuming page must also
provide React and styled-components.
