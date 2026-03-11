import React from "react";
import ReactDOM from "react-dom/client";

import someImg from "@img/cover.jpg";

const App = () => (
	<>
		<h1 className="title">В кімнату заходить React</h1>
		{
			<img
				src={someImg}
				alt="Image"
			/>
		}
	</>
);

// Об'єкт для виводу
const root = document.querySelector("#root")
	? document.querySelector("#root")
	: document.querySelector(".wrapper");

// Main rendering
ReactDOM.createRoot(root).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
