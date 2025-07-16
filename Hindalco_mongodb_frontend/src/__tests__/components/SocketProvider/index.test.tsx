import React from "react";
import { SocketProvider } from "../../../components/SocketProvider/index";
import { render, fireEvent, screen } from "@testing-library/react";

describe("<SocketProvider /> component tests -> ", () => {
  test("should render <SocketProvider /> component", () => {
    const { container } = render(
      <SocketProvider>
        <div>Child node</div>
      </SocketProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
