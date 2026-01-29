"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const CKEditorComponent = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false }
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
    <CKEditorComponent
      editor={editorInstance}
      data={value}
      onChange={(event: any, editor: any) => {
        const data = editor.getData();
        onChange(data);
      }}
    />
  );
}
