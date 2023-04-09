import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import toast, { Toaster } from "react-hot-toast";
import Avatar from "react-avatar";

import { useEffect, useState } from "react";
import { FaHamburger, FaShare } from "react-icons/fa";
import { CiChat2 } from "react-icons/ci";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../commons/socketInit";

type EditorClient = {
  [room: string]: {
    [username: string]: string;
  }[];
};

const EditorComponent = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState({ value: "" });
  const [url, setUrl] = useState("");
  const [clients, setClients] = useState<EditorClient>({});
  const [room, setRoom] = useState("");
  const location = useLocation();
  function handleSendMessage() {
    const element = document.querySelector("#message") as HTMLInputElement;
    socket.emit("chat", {
      room,
      username: location.state.username,
      message: element.value
    });
    element.value = "";
  }
  async function copyToClipboard(textToCopy: string) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      document.body.prepend(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (error) {
        console.error(error);
      } finally {
        textArea.remove();
      }
    }
  }
  useEffect(() => {
    setUrl(window.location.href);
    setRoom(url.split("/")[4]);
  }, [url]);
  useEffect(() => {
    if (localStorage.getItem("code") !== null) {
      setValue({ value: localStorage.getItem("code")! });
    }
    if (location.state?.username !== undefined) {
      socket.emit("join", {
        roomId: window.location.href.split("/")[4],
        username: location.state?.username
      });
    } else {
      navigate("/", {
        state: {
          room_id: window.location.href.split("/")[4]
        }
      });
    }
    socket.on("newjoined", function ({ clients, username, socketId }) {
      setClients(clients);
      toast.success(`${username} joined the room`);
    });
    socket.on("disconnected", function ({ socketId, username }) {
      toast.success(`${username} left the room`);
    });
    socket.on("codechange", function ({ code }) {
      setValue({
        value: code
      });
    });
    socket.on("newchat", function ({ msg, username, room }) {
      var item = document.createElement("div");
      item.textContent = msg;
      item.classList.add(
        "bg-purple-500",
        "rounded-md",
        "p-4",
        "mx-1",
        "my-2",
        "text-white",
        "relative"
      );
      var usernameItem = document.createElement("div");
      usernameItem.textContent = username;
      usernameItem.classList.add(
        "absolute",
        "bottom-0",
        "text-xs",
        "right-2",
        "text-white"
      );
      item.appendChild(usernameItem);
      document.querySelector("#chat")?.appendChild(item);
    });
    return () => {
      socket.off("newjoined");
      socket.off("disconnected");
      socket.off("newchat");
    };
  }, []);
  return (
    <div>
      <Toaster />
      <CodeMirror
        editorDidMount={(editor) => {
          editor.setSize("100vw", "100vh");
        }}
        value={value.value}
        options={{
          mode: { name: "javascript", json: true },
          theme: "material",
          lineNumbers: true,
          autofocus: true,
          showCursorWhenSelecting: false,
          lineWrapping: true
        }}
        onBeforeChange={(editor, data, value) => {
          setValue({ value });
        }}
        onChange={(editor, data, value) => {
          socket.emit("newcode", {
            roomId: window.location.href.split("/")[4],
            code: value
          });
        }}
      />
      <div className="absolute right-5 top-5">
        <FaHamburger
          size={30}
          className="text-white cursor-pointer"
          onClick={() => {
            document.querySelector("#menu")?.classList.add("right-0");
            document.querySelector("#menu")?.classList.remove("hidden");
          }}
        />
      </div>
      <div
        className="h-screen border-l-2 w-full md:w-[30vw] lg:w-[20vw] bg-white absolute  hidden duration-700 -right-full top-0"
        id="menu"
      >
        <div className="flex items-center">
          <FaHamburger
            size={30}
            className="text-[#333] cursor-pointer m-3"
            onClick={() => {
              document.querySelector("#menu")?.classList.remove("right-0");
              document.querySelector("#menu")?.classList.add("hidden");
            }}
          />
          <div className="text-2xl font-semibold mx-3 text-[#333]">
            Code<span className="text-purple-500">Saathi</span>
          </div>
        </div>
        <div className="p-3 relative">
          <div
            className=" text-[#393939] p-3 bg-gray-100 border h-28  rounded-md  w-full"
            id="url"
          >
            <p className="overflow-clip">{url}</p>
          </div>
          <div
            className="absolute bottom-5 right-5 bg-purple-700 cursor-pointer text-white p-2 rounded-md"
            onClick={async () => {
              const element = document.querySelector("#url") as HTMLElement;
              await copyToClipboard(element.innerText);
              toast.success("Copied to Clipboard");
            }}
          >
            <FaShare size={20} />
          </div>
        </div>
        <div className="p-3">
          <div className="w-full h-[400px] relative bg-gray-100 border rounded-md">
            <div className="overflow-y-scroll h-4/5" id="chat"></div>
            <div className="w-full absolute bottom-3 items-center px-2">
              <input
                type={"text"}
                className="w-full p-2 outline-none rounded-md border"
                id="message"
              />
              <div
                className="absolute bottom-1 right-2 bg-purple-700 cursor-pointer text-white p-2 rounded-md"
                onClick={() => handleSendMessage()}
              >
                <CiChat2 size={20} />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-3 overflow-hidden" id="participants">
          {Object.keys(clients).map((room) => {
            const array = clients[room].map((client: Object) => {
              return Object.keys(client)[0];
            });
            return array.map((username) => {
              return (
                <>
                  <Avatar
                    color={"purple"}
                    name={username}
                    size={"40"}
                    className="rounded-full"
                  />
                </>
              );
            });
          })}
        </div>
        <div className="flex flex-col gap-3 absolute bottom-0 w-full p-3">
          <button
            className="w-full bg-purple-950 text-white font-bold p-3 rounded-md"
            onClick={async () => {
              const code = url.split("/")[4];
              await copyToClipboard(code);
              toast.success("Room Code Copied");
            }}
          >
            Copy Room Code
          </button>
          <button
            className="w-full bg-purple-950 text-white font-bold p-3 rounded-md"
            onClick={() => {
              socket.emit("leave");
              navigate("/");
            }}
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorComponent;
