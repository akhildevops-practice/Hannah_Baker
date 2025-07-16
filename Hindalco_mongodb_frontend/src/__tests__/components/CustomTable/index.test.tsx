import CustomTable from "../../../components/CustomTable";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";

let clickSpy: () => void;
beforeAll(() => {
  clickSpy = jest.fn();
});

const dummyData: any = {
  isAction: true,
  actions: [
    {
      label: "Edit",
      icon: "icon",
      handler: () => clickSpy(),
    },
  ],
};

const dummyOrganisationData = [
  {
    orgName: "Vision Pvt Ltd",
    orgAdmin: "username1@xyz.com",
    createdAt: "22-02-2021",
    orgId: "81fe2507-abf8-4d87-b8d4-9afe0800326a",
    instanceUrl: "prodle.com/xyzpvtltd",
    isAction: {
      isDisabled: true,
    },
  },
  {
    orgName: "Vision Pvt Ltd",
    orgAdmin: "username1@xyz.com",
    createdAt: "22-02-2021",
    orgId: "81fe2507-abf8-4d87-b8d4-9afe0800326a",
    instanceUrl: "prodle.com/xyzpvtltd",
  },
  {
    orgName: "Vision Pvt Ltd",
    orgAdmin: "username1@xyz.com",
    createdAt: "22-02-2021",
    orgId: "81fe2507-abf8-4d87-b8d4-9afe0800326a",
    instanceUrl: "prodle.com/xyzpvtltd",
  },
  {
    orgName: "Vision Pvt Ltd",
    orgAdmin: "username1@xyz.com",
    createdAt: "22-02-2021",
    orgId: "81fe2507-abf8-4d87-b8d4-9afe0800326a",
    instanceUrl: "prodle.com/xyzpvtltd",
  },
  {
    orgName: "Vision Pvt Ltd",
    orgAdmin: "username1@xyz.com",
    createdAt: "22-02-2021",
    orgId: "81fe2507-abf8-4d87-b8d4-9afe0800326a",
    instanceUrl: "prodle.com/xyzpvtltd",
  },
];

const dummyHeadersData = [
  "Organization Name",
  "Organization Admin",
  "Created Date",
  "Org ID/Tenant ID",
  "Instance URL",
];

const dummyFieldsData = [
  "orgName",
  "orgAdmin",
  "createdAt",
  "orgId",
  "instanceUrl",
];

describe("<CustomTable /> component tests ->", () => {
  test("should render <CustomTable /> component", () => {
    const { container } = render(
      <CustomTable
        header={dummyHeadersData}
        fields={dummyFieldsData}
        data={dummyOrganisationData}
        isAction={dummyData.isAction}
        actions={dummyData.actions}
      />
    );
    expect(container).toBeInTheDocument();
  });

  test("should call handler function on action item click", () => {
    let actionPopper: any;
    let actionItem: any;
    const container = render(
      <CustomTable
        header={dummyHeadersData}
        fields={dummyFieldsData}
        data={dummyOrganisationData}
        isAction={dummyData.isAction}
        actions={dummyData.actions}
      />
    );
    actionPopper = screen.queryAllByTestId("action-popper");
    fireEvent.click(actionPopper[1]);
    actionItem = screen.queryAllByTestId("action-item");
    fireEvent.click(actionItem[0]);
    expect(clickSpy).toBeCalled();
  });
});
