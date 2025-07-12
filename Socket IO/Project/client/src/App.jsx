import React, { useState } from "react";
import { CodeEditor } from "./components/Editor";

function App() {
  return (
    <div className="w-screen min-h-screen bg-stone-900 text-white p-6 ">
      <div>
        <h1 className="text-2xl font-bold mb-6 text-green-700">CODE EDITOR</h1>
      </div>
      <div className="flex h-full gap-4">
        {/* Left side: Editor */}
        <div className="h-full w-full">
          <CodeEditor />
        </div>
      </div>
    </div>
  );
}

export default App;

/*
function App() {
  const [code, setCode] = useState("print('Hello, World!')");
  const [output, setOutput] = useState("");

  const runCode = async () => {
    try {
      const res = await axios.post("http://localhost:5000/run", { code });
      setOutput(res.data.output || res.data.error);
    } catch (err) {
      setOutput("Error connecting to server");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-400">
        Python Code Editor
      </h1>

      <div className="rounded-md overflow-hidden border border-gray-700">
        <Editor
          height="400px"
          defaultLanguage="python"
          value={code}
          theme="vs-dark"
          onChange={(value) => setCode(value)}
        />
      </div>

      <button
        onClick={runCode}
        className="mt-4 bg-purple-600 hover:bg-purple-700 transition-colors px-5 py-2 rounded text-white font-semibold"
      >
        Run Code
      </button>

      <div className="mt-6 bg-gray-800 border border-gray-700 rounded p-4">
        <h2 className="text-lg font-semibold text-green-400 mb-2">Output</h2>
        <pre className="whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
}
*/
