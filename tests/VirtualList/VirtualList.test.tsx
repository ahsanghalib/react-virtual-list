import { fireEvent, render, screen } from "../utils";
import React from "react";
import {
  IVirtualListProps,
  VirtualList,
} from "../../src/VirtualList/VirtualList";

describe("VirtualList - tests", () => {
  const headers = [0, 17, 30, 57, 68, 106, 131, 135, 141, 148, 166, 170, 200];
  const data: any = [];

  Array.from({ length: 500 }, (_, idx) => {
    if (headers.indexOf(idx) !== -1) {
      data.push("HEADER");
    } else {
      data.push({
        channelName: "channelName",
      });
    }
    return true;
  });

  interface Props {
    idx: any;
    data: string | { channelName: string };
    height: string | number;
  }

  const Row: React.FC<Props> = ({ idx, data, height }) => (
    <div
      style={{
        display: "flex",
        padding: "0.5rem",
        margin: 0,
        flexDirection: "row",
        height: `${height}px`,
        flexWrap: "wrap",
        gap: "1rem",
        alignItems: "center",
        justifyContent: !!(typeof data === "string") ? "center" : "flex-start",
        color: !!(typeof data === "string") ? "white" : "inherit",
        fontWeight: !!(typeof data === "string") ? "bolder" : "inherit",
        boxSizing: "border-box",
        backgroundColor: !!(typeof data === "string")
          ? "blue"
          : !!(idx % 2)
            ? "#ccc"
            : "white",
      }}
    >
      {typeof data === "string" ? (
        <div>{data}</div>
      ) : (
        <>
          <div>{idx}</div>
          <div>{data.channelName}</div>
        </>
      )}
    </div>
  );

  function mockOffsetSize(width: any, height: any) {
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      value: height,
      writable: true,
    });
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      value: width,
      writable: true,
    });
  }

  function getMockUp({ ...props }: IVirtualListProps) {
    mockOffsetSize(200, 200);

    return (
      <div>
        <VirtualList {...props}>
          {data.map((v: any, idx: React.Key | null | undefined) => (
            <Row
              key={idx}
              idx={idx}
              data={v}
              height={!!(typeof v === "string") ? "50" : "80"}
            />
          ))}
        </VirtualList>
      </div>
    );
  }

  it("render empty", async () => {
    render(<VirtualList />);
    expect(await screen.findByTestId("auto_resizer")).toBeInTheDocument();
    expect(
      await screen.findByTestId("auto_resizer_height"),
    ).toBeInTheDocument();
    expect(await screen.findByTestId("virtual_container")).toBeInTheDocument();
    expect(await screen.findByTestId("virtual_scroller")).toBeInTheDocument();
    expect(screen.queryByTestId("virtual_row")).not.toBeInTheDocument();
  });

  it("render data", async () => {
    render(getMockUp({}));

    expect(await screen.findByTestId("auto_resizer")).toBeInTheDocument();
    expect(
      await screen.findByTestId("auto_resizer_height"),
    ).toBeInTheDocument();
    expect(await screen.findByTestId("virtual_container")).toBeInTheDocument();
    expect(await screen.findByTestId("virtual_scroller")).toBeInTheDocument();
    expect(
      (await screen.findAllByTestId("virtual_row")).length,
    ).toBeGreaterThan(0);
    expect((await screen.findAllByTestId("virtual_row")).length).toBeLessThan(
      data.length,
    );
  });

  it("reports the scroll offset after scrolling", () => {
    const getOffsetValue = vi.fn();
    render(getMockUp({ getOffsetValue }));
    const container = screen.getByTestId("virtual_container");
    container.scrollTop = 50;
    fireEvent.scroll(container);
    expect(getOffsetValue).toHaveBeenLastCalledWith(50);
  });

  it("scrolls to the specified index", () => {
    render(getMockUp({ scrollToIndex: 1 }));
    const container = screen.getByTestId("virtual_container");
    expect(container.scrollTop).toBe(50);
  });

  it("first index should be render correctly", () => {
    const _data: any = [];
    const _index = 40;

    Array.from({ length: 50 }, (_, idx) => {
      if (headers.indexOf(idx) !== -1) {
        _data.push("HEADER");
      } else {
        _data.push({
          channelName: "channelName",
        });
      }
      return true;
    });

    render(
      <VirtualList scrollToIndex={_index}>
        {_data.map((v: any, idx: React.Key | null | undefined) => (
          <Row
            key={idx}
            idx={idx}
            data={v}
            height={!!(typeof v === "string") ? "50" : "80"}
          />
        ))}
      </VirtualList>,
    );

    const container = screen.getByTestId("virtual_container");
    const firstRow = container.childNodes[1];
    expect(firstRow).toHaveTextContent(`${_index - 5}`);
  });

  it("getOffsetValue function is called correctly", () => {
    const getOffsetValueMock = vi.fn();
    render(getMockUp({ getOffsetValue: getOffsetValueMock }));
    expect(getOffsetValueMock).toHaveBeenCalled();
  });
});
