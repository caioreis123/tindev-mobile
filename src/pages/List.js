import React, { useEffect, useState } from "react"
import { View, Image, StyleSheet, Text, TouchableOpacity } from "react-native"
import api from "../services/api"
import logo from "../images/logo.png"
import like from "../images/like.png"
import dislike from "../images/dislike.png"
import itsamatch from "../images/itsamatch.png"
import AsyncStorage from "@react-native-community/async-storage"
import io from "socket.io-client"

function List({ navigation }) {
	const userId = navigation.getParam("user")
	//the navigation was destructed in the props and we are accessing the getParam method of the react-navigation api to
	//access the id value passed with the key use by the Login page (just before the return of the login function)

	const [ users, setUsers ] = useState([])
	//this state will store all the users that will be displayed to be liked or not

	const [ devMatch, setDevMatch ] = useState(null)

	useEffect(
		() => {
			async function loadUsers() {
				const response = await api.get("/devs", {
					headers: {
						user: userId,
					},
				})
				setUsers(response.data)
				//this setUsers function is filling the users state variable with all the json data we are getting as response
				//from our API request using axios.
				//Since we only want the users that we have not liked or disliked we have to pass our own id that is in the url
				//address to to the get method
			}
			loadUsers()
			//now we are calling the function
		},
		[ userId ],
	)
	//the useEffect react hook is a function that receives 2 arguments,
	//the first is the function that is going to be executed.
	//the second is the moment of execution. This moment is everytime some variable inside the array is updated.
	//If the array is empty the function is going to be executed only once.
	//In this use case the useEffect is running every time the id in the url changes.
	//We put another function (loadUsers) inside the arrow function because we wanted to use the async/await feature.

	useEffect(
		() => {
			const socket = io("http://10.0.3.2:3333", {
				query: { user: userId },
			})
			//we are writing the ip of our backend to create a websocket connection to it
			// and just by doing this the connection is created, we don't even need to use the socket variable.
			//But we will to send a message.
			//the second argument of the io method is optional, and represents additional information that can be sent

			socket.on("match", (dev) => {
				setDevMatch(dev)
			})
		},
		[ userId ],
	)

	async function handleDislike() {
		//since we put the buttons outside the map function we can't get the id of the clicked user, but we can get the id
		//by logic, since we use the zIndex value and the position='absolute' css styles to only show the user with the higher zIndex,
		//that in these case we made it to be always the first one in the users array we can get the top user by this:
		//const topUser = users[0]
		//or we can use the destructuring feature of JS and get not only the first index user, but also store the rest of the
		//array is a variable that we can name it rest.
		const [ topUser, ...rest ] = users

		await api.post(`/devs/${topUser._id}/dislikes`, null, {
			headers: {
				user: userId,
				//here we are sending the id of the current user, the one disliking. On the server we build in a way that the
				//active user id was send on the header. The header is the third argument in the POST method (different from the get method). The second argument
				//is the body that in our api we did not put, that is way is null.
			},
		})
		setUsers(rest)
		//setUsers is setting the users variable state (that is an array) to only return users that has an id different
		//than the one received as liked or disliked.
		//Despite being an array you can't change state with .push .slice and such. Because is a react state.
		//The only way to change it is with setState().
	}
	async function handleLike() {
		const [ topUser, ...rest ] = users
		await api.post(`/devs/${topUser._id}/likes`, null, {
			headers: {
				user: userId,
			},
		})
		setUsers(rest)
	}

	async function handleLogout() {
		await AsyncStorage.clear()
		navigation.navigate("Login")
	}

	return (
		<View style={styles.container}>
			<TouchableOpacity onPress={handleLogout}>
				<Image source={logo} style={styles.logo} />
			</TouchableOpacity>
			<View style={styles.cardsContainer}>
				{users.length === 0 ? (
					<Text style={styles.empty}>That's it for now</Text>
				) : (
					users.map((user, index) => (
						<View key={user._id} style={[ styles.card, { zIndex: users.length - index } ]}>
							<Image style={styles.avatar} source={{ uri: user.avatar }} />
							<View style={styles.footer}>
								<Text style={styles.name}>{user.name}</Text>
								<Text style={styles.bio} numberOfLines={3}>
									{user.bio}
								</Text>
							</View>
						</View>
					))
				)}
			</View>

			{users.length > 0 && (
				<View style={styles.buttonsContainer}>
					<TouchableOpacity style={styles.button} onPress={handleDislike}>
						<Image source={dislike} />
					</TouchableOpacity>
					<TouchableOpacity style={styles.button} onPress={handleLike}>
						<Image source={like} />
					</TouchableOpacity>
				</View>
			)}

			{devMatch && (
				<View style={styles.matchContainer}>
					<Image style={styles.matchImage} source={itsamatch} alt="it's a match" />
					<Image source={{ uri: devMatch.avatar }} style={styles.matchAvatar} alt="liked user avatar" />
					<Text style={styles.matchName}>{devMatch.name}</Text>
					<Text style={styles.matchBio}>{devMatch.bio}</Text>
					<TouchableOpacity onPress={() => setDevMatch(null)} type="button">
						<Text style={styles.matchClose}>Close</Text>
					</TouchableOpacity>
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		alignItems: "center",
		justifyContent: "space-between",
	},

	logo: {
		marginTop: 30,
	},

	cardsContainer: {
		flex: 1,
		alignSelf: "stretch",
		justifyContent: "center",
		maxHeight: 500,
	},

	card: {
		position: "absolute",
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		margin: 30,
		overflow: "hidden",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	avatar: {
		flex: 1,
		height: 300,
	},
	footer: {
		backgroundColor: "#fff",
		paddingHorizontal: 20,
		paddingVertical: 15,
	},
	name: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#333",
	},
	bio: {
		fontSize: 14,
		color: "#999",
		marginTop: 5,
		lineHeight: 18,
	},
	buttonsContainer: {
		flexDirection: "row",
		marginBottom: 30,
	},
	button: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "#fff",
		justifyContent: "center",
		alignItems: "center",
		marginHorizontal: 20,
		elevation: 2,
	},
	empty: {
		alignSelf: "center",
		color: "#999",
		fontWeight: "bold",
		fontSize: 24,
	},
	matchContainer: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.8)",
		justifyContent: "center",
		alignItems: "center",
	},
	matchImage: {
		height: 60,
		resizeMode: "contain",
	},

	matchAvatar: {
		width: 160,
		height: 160,
		borderRadius: 80,
		borderWidth: 5,
		borderColor: "#fff",
		marginVertical: 30,
	},
	matchName: {
		fontSize: 26,
		fontWeight: "bold",
		color: "#fff",
	},
	matchBio: {
		marginTop: 10,
		fontSize: 16,
		color: "rgba(255,255,255,.8)",
		lineHeight: 24,
		textAlign: "center",
		paddingHorizontal: 30,
	},
	matchClose: {
		fontSize: 16,
		color: "rgba(255,255,255,.8)",
		textAlign: "center",
		marginTop: 30,
		fontWeight: "bold",
	},
})

export default List
