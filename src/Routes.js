import Login from "./pages/Login"
import List from "./pages/List"
import { createAppContainer, createSwitchNavigator } from "react-navigation"
//createAppContainer must wraps all related pages
//createSwitchNavigator generate the navigation between screens but without any visual addons, like
//a drawer, top bar with back button, bottom bar, material tabs... All these features can be achieved with others
//react-navigation imports

export default createAppContainer(
	createSwitchNavigator({
		Login,
		List,
	}),
)
