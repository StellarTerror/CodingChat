import React, { useState, useEffect } from "react";
import ReactDom from "react-dom";
import axios from "axios";

import Main from "./main";

import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";

const endpoint = "http://" + window.location.hostname + "/api";

function ChatApp() {
  const roomId = useParams<{ id: string }>();
  const [userName, setUserName] = useState("");
  const [open, setOpen] = React.useState(true);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [room_is_exist, setRoomIsExist] = React.useState(true);
  const [room_name, setRoomName] = React.useState("");

  const onclick = () => {
    const element = document.getElementById("user-name") as HTMLInputElement;
    setUserName(element.value);
  };
  useEffect(() => {
    axios
      .get(`${endpoint}/room_info/${roomId.id}`)
      .then((res) => {
        if (res.data.name) {
          setRoomName(res.data.name);
        }
        setRoomIsExist(true);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          setRoomIsExist(false);
        }
      });
  }, []);

  if (userName === "" && room_is_exist) {
    return (
      <div
        style={{
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
        }}
      >
        <div>
          <h4>部屋名: {room_name}</h4>
          <div>名前を入力してください</div>
          <input
            id="user-name"
            type="text"
            className="form-control"
            placeholder="名前"
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={onclick}
            style={{ margin: "5px" }}
          >
            OK
          </button>
        </div>
      </div>
    );
  } else if (!room_is_exist) {
    return (
      <div
        style={{
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
        }}
      >
        <div>
          <div>部屋が存在しません</div>
          <br />
          <a href="/"> 戻る </a>
        </div>
      </div>
    );
  } else {
    return <Main name={userName} room_id={roomId.id!}></Main>;
  }
}

type Room = {
  name: string;
  room_id: string;
  connections: number;
};

function RoomList(props: { rooms: Room[] }) {
  console.log(props.rooms);
  return (
    <Virtuoso
      data={props.rooms}
      style={{ height: "30%", width: "500px" }}
      itemContent={(index, room) => {
        return (
          <div className="list-group-item d-flex justify-content-between align-items-start">
            <div className="ms-2 me-auto">
              <div className="fw-bold">{room.name}</div>
              <div>{room.connections + "人"}</div>
            </div>
            <a className="btn btn-primary" href={`/chat/${room.room_id}`}>
              入室
            </a>
          </div>
        );
      }}
    />
  );
}

function Welcome() {
  const [room_list, set_room_list] = React.useState<Room[]>([]);
  const [checked, setChecked] = React.useState(true);

  const checkbox_clicked = () => {
    setChecked(!checked);
  };

  useEffect(() => {
    axios.get(endpoint + "/room_list").then((res) => {
      var temp: Room[] = [];
      for (var i = 0; i < res.data.length; i++) {
        temp.push({
          name: res.data[i].name,
          room_id: res.data[i].room_id,
          connections: res.data[i].connections,
        });
      }
      set_room_list(temp);
    });
  }, []);

  const create_room = () => {
    const room_name_elem = document.getElementById(
      "room-name"
    ) as HTMLInputElement;
    const room_name = room_name_elem.value;
    const is_public_elem = document.getElementById(
      "is-public"
    ) as HTMLInputElement;
    const is_public = is_public_elem.checked;
    const json = {
      name: room_name,
      is_public: is_public,
    };
    console.log(json);
    axios.post(endpoint + "/create_room", json).then((res) => {
      const new_room_id = res.data;
      window.location.href = `/chat/${new_room_id}`;
    });
  };

  return (
    <>
      <nav className="navbar navbar-light bg-dark">
        <div className="container-fluid d-flex flex-row">
          <a className="navbar-brand" href="#" style={{ color: "white" }}>
            CodingChat
          </a>
        </div>
      </nav>
      <div
        style={{
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          flexFlow: "column",
        }}
      >
        <div>
          CodingChatはオンラインでのペアプログラミングを支援するサービスです。<br />
          誰でも無料でオンラインでコードを共同編集し実行することができます。
        </div>
        <div style={{ height: "5%" }} />
        <div>
          <h4>部屋一覧</h4>
        </div>
        <RoomList rooms={room_list}></RoomList>
        ※新しい部屋の作成時に、誰も入っていない部屋は自動的に削除されます。
        <div style={{ height: "5%" }} />
        <h4 style={{ margin: "5px" }}>部屋を新規作成</h4>
        <div>
          <div>
            <input
              id="room-name"
              className="form-control"
              placeholder="部屋名"
            />
          </div>
          <div>
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="is-public"
              checked={checked}
              onClick={checkbox_clicked}
            />
            <label className="form-check-label" htmlFor="flexCheckChecked">
              公開
            </label>
          </div>
          <div>
            <button
              style={{ margin: "5px" }}
              className="btn btn-primary"
              onClick={create_room}
            >
              作成
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/chat/:id" element={<ChatApp />} />
    </Routes>
  );
}

ReactDom.render(
  <React.StrictMode>
    <BrowserRouter>
      <App></App>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
