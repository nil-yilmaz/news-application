import React from "react";
import { render } from "@testing-library/react";
import { useFetch } from "./hooks/useFetch";
import App from "./App";

const useFetchMock = useFetch as jest.Mock;
jest.mock("./hooks/useFetch", () => ({ useFetch: jest.fn() }));

it("should render error", () => {
  useFetchMock.mockReturnValue({ response: null, error: "Custom error", isLoading: false });
  const { queryByText } = render(<App />);
  expect(queryByText("Custom error")).toBeTruthy();
});

it("should render feed list", () => {
  useFetchMock.mockReturnValue({
    feed: { title: "Feed Title" },
    items: [
      { guid: "111", title: "Item 1", pubDate: "2020-01-01" },
      { guid: "222", title: "Item 2", pubDate: "2020-01-02" },
    ],
  });
  const { queryByText, queryByRole } = render(<App />);
  expect(queryByText("Feed Title")).toBeTruthy();
  expect(queryByText("Item 1")).toBeTruthy();
  expect(queryByRole("list")?.children).toHaveLength(2);
});
