import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import useStyles from "./styles";
import { useEffect, useState } from "react";
const editorConfig = {
  toolbar: {
    items: [
      "heading",
      "|",
      "bold",
      "italic",
      "underline",
      "link",
      "bulletedList",
      "numberedList",
      "|",
      "blockquote",
    ],
  },
};

type Props = {
  comment?: any;
  setComment?: any;
  disabled?: any;
  
};
function CommentsEditor({ comment = "", setComment, disabled, }: Props) {
  const [intitalData, setInititalData] = useState<any>();
  const classes = useStyles();

  useEffect(() => {
    // console.log("check comment in editor", comment);
    if (!!comment) {
      setInititalData(comment);
      setComment(comment);
    }
  }, [comment]);

  const handleChange = (event: any, editor: any) => {
    const data = editor.getData();
    setInititalData(data);
    if (!!setComment) {
      setComment(data);
    }
  };
  return (
    <div className={classes.ckBox} >
      <CKEditor
        editor={ClassicEditor as any}
        config={editorConfig}
        data={intitalData}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}

export default CommentsEditor;
