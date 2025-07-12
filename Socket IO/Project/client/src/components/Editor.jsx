import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { LanguageList } from "./LanguageList.jsx";
import { languageSnippets } from "./data.js";
import { Output } from "./Output.jsx";

// Language snippets configuration

export const CodeEditor = () => {
  const [code, setCode] = useState(languageSnippets.javascript);
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("javascript");

  const onMount = (editor) => {
    editorRef.current = editor;

    console.log(editor.getValue());
    // Move cursor to the end of the content
    const model = editor.getModel();
    const lineCount = model.getLineCount();
    const lastLineLength = model.getLineContent(lineCount).length;
    editor.setPosition({ lineNumber: lineCount, column: lastLineLength + 1 });
    editor.focus();
  };

  const onSelect = (value) => {
    setLanguage(value);
    // Set the appropriate snippet for the selected language
    const snippet =
      languageSnippets[value] || `// Write your ${value} code here...`;
    setCode(snippet);
  };

  return (
    <div className="w-screen flex gap-10 ">
      <div className="w-3/5">
        <div>
          <LanguageList language={language} onSelect={onSelect} />
        </div>
        <Editor
          height="90vh"
          language={language}
          onMount={onMount}
          value={code}
          onChange={(code) => setCode(code)}
          theme="vs-dark"
          options={{
            fontSize: 20,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: "on", // Wrap long lines
            tabSize: 4, // Spaces per tab
            lineNumbers: "on", // Show line numbers
            mouseWheelZoom: true, // Enable mouse wheel zoom
            padding: { top: 18, bottom: 16 },
          }}
        />
      </div>

      <div className="w-1/3 h-[90vh]">
        <Output />
      </div>
    </div>
  );
};
