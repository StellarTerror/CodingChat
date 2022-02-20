import React from "react";

export function Header(props: {
  language_change: (language: string) => void;
  is_running: boolean;
  run_code: () => void;
}) {
  var run_button = props.is_running ? (
    <button disabled={true} type="button" className="btn" color="inherit">
      <div style={{ display: "flex", color: "white" }}>実行中...</div>
    </button>
  ) : (
    <button
      onClick={props.run_code}
      type="button"
      className="btn"
      color="inherit"
    >
      <div style={{ color: "white" }}>
        <i className="bi bi-caret-right-fill"></i>実行
      </div>
    </button>
  );
  return (
    <nav className="navbar navbar-light bg-dark">
      <div className="container-fluid d-flex flex-row">
        <a className="navbar-brand" href="#" style={{ color: "white" }}>
          CodingChat
        </a>
        <div className="d-flex flex-row">
          <div className="nav-item">
            <select
              className="form-select"
              defaultValue={"cpp"}
              color="inherit"
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                props.language_change(event.target.value as string)
              }
            >
              <option value="cpp">C++</option>
              <option value="python">Python3</option>
            </select>
          </div>
          <div className="nav-item">{run_button}</div>
          <div className="nav-item">
            <button
              type="button"
              className="btn"
              color="inherit"
              onClick={() => (window.location.href = "/")}
            >
              <div style={{ color: "white" }}>退室</div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
