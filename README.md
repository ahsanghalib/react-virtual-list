# react-virtual-list

A React component for rendering long lists efficiently by mounting a window of
rows around the current scroll position.

The component source is in [`VirtualList/VirtualList.tsx`](VirtualList/VirtualList.tsx).
Pass each child a `height` prop so the list can calculate its position.
