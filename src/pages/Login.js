import React, { useState, useEffect } from "react"
import { View, StyleSheet, Image, TextInput, TouchableOpacity, Text } from "react-native"
//TouchableOpacity is a button without builtin styles
import logo from "../images/logo.png"
//react native will import the best image size automatically
import api from "../services/api"
import AsyncStorage from "@react-native-community/async-storage"

function Login(props) {
	const [ user, setUser ] = useState("")

	useEffect(() => {
		AsyncStorage.getItem("userId").then((userId) => {
			if (userId) {
				props.navigation.navigate("List", { userId })
			}
		})
	}, [])

	//the useEffect is a react hook that run the function in the first argument every time
	//the variables on the second argument changes, so if we put an empty array the function is only run one single time
	//that is when the component is mounted for the first time.
	//inside the useEffect we could not await before the .getItem because we would have to write
	// a new function with the async keyword, which is possible, but we prefer to just use the .then method instead
	// (it is not possible to write async before the useEffect function, it is a hooks limitation)
	//this particular useEffect is navigating us to the list page with the user id even if we reload the page. This is
	//possible because the AsyncStorage API stored the username and the useEffect check it if we have a username stored.
	//If so we navigate directly.

	async function handleLogin() {
		const response = await api.post("/devs", { username: user })
		//with the data passed in this second argument as the json body, just as we made in the server.
		//the post in this address is going to register a new dev and store all his json github data inside response.data

		const { _id } = response.data
		//here we are destructuring to get the _id inside the response.data

		await AsyncStorage.setItem("userId", _id)
		//must be await because the data takes time to be stored.
		//this setItem method of the imported AsyncStorage api receives 2 arguments:
		//the first one is the name of the data and the second is the data itself.
		//The data can only be string or numbers, so if you want to store an object you have to convert it to json.

		props.navigation.navigate("List", { user: _id })
		//navigation is a props inserted by the react-navigation api that holds the navigate method that
		// calls the named component that are written in the Routes file.
		//Writing the id as the second argument of the navigate function will add this value (_id) into the url address to
		//so the List page can read later in the props.navigation.getParams
	}

	return (
		<View style={styles.container}>
			<Image source={logo} alt="tindev logo" />
			<TextInput
				autoCapitalize="none"
				autoCorrect={false}
				style={styles.textInput}
				placeholder="Enter your GitHub username"
				placeholderTextColor="#999"
				value={user}
				onChangeText={setUser}
			/>
			<TouchableOpacity onPress={handleLogin} style={styles.button}>
				<Text style={styles.buttonText}>Send</Text>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		justifyContent: "center",
		alignItems: "center",
		padding: 30,
	},
	textInput: {
		height: 46,
		alignSelf: "stretch",
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 4,
		marginTop: 20,
		paddingHorizontal: 15,
	},
	button: {
		height: 46,
		alignSelf: "stretch",
		backgroundColor: "#DF4723",
		borderRadius: 4,
		marginTop: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 16,
	},
})

export default Login
