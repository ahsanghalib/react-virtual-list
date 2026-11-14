import { IStyledVirtualListProps, Scroller } from "./styled";
import memoizeOne from "memoize-one";
import {
  Dispatch,
  Ref,
  ReactNode,
  SetStateAction,
  UIEvent,
  forwardRef,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createDetectElementResize,
  getHeightsAndOffsets,
  search,
} from "./utils";

export interface IVirtualListProps extends IStyledVirtualListProps {
  children?: ReactNode[];
  testid?: string;
  scrollToIndex?: number;
  onVisibleIndexes?: (indexes: {
    startIndex: number;
    stopIndex: number;
  }) => void;
  getOffsetValue?: (start: number) => void;
  updateScroll?: boolean;
}

export const VirtualList = memo(
  ({
    children,
    scrollToIndex,
    onVisibleIndexes,
    getOffsetValue,
    updateScroll,
    testid,
  }: IVirtualListProps) => {
    const [
      { height: containerHeight, width: containerWidth },
      setContainerSize,
    ] = useState({
      height: 0,
      width: 0,
    });
    const [visibileIndexes, setVisibileIndexes] = useState<number[]>([]);

    const ref = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /* c8 ignore start */
    const observerRef = useRef<IntersectionObserver>(
      new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
          const intersectingIdx = entries.reduce(
            (a: number[], c: IntersectionObserverEntry) =>
              c.isIntersecting
                ? [...a, parseInt(c.target.id.split("_")[1])]
                : [...a],
            [],
          );
          if (typeof onVisibleIndexes === "function") {
            onVisibleIndexes({
              startIndex: intersectingIdx[0] || 0,
              stopIndex: intersectingIdx[intersectingIdx.length - 1] || 0,
            });
          }
        },
        {
          root: null,
          rootMargin: "0px",
          threshold: 0.4,
        },
      ),
    );
    /* c8 ignore stop */

    const nodes = children?.length ? [...children] : [];
    const totalItems = nodes.length;

    const {
      offsets: nodeOffsets,
      totalHeight,
      avgHeight,
    } = getHeightsAndOffsets(nodes);

    const updateVisibleIndexes = memoizeOne((start: number) => {
      if (totalItems) {
        if (timerRef.current) clearTimeout(timerRef.current);
        observerRef.current.disconnect();
        const screenItemsLen = Math.ceil(containerHeight / avgHeight);
        const maxBuffer = screenItemsLen * 3;
        const idx = search(nodeOffsets, start);
        const first = idx - 5 <= 0 ? 0 : idx - 5;
        const last =
          idx + maxBuffer >= totalItems ? totalItems : idx + maxBuffer;
        const indexes = Array.from(
          { length: last - first },
          (_, i) => i + first,
        );
        setVisibileIndexes(indexes);
        if (typeof getOffsetValue === "function") getOffsetValue(start);

        /* c8 ignore start */
        timerRef.current = setTimeout(() => {
          indexes.forEach((v, i) => {
            const elem = document.getElementById(`virtual_${v}_${i}`);
            if (elem) observerRef.current.observe(elem);
            if (timerRef.current) clearTimeout(timerRef.current);
          });
        }, 50);
        /* c8 ignore stop */
      }
    });

    const onScroll = (e: UIEvent<HTMLDivElement>) => {
      const { scrollTop } = e.target as HTMLDivElement;
      updateVisibleIndexes(scrollTop);
      e.preventDefault();
    };

    useEffect(() => {
      let start = 0;
      if (ref.current) start = ref.current.scrollTop;
      if (typeof scrollToIndex === "number") {
        const offset = nodeOffsets[scrollToIndex];

        if (ref.current) {
          ref.current.scrollTo({
            top: offset,
            left: 0,
            behavior: "auto",
          });
        }
      }
      updateVisibleIndexes(start);
    }, [containerHeight, containerWidth, scrollToIndex, updateScroll]);

    useEffect(
      () => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        observerRef.current.disconnect();
      },
      [],
    );

    return (
      <Sizer setContainerSize={setContainerSize} data-testid={testid}>
        <Container onScroll={onScroll} ref={ref}>
          <Scroller
            height={`${totalHeight}px`}
            data-testid="virtual_scroller"
            id="virtual_scroller"
          />
          {!!totalItems &&
            visibileIndexes &&
            !!visibileIndexes.length &&
            visibileIndexes.map((v, i) => (
              <div
                key={`virtual_${v}`}
                id={`virtual_${v}_${i}`}
                data-testid="virtual_row"
                style={{
                  margin: 0,
                  padding: 0,
                  height: "auto",
                  position: "absolute",
                  width: "100%",
                  top: `${nodeOffsets[v]}px`,
                }}
              >
                {nodes[v]}
              </div>
            ))}
        </Container>
      </Sizer>
    );
  },
);

interface ContainerSize {
  height: number;
  width: number;
}

interface SizerProps {
  children: ReactNode;
  setContainerSize: Dispatch<SetStateAction<ContainerSize>>;
}

const Sizer = ({ children, setContainerSize }: SizerProps) => {
  const ref = useRef<any>(null);
  const [state, setState] = useState<ContainerSize>({ height: 0, width: 0 });

  useEffect(() => {
    const _parentNode = ref.current.parentNode;
    const _window = ref.current.parentNode.ownerDocument.defaultView;

    const calculateNewSize = () => {
      if (_parentNode) {
        const win = _window || window;
        const style = win.getComputedStyle(_parentNode);
        const height = _parentNode.offsetHeight || 300;
        const width = _parentNode.offsetWidth || 300;
        const paddingLeft = parseInt(style.paddingLeft, 10) || 0;
        const paddingRight = parseInt(style.paddingRight, 10) || 0;
        const paddingTop = parseInt(style.paddingTop, 10) || 0;
        const paddingBottom = parseInt(style.paddingBottom, 10) || 0;
        const newHeight = height - paddingTop - paddingBottom;
        const newWidth = width - paddingLeft - paddingRight;
        return { height: newHeight, width: newWidth };
      }
      return null;
    };

    const onResize = () => {
      const newSize = calculateNewSize();
      if (
        newSize &&
        (state.height !== newSize.height || state.width !== newSize.width)
      ) {
        setState(newSize);
        setContainerSize(newSize);
      }
    };

    const _detectElementResize = createDetectElementResize(null);
    _detectElementResize.addResizeListener(_parentNode, onResize);
    onResize();

    return () => {
      if (_detectElementResize && _parentNode) {
        _detectElementResize.removeResizeListener(_parentNode, onResize);
      }
    };
  }, []);

  return (
    <div
      style={{ overflow: "visible", height: 0, width: 0 }}
      id="auto_resizer"
      data-testid="auto_resizer"
      ref={ref}
    >
      <div
        style={{
          width: `${state.width}px`,
          height: `${state.height}px`,
          boxSizing: "border-box",
          position: "relative",
          willChange: "transform",
          overflow: "auto",
        }}
        data-testid="auto_resizer_height"
      >
        {children}
      </div>
    </div>
  );
};

interface ContainerProps {
  children: ReactNode;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, onScroll }, ref: Ref<HTMLDivElement>) => (
    <div
      ref={ref}
      onScroll={onScroll}
      data-testid="virtual_container"
      id="virtual_container"
      style={{
        overflow: "auto",
        position: "relative",
        boxSizing: "border-box",
        padding: 0,
        height: "100%",
        width: "100%",
      }}
    >
      {children}
    </div>
  ),
);
