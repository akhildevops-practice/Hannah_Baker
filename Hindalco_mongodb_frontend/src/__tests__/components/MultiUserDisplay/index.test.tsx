import MultiUserDisplay from "../../../components/MultiUserDisplay";
import { render } from "@testing-library/react";

const dummyData = [
  {
    name: "Random User",
    assignedRole: [{
      role: "testRole"
    }]
  },
  {
    name: "Random User Two",
    assignedRole: [{
      role: "testRole"
    }]
  }
]

describe("<MultiUserDisplay /> component tests -> ", () => {
  test("should render <MultiUserDisplay /> component", () => {
    const { container } = render(<MultiUserDisplay name="name" data={dummyData} secondaryData={false} />);
    expect(container).toBeInTheDocument();
  });

  test("should render the <MultiUserDisplay /> component when secondary data is true", () => {
    const {container} = render(<MultiUserDisplay name="name" data={dummyData} secondaryData={true} />);
    expect(container).toBeInTheDocument(); 
  })
});
