import DisplayAdded from "../../../components/DisplayAdded";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@material-ui/core";
import { theme } from "../../../theme/index";

const dummyData = [
  "abc@gmail.com",
  "123@gmail.com",
  "890@gmail.com",
  "ms@outlook.com",
  "nimishbhardwaj@1234@gmail.com",
];

let clickSpy = jest.fn();

describe("<DisplayAdded /> component tests -> ", () => {
  test("should render <DisplayAdded /> component", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <DisplayAdded
          setEdit={jest.fn()}
          addedUsers={dummyData}
          title="Organization Admin Added"
          handleDelete={clickSpy}
        />
      </ThemeProvider>
    );
    expect(container).toBeInTheDocument();
  });
});
