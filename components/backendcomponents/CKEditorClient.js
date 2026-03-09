import { jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect, useState, Suspense } from "react";
const CKEditorComponent = React.lazy(() => import("@ckeditor/ckeditor5-react").then((mod) => ({ default: mod.CKEditor })));
export default function CKEditorClient({ value, onChange, }) {
    const [editorInstance, setEditorInstance] = useState(null);
    useEffect(() => {
        import("@ckeditor/ckeditor5-build-classic").then((mod) => {
            setEditorInstance(() => mod.default);
        });
    }, []);
    if (!editorInstance)
        return _jsx("p", { children: "Loading editor..." });
    return (_jsx(Suspense, { fallback: _jsx("p", { children: "Loading editor..." }), children: _jsx(CKEditorComponent, { editor: editorInstance, data: value, onChange: (event, editor) => {
                const data = editor.getData();
                onChange(data);
            } }) }));
}
