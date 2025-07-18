import React, { useEffect, useState } from "react";
import FileViewer from "react-file-viewer";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import axios from "apis/axios.global";
import { API_LINK } from "config";
import { useSnackbar } from "notistack";
import { useMediaQuery } from "@material-ui/core";
import VisibilityIcon from '@material-ui/icons/Visibility';

function DocumentViewer({ fileLink }) {
  const { enqueueSnackbar } = useSnackbar();
  const appUrl = process.env.REACT_APP_REDIRECT_URL;
  let url, docs, filePath, fileType;
  const [viewerURL, setViewerURL] = useState(null);
  const matches = useMediaQuery("(min-width:786px)");

  const handleRightClick = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    const fetchViewerURL = async () => {
      try {
        if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
          const response = await axios.post(
            `${API_LINK}/api/documents/viewerOBJ`,
            { documentLink: fileLink }
          );
          const fetchedViewerURL = response.data;
          setViewerURL(fetchedViewerURL);
        }
      } catch (error) {
        enqueueSnackbar("Error in Fetching Document", {
          variant: "error",
        });
      }
    };
    fetchViewerURL();
  }, [fileLink]);

  if (process.env.REACT_APP_IS_OBJECT_STORAGE === "true") {
    url = viewerURL;
    docs = [
      {
        uri: url,
      },
    ];
    filePath = docs[0].uri;
    fileType = viewerURL?.split(".").pop();
  } else {
    if (appUrl.includes("localhost") || appUrl.includes("goprodle")) {
      url =
        `${process.env.REACT_APP_API_URL}/proxy/pdf?url=` +
        encodeURIComponent(fileLink);

      docs =
        `${process.env.REACT_APP_API_URL}/proxy/pdf?url=` +
        encodeURIComponent(fileLink);

      filePath = docs;
    } else {
      url = fileLink;

      docs = [
        {
          uri: url,
        },
      ];
      filePath = docs[0].uri;
    }
    fileType = fileLink?.split(".").pop();
  }

  if (fileType === "pdf") {
    const docs = [
      {
        uri: url,
      },
    ];
    return (
      <div style={{ height: matches ? 800 : "auto", overflowY: "scroll" }}>
        <DocViewer
          documents={docs}
          pluginRenderers={DocViewerRenderers}
          config={{
            header: {
              disableFileName: true,
              disableHeader: true,
            },
          }}
        />
      </div>
    );
  }

  const supportedfiles = [
    "png",
    "jpeg",
    "jpg",
    "docx",
    "bmp",
    "tif",
    "tiff",
    "webp",
    "xslx",
    "Video",
    "Audio",
    "csv",
  ];
  if (supportedfiles.includes(fileType)) {
    return (
      <div style={{ height: matches ? 800 : "auto", overflowY: "scroll" }}
        onContextMenu={handleRightClick}
        onCopy={handleRightClick}
      >
        <FileViewer fileType={fileType} filePath={filePath} />
      </div>
    );
  } else {
    return (
      <div style={{ height: matches ? 800 : "auto", overflowY: "scroll" }}>
        {/* <p>{`Not Supported File Type: ${fileType}`}</p> */}
        <p style={{ whiteSpace: 'pre' }}>Click on           to view the file ({`${fileType||""}`})</p>
        <div style={{
          position : "relative",
          top : "-37px",
          left : "60px",
          color:"#0E497A"
        }}>
          <VisibilityIcon />
        </div>
      </div>
    );
  }
}

export default React.memo(DocumentViewer);
