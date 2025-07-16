import React from "react";
import CustomPopover from "../../../components/CustomPopover";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import {RecoilRoot} from "recoil";
import * as Recoil from "recoil";

// const mockNotifications: any = 
// {
//         today: [
//         {
//             id: "c6c53647-2266-405e-978d-bf5c625f4141",
//             type: "document",
//             text: "Mintu Auditor has published document- JinMinDoc ",
//             content: "7e01af02-90ac-4823-9106-7b2fdf8bd7c9",
//             receiver: "b459e8a7-181b-431c-90d6-79599ab067dc",
//             creator: "b11d6388-1973-46fd-b11a-36663f016ab7",
//             date: "2022-08-22T09:51:23.672Z",
//             style: "primary",
//             read: true
//         },
//         {
//             id: "695d70e5-3787-4e67-a777-ef153d00b71e",
//             type: "document",
//             text: "Mintu Auditor has published document- new document ",
//             content: "ff0df3ea-2e49-4e6c-8cd7-377997d8b6d1",
//             receiver: "b459e8a7-181b-431c-90d6-79599ab067dc",
//             creator: "b11d6388-1973-46fd-b11a-36663f016ab7",
//             date: "2022-08-22T06:14:49.256Z",
//             style: "primary",
//             read: false
//         }
//     ],
//     yesterday: [
//         {
//             id: "c6c53647-2266-405e-978d-bf5c625f4141",
//             type: "document",
//             text: "Mintu Auditor has published document- JinMinDoc ",
//             content: "7e01af02-90ac-4823-9106-7b2fdf8bd7c9",
//             receiver: "b459e8a7-181b-431c-90d6-79599ab067dc",
//             creator: "b11d6388-1973-46fd-b11a-36663f016ab7",
//             date: "2022-08-22T09:51:23.672Z",
//             style: "primary",
//             read: true
//         },
//         {
//             id: "695d70e5-3787-4e67-a777-ef153d00b71e",
//             type: "document",
//             text: "Mintu Auditor has published document- new document ",
//             content: "ff0df3ea-2e49-4e6c-8cd7-377997d8b6d1",
//             receiver: "b459e8a7-181b-431c-90d6-79599ab067dc",
//             creator: "b11d6388-1973-46fd-b11a-36663f016ab7",
//             date: "2022-08-22T06:14:49.256Z",
//             style: "primary",
//             read: false
//         }
//     ],
//     older: [
//         {
//             id: "c6c53647-2266-405e-978d-bf5c625f4141",
//             type: "document",
//             text: "Mintu Auditor has published document- JinMinDoc ",
//             content: "7e01af02-90ac-4823-9106-7b2fdf8bd7c9",
//             receiver: "b459e8a7-181b-431c-90d6-79599ab067dc",
//             creator: "b11d6388-1973-46fd-b11a-36663f016ab7",
//             date: "2022-08-22T09:51:23.672Z",
//             style: "primary",
//             read: true
//         },
//         {
//             id: "695d70e5-3787-4e67-a777-ef153d00b71e",
//             type: "document",
//             text: "Mintu Auditor has published document- new document ",
//             content: "ff0df3ea-2e49-4e6c-8cd7-377997d8b6d1",
//             receiver: "b459e8a7-181b-431c-90d6-79599ab067dc",
//             creator: "b11d6388-1973-46fd-b11a-36663f016ab7",
//             date: "2022-08-22T06:14:49.256Z",
//             style: "primary",
//             read: false
//         }
//     ],
//     unreadCount: 1,
// }

const mockNotifications: any = [
   { today: [],
    yesterday: [],
    older: [],
    unreadCount: 0,}
];


jest.mock("recoil", () => ({
    ...(jest.requireActual("recoil") as any),
    useRecoilState: () => mockNotifications
  }));

describe("<CustomPopover /> component tests -> ", () => {
    test("should render <CustomPopover /> component", () => {
        const {container} = render(
            <RecoilRoot>
            <CustomPopover>
            <div>Child Node</div>
          </CustomPopover>
          </RecoilRoot>
        )
        expect(container).toBeInTheDocument();

    })
})