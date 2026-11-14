# react-virtual-list

A React and TypeScript component for rendering long lists efficiently by
mounting a window of rows around the current scroll position.

## Install

```sh
npm install @ahsanizhar/react-virtual-list
```

## Use

```tsx
import { VirtualList } from "@ahsanizhar/react-virtual-list";
import type { ReactNode } from "react";

function Row({ height, children }: { height: number; children: ReactNode }) {
  return <div style={{ height }}>{children}</div>;
}

export function Example() {
  return (
    <VirtualList>
      <Row height={48}>First row</Row>
      <Row height={48}>Second row</Row>
    </VirtualList>
  );
}
```

Each child needs a numeric or string `height` prop so the list can calculate its
position.

For jsDelivr, import the ESM package using a published version:

```js
import { VirtualList } from "https://cdn.jsdelivr.net/npm/@ahsanizhar/react-virtual-list@VERSION/+esm";
```
