import React, { useEffect, useState, Suspense } from "react";

const CKEditorComponent = React.lazy(() =>
  import("@ckeditor/ckeditor5-react").then((mod) => ({ default: mod.CKEditor }))
);

export default function CKEditorClient({
  value,
  onChange,
}: {
  value: string;
  onChange: (data: string) => void;
}) {
  const [editorInstance, setEditorInstance] = useState<any>(null);

  useEffect(() => {
    import("@ckeditor/ckeditor5-build-classic").then((mod) => {
      setEditorInstance(() => mod.default);
    });
  }, []);

  if (!editorInstance) return <p>Loading editor...</p>;

  return (
    <Suspense fallback={<p>Loading editor...</p>}>
      <CKEditorComponent
        editor={editorInstance}
        data={value}
        onChange={(event: any, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </Suspense>
  );
}
