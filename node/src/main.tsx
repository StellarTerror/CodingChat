import React, { useState, useEffect } from "react";

import * as FlexLayout from "flexlayout-react";
import "flexlayout-react/style/light.css";
import * as monaco from "monaco-editor";
import axios from "axios";
import useWebSocket from "react-use-websocket";
import { Buffer } from "buffer";

import { Cursor, Selection } from "./components/editor";
import { Header } from "./components/header";
import CodeEditor from "./components/code-editor";
import { ReadOnlyTextEditor, TextEditor } from "./components/text-editor";
import { Chat, ChatLog } from "./components/chat";

var json: FlexLayout.IJsonModel = {
  global: {},
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "row",
        weight: 75,
        children: [
          {
            type: "row",
            weight: 80,
            children: [
              {
                type: "tabset",
                weight: 100,
                children: [
                  {
                    type: "tab",
                    name: "CodeEditor",
                    component: "code-editor",
                    enableClose: false,
                  },
                ],
              },
            ],
          },
          {
            type: "row",
            weight: 20,
            children: [
              {
                type: "row",
                weight: 33,
                children: [
                  {
                    type: "tabset",
                    weight: 100,
                    children: [
                      {
                        type: "tab",
                        name: "Log",
                        component: "log-editor",
                        enableClose: false,
                      },
                    ],
                  },
                ],
              },
              {
                type: "row",
                weight: 33,
                children: [
                  {
                    type: "tabset",
                    weight: 100,
                    children: [
                      {
                        type: "tab",
                        name: "Input",
                        component: "input-editor",
                        enableClose: false,
                      },
                    ],
                  },
                ],
              },
              {
                type: "row",
                weight: 33,
                children: [
                  {
                    type: "tabset",
                    weight: 100,
                    children: [
                      {
                        type: "tab",
                        name: "Output",
                        component: "output-editor",
                        enableClose: false,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "row",
        weight: 25,
        children: [
          {
            type: "tabset",
            weight: 100,
            children: [
              {
                type: "tab",
                name: "Chat",
                component: "chat",
                enableClose: false,
              },
            ],
          },
        ],
      },
    ],
  },
};

const cyrb53 = function (str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

function getRandomColor(input: string): string {
  const h = cyrb53(input) % 360;
  return `hsl(${h}, 80%, 60%)`;
}

var cursor_display = (
  cursors: Cursor[],
  editor: monaco.editor.IStandaloneCodeEditor
) => {
  if (editor && cursors) {
    let style = document.getElementById(
      `CodeEditor-cursor-style`
    ) as HTMLStyleElement;
    let cursorstyles = "";

    for (let cursordeco of editor.getDecorationsInRange(
      new monaco.Range(0, 0, editor.getModel()!.getLineCount() + 1, 0)
    ) ?? []) {
      if (cursordeco.options.className?.endsWith("-cursor")) {
        editor.deltaDecorations([cursordeco.id], []);
      }
    }

    for (let cursor of cursors?.filter((cursor) => cursor.isActive) ?? []) {
      let hashedname =
        "CodeEditor-" + cyrb53(cursor.key) + "-cursor".toString();
      editor.deltaDecorations(
        [],
        [
          {
            range: new monaco.Range(cursor.y, cursor.x, cursor.y, cursor.x),
            options: {
              className: hashedname,
            },
          },
        ]
      );

      cursorstyles += `
.${hashedname} { background: ${getRandomColor(
        cursor.name
      )}; position:relative; z-index: 2; width: 2px !important;}
.${hashedname}:hover::after { content: "${
        cursor.name
      }"; pointer-events: none; white-space: nowrap; padding: 1px; opacity:0.8; position:relative; z-index: 3; color: #333; margin-bottom: 5px !important; margin-left: 5px; font-size: small; background: ${getRandomColor(
        cursor.name
      )}; }
`;
    }
    style.innerHTML = cursorstyles;
  }
};

function selection_display(
  selections: Selection[],
  editor: monaco.editor.IStandaloneCodeEditor
) {
  let style = document.getElementById(
    `CodeEditor-cursor-style`
  ) as HTMLStyleElement;
  let cursorstyles = style.innerText;

  for (let cursordeco of editor.getDecorationsInRange(
    new monaco.Range(0, 0, editor.getModel()!.getLineCount() + 1, 0)
  ) ?? []) {
    if (cursordeco.options.className?.endsWith("-selection")) {
      editor.deltaDecorations([cursordeco.id], []);
    }
  }

  console.log(
    editor.getDecorationsInRange(
      new monaco.Range(0, 0, editor.getModel()!.getLineCount() + 1, 0)
    )
  );

  for (let selection of selections.filter((selection) => selection.isActive) ??
    []) {
    let hashedname =
      "CodeEditor-" + cyrb53(selection.key) + "-selection".toString();
    editor.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(
            selection.startY,
            selection.startX,
            selection.endY,
            selection.endX
          ),
          options: {
            className: hashedname,
          },
        },
      ]
    );

    cursorstyles += `
.${hashedname} { background: ${getRandomColor(
      selection.name
    )}; position:relative; z-index: 2; opacity:0.5;}
`;
  }
  style.innerHTML = cursorstyles;
  console.log(
    editor.getDecorationsInRange(
      new monaco.Range(0, 0, editor.getModel()!.getLineCount() + 1, 0)
    )
  );
}

const model = FlexLayout.Model.fromJson(json);

function Main(props: { name: string; room_id: string }) {
  const api_endpoint = "https://wandbox.org/api/compile.json";
  const ws_endpoint =
    "ws://" + window.location.host + "/api/ws/" + props.room_id;
  console.log(ws_endpoint);

  const [code_editor, set_code_editor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [log, set_log] = useState<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );
  const [input, set_input] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [output, set_output] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [code_language, set_code_language] = useState<string>("cpp");
  const [is_running, set_is_running] = useState<boolean>(false);
  const [chat_log, set_chat_log] = useState<ChatLog[]>([]);
  const [cursors, set_cursors] = useState<Cursor[]>([]);
  const [selections, set_selections] = useState<Selection[]>([]);
  const [last_edit_timestamp, set_last_edit_timestamp] = useState<number>(0);
  const [is_connected, set_is_connected] = useState<boolean>(false);

  const { sendMessage, lastMessage } = useWebSocket(ws_endpoint, {
    onOpen: () => console.log("Connected"),
    queryParams: { name: Buffer.from(props.name).toString("hex") },
  });

  var send_message = (message: string) => {
    if (message.length > 0) {
      sendMessage(JSON.stringify({ type: "chat", data: message }));
    }
  };

  useEffect(() => {
    if (lastMessage != null) {
      try {
        var json = JSON.parse(lastMessage.data);
        console.log(json);
        if (json.type === "chat") {
          set_chat_log([
            new ChatLog(json.data, json.name, getRandomColor(json.name)),
            ...chat_log,
          ]);
        } else if (json.type === "cursormove") {
          set_cursors((cursors_old) => {
            var not_found_flag = true;
            for (let i = 0; i < cursors_old.length; i++) {
              if (cursors_old[i].key === json.key) {
                cursors_old[i] = new Cursor(
                  json.data.lineNumber,
                  json.data.column,
                  true,
                  json.name,
                  json.key
                );
                not_found_flag = false;
                break;
              }
            }
            if (not_found_flag) {
              cursors_old.push(
                new Cursor(
                  json.data.lineNumber,
                  json.data.column,
                  true,
                  json.name,
                  json.key
                )
              );
            }
            if (code_editor) {
              cursor_display(cursors_old, code_editor);
            }
            return cursors_old;
          });
        } else if (json.type === "selection") {
          set_selections((selections_old) => {
            console.log(json.data);
            var not_found_flag = true;
            for (let i = 0; i < selections_old.length; i++) {
              if (selections_old[i].key === json.key) {
                if (
                  json.data.startLineNumber !== json.data.endLineNumber ||
                  json.data.startColumn !== json.data.endColumn
                ) {
                  selections_old[i] = new Selection(
                    json.data.startLineNumber,
                    json.data.startColumn,
                    json.data.endLineNumber,
                    json.data.endColumn,
                    true,
                    json.name,
                    json.key
                  );
                } else {
                  [selections_old[i], selections_old[-1]] = [
                    selections_old[-1],
                    selections_old[i],
                  ];
                  selections_old.pop();
                }
                not_found_flag = false;
                break;
              }
            }
            if (not_found_flag) {
              if (
                json.data.startLineNumber !== json.data.endLineNumber ||
                json.data.startColumn !== json.data.endColumn
              ) {
                selections_old.push(
                  new Selection(
                    json.data.startLineNumber,
                    json.data.startColumn,
                    json.data.endLineNumber,
                    json.data.endColumn,
                    true,
                    json.name,
                    json.key
                  )
                );
              }
            }
            if (code_editor) {
              selection_display(selections_old, code_editor);
            }
            return selections_old;
          });
        } else if (json.type === "edit") {
          for (let i = 0; i < json.data.changes.length; i++) {
            set_last_edit_timestamp(new Date().getTime());
            code_editor?.executeEdits("", [json.data.changes[i]]);
          }
        } else if (json.type === "connect") {
          if (!is_connected) {
            set_last_edit_timestamp(new Date().getTime());
            code_editor?.setValue(json.data);
            set_is_connected(true);
          }
          set_chat_log([
            new ChatLog(`${json.name}が接続しました`, "info", "#000"),
            ...chat_log,
          ]);
        } else if (json.type === "disconnect") {
          // 切断した人のカーソルを消す
          set_cursors((cursors_old) => {
            let cursors_new: Cursor[] = [];
            for (let i = 0; i < cursors_old.length; i++) {
              if (cursors_old[i].key === json.key) {
                continue;
              }
              cursors_new.push(cursors_old[i]);
            }
            if (code_editor) {
              cursor_display(cursors_new, code_editor);
            }
            return cursors_new;
          });
          set_selections((old_selections) => {
            let new_selections: Selection[] = [];
            for (let i = 0; i < old_selections.length; i++) {
              if (old_selections[i].key === json.key) {
                continue;
              }
              new_selections.push(old_selections[i]);
            }
            if (code_editor) {
              selection_display(new_selections, code_editor);
            }
            return new_selections;
          });
          set_chat_log([
            new ChatLog(`${json.name}が切断しました`, "info", "#000"),
            ...chat_log,
          ]);
        }
      } catch (ex) {
        console.log(ex);
      }
    }
  }, [lastMessage]);

  var on_cursor_move = (event: monaco.editor.ICursorPositionChangedEvent) => {
    sendMessage(JSON.stringify({ type: "cursormove", data: event.position }));
  };

  var on_selection_change = (
    event: monaco.editor.ICursorSelectionChangedEvent
  ) => {
    sendMessage(JSON.stringify({ type: "selection", data: event.selection }));
  };

  var on_code_edit = (
    full_text: string,
    event: monaco.editor.IModelContentChangedEvent
  ) => {
    set_last_edit_timestamp((last_timestamp: number) => {
      if (new Date().getTime() - last_timestamp > 25) {
        sendMessage(
          JSON.stringify({
            type: "edit",
            data: {
              changes: event.changes,
              timestamp: new Date().getTime(),
              full_text: full_text,
            },
          })
        );
      }
      return last_timestamp;
    });
  };

  var code_editor_update = (editor: monaco.editor.IStandaloneCodeEditor) => {
    set_code_editor(editor);
    editor.setValue("");
    editor.onDidChangeCursorPosition(on_cursor_move);
    editor.onDidChangeModelContent(
      (event: monaco.editor.IModelContentChangedEvent) => {
        on_code_edit(editor.getValue(), event);
      }
    );
    editor.onDidChangeCursorSelection(on_selection_change);
  };
  var log_editor_update = (editor: monaco.editor.IStandaloneCodeEditor) => {
    set_log(editor);
    editor.setValue("");
  };
  var input_editor_update = (editor: monaco.editor.IStandaloneCodeEditor) => {
    set_input(editor);
    editor.setValue("");
  };
  var output_editor_update = (editor: monaco.editor.IStandaloneCodeEditor) => {
    set_output(editor);
    editor.setValue("");
  };

  var language_update = (language: string) => {
    set_code_language(language);
    const model = code_editor?.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, language);
    }
  };

  var run_code = () => {
    set_is_running(true);
    const code = code_editor?.getValue();
    const language = code_language;
    const stdin = input?.getValue();
    const compiler = code_language === "cpp" ? "gcc-head" : "cpython-3.9.3";
    if (code && language) {
      const json = {
        code: code,
        compiler: compiler,
        stdin: stdin,
      };
      log?.setValue("実行中...\n");
      var old_log = log?.getValue();

      axios
        .post(api_endpoint, json)
        .then((res) => {
          const compiler_log = res.data.compiler_output;
          const stdout = res.data.program_output;
          const compiler_error = res.data.compiler_error;
          const runtime_error = res.data.program_error;

          console.log(res);

          if (compiler_log) {
            log?.setValue(old_log + "\n" + compiler_log);
            old_log = old_log + "\n" + compiler_log;
          }
          if (compiler_error) {
            log?.setValue(old_log + "\n" + compiler_error);
            old_log = old_log + "\n" + compiler_error;
          }
          if (runtime_error) {
            log?.setValue(old_log + "\n" + runtime_error);
            old_log = old_log + "\n" + runtime_error;
          }
          if (stdout) {
            output?.setValue(stdout);
          }
        })
        .catch((err) => {
          console.log("error", err);
          log?.setValue(log + "\n" + "Something occured...");
        })
        .finally(() => {
          log?.setValue(old_log + "実行完了...\n");
          set_is_running(false);
        });
    }
  };

  var factory = (node: FlexLayout.TabNode) => {
    var component = node.getComponent();
    if (component === "button") {
      return <button>{node.getName()}</button>;
    } else if (component === "code-editor") {
      return (
        <CodeEditor
          name={node.getName()}
          cursors={[]}
          language={code_language}
          on_mount={code_editor_update}
        />
      );
    } else if (component === "input-editor") {
      return (
        <TextEditor name={node.getName()} on_mount={input_editor_update} />
      );
    } else if (component === "log-editor") {
      return (
        <ReadOnlyTextEditor
          name={node.getName()}
          on_mount={log_editor_update}
        />
      );
    } else if (component === "output-editor") {
      return (
        <ReadOnlyTextEditor
          name={node.getName()}
          on_mount={output_editor_update}
        />
      );
    } else if (component === "chat") {
      return <Chat onSend={send_message} logs={chat_log} />;
    }
  };

  return (
    <div>
      <div>
        <Header
          language_change={language_update}
          is_running={is_running}
          run_code={run_code}
        />
      </div>
      <div
        style={{
          position: "relative",
          height: "calc(100vh - 56px)",
        }}
      >
        <FlexLayout.Layout model={model} factory={factory} />
      </div>
    </div>
  );
}

export default Main;
