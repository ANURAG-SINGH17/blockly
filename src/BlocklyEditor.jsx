import React, { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";

const BlocklyEditor = () => {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    if (!workspace.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: `
          <xml>
            <category name="Variables" colour="330">
              <block type="variables_set"></block>
              <block type="variables_get"></block>
            </category>
            <category name="Math" colour="230">
              <block type="math_number"></block>
              <block type="math_arithmetic"></block>
            </category>
            <category name="Logic" colour="210">
              <block type="controls_if"></block>
            </category>
            <category name="Text" colour="160">
              <block type="text"></block>
              <block type="text_print"></block>
            </category>
          </xml>
        `,
      });

      workspace.current.addChangeListener(() => {
        const generatedCode = javascriptGenerator.workspaceToCode(workspace.current);
        setCode(generatedCode);
      });
    }
  }, []);

  const runCode = () => {
    if (!code.trim()) {
      setOutput("Error: No code to execute.");
      return;
    }
  
    try {
      let outputCapture = ""; // Output store karne ke liye variable
      const originalLog = console.log;
  
      // Console.log override karein taki output capture ho sake
      console.log = (...msgs) => {
        outputCapture += msgs.join(" ") + "\n"; 
        setOutput(`Generated Code:\n${code}\n\nOutput:\n${outputCapture}`);
        originalLog(...msgs);
      };
  
      const originalAlert = window.alert;
      window.alert = (msg) => {
        outputCapture += msg + "\n";
        setOutput(`Generated Code:\n${code}\n\nOutput:\n${outputCapture}`);
        originalAlert(msg);
      };
  
      // Execute generated JavaScript
      new Function(code)();
  
      console.log = originalLog;
      window.alert = originalAlert;
      
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput(`Generated Code:\n${code}\n\nError: ${error.message}`);
    }
  };
  
  const resetWorkspace = () => {
    if (workspace.current) {
      workspace.current.clear();
      setCode("");
      setOutput("");
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      <div ref={blocklyDiv} className="flex-grow border bg-gray-100" />

      <div className="p-4 flex gap-4 bg-white shadow-md">
        <button
          onClick={runCode}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Run Code
        </button>
        <button
          onClick={resetWorkspace}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Reset
        </button>
      </div>
      <div className="p-4 bg-gray-200 h-40 overflow-auto">
        <h3 className="font-bold">Output:</h3>
        <pre className="bg-white p-2 rounded text-black whitespace-pre-wrap">
          {output || "(No output yet)"}
        </pre>
      </div>
    </div>
  );
};

export default BlocklyEditor;
