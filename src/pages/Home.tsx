import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Home: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  function handleSubmit() {
    const element = document.getElementsByName(
      "room_id"
    )[0] as HTMLInputElement;
    const room_id = element.value;
    const username_element = document.getElementsByName(
      "username"
    )[0] as HTMLInputElement;
    const username = username_element.value;
    if (room_id && username) {
      navigate(`/room/${room_id}`, {
        state: {
          username: username
        }
      });
    }
  }
  function Generate() {
    const room_id = uuidv4();
    const element = document.getElementsByName(
      "room_id"
    )[0] as HTMLInputElement;
    element.value = room_id;
  }
  return (
    <div className="w-screen h-screen flex  items-center">
      <div className="w-full mx-5 md:max-w-lg md:mx-auto">
        <h1 className="text-4xl font-semibold w-full justify-center flex text-[#333]">
          Code<span className="text-purple-700">Saathi</span>
        </h1>
        <form>
          <div className="flex flex-wrap gap-2 relative">
            <label htmlFor="room_id" className="text-white text-xl font-bold">
              Room ID
            </label>
            <input
              type="text"
              name="room_id"
              className="w-full px-2 py-3 outline-none rounded-md border"
              placeholder="Room ID"
              defaultValue={location.state?.room_id}
            />
            <button
              className="absolute right-1 bottom-1 bg-purple-500 text-white p-2 rounded-md"
              type="button"
              onClick={(e) => Generate()}
            >
              Generate
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <label htmlFor="username" className="text-white text-xl font-bold">
              Username
            </label>
            <input
              type="text"
              name="username"
              className="w-full px-2 py-3 outline-none rounded-md border"
              placeholder="Username"
            />
          </div>
          <input
            type="button"
            value="Join"
            className="w-full mt-5 font-bold rounded-md cursor-pointer bg-purple-950 text-white p-3"
            onClick={(e) => handleSubmit()}
          />
        </form>
      </div>
    </div>
  );
};

export default Home;
