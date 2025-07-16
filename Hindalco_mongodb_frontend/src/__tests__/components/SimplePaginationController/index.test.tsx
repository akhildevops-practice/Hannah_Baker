import { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SimplePaginationController from "../../../components/SimplePaginationController";

const handleChangeSpy = jest.fn();

describe("<SimplePaginationController /> component tests ->", () => {
  jest.mock("react-router-dom", () => ({
    ...(jest.requireActual("react-router-dom") as any),
    useNavigate: () => "redirect-url",
    useHref: () => "abc",
    BrowserRouter: ({ children }: { children: ReactNode }) => <>{children}</>,
    Route: ({ children }: { children: ReactNode }) => <>{children}</>,
  }));
  test("should render <SimplePaginationController /> component", () => {
    const { container } = render(
      <SimplePaginationController
        count={4}
        page={1}
        rowsPerPage={4}
        handleChangePage={handleChangeSpy}
      />
    );
    expect(container).toBeInTheDocument();
  });

  test("should invoke handleChange function when next button is clicked in pagination component", () => {
    const { container } = render(
      <SimplePaginationController
        count={5}
        page={1}
        rowsPerPage={4}
        handleChangePage={handleChangeSpy}
      />
    );

    let nextButton: any = screen.queryByTestId("pagination-button-next");
    fireEvent.click(nextButton);
    expect(handleChangeSpy).toBeCalled();
  });

  test("should invoke handleChange function when previous button is clicked in pagination component", () => {
    const { container } = render(
      <SimplePaginationController
        count={5}
        page={2}
        rowsPerPage={4}
        handleChangePage={handleChangeSpy}
      />
    );
    let previousButton: any = screen.queryByTestId(
      "pagination-button-previous"
    );
    fireEvent.click(previousButton);
    expect(handleChangeSpy).toBeCalled();
  });

  test("should invoke handleChange function when first page button is clicked in pagination component", () => {
    const { container } = render(
      <SimplePaginationController
        count={5}
        page={2}
        rowsPerPage={4}
        handleChangePage={handleChangeSpy}
      />
    );
    let firstPageButton: any = screen.queryByTestId("pagination-button-first");
    fireEvent.click(firstPageButton);
    expect(handleChangeSpy).toBeCalled();
  });

  test("should invoke handleChange function when last page button is clicked in pagination component", () => {
    const { container } = render(
      <SimplePaginationController
        count={5}
        page={1}
        rowsPerPage={4}
        handleChangePage={handleChangeSpy}
      />
    );
    let lastPageButton: any = screen.queryByTestId("pagination-button-last");
    fireEvent.click(lastPageButton);
    expect(handleChangeSpy).toBeCalled();
  });
});
