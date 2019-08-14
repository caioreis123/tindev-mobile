import React from "react"
import Routes from "./Routes"

import { YellowBox } from "react-native"
YellowBox.ignoreWarnings([ "Unrecognized WebSocket" ])
//this is just to avoid an warning because websocket search for some web functionality that does not exists in mobile

function App() {
	return <Routes />
}

export default App
