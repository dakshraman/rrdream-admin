// import SunEditor from "suneditor-react";
// import "suneditor/dist/css/suneditor.min.css";

// export default function SunEditorWrapper({ value, onChange }) {
//   return (
//     <SunEditor
//       height="400px"
//       setContents={value}
//       onChange={onChange}
//       setOptions={{
//         buttonList: [
//           ["undo", "redo"],
//           ["bold", "italic", "underline", "strike"],
//           ["fontSize", "formatBlock"],
//           ["align", "list", "table"],
//           ["link", "image", "video"],
//           ["codeView"],
//         ],
//         defaultStyle: "font-size: 14px; line-height: 1.6; font-family: Arial, sans-serif;",
//       }}
//     />
//   );
// }


import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import { forwardRef, useImperativeHandle, useRef } from "react";

const SunEditorWrapper = forwardRef(({ value, onChange, error }, ref) => {
  const editorRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (editorRef.current) {
        editorRef.current.editor.core.focus();
      }
    },
    scrollIntoView: (options) => {
      if (editorRef.current) {
        editorRef.current.editor.element.parentElement.scrollIntoView(options);
      }
    }
  }));

  return (
    <div>
      <SunEditor
        ref={editorRef}
        height="400px"
        setContents={value}
        onChange={(content) => {
          onChange(content);
        }}
        setOptions={{
          buttonList: [
            ["undo", "redo"],
            ["bold", "italic", "underline", "strike"],
            ["fontSize", "formatBlock"],
            ["align", "list", "table"],
            ["link", "image", "video"],
            ["codeView"],
          ],
          defaultStyle: "font-size: 14px; line-height: 1.6; font-family: Arial, sans-serif;",
        }}
      />
      {error && <span className="error" style={{ display: 'block', marginTop: '5px' }}>{error}</span>}
    </div>
  );
});

export default SunEditorWrapper;