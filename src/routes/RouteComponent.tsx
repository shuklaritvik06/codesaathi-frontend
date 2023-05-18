import { Route, Routes } from "react-router-dom";
import EditorComponent from "../pages/Editor";
import Home from "../pages/Home";
import { FC } from "react";
const RouteComponent: FC = () => {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/room/:roomID" element={<EditorComponent />} />
		</Routes>
	);
};

export default RouteComponent;
