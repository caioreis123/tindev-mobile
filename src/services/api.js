import axios from "axios"

const api = axios.create({
	baseURL: "http://10.0.3.2:3333",
	//10.0.3.2 is the ip of the Genymotion so the emulator can access this localhost that is not in his virtual machine
	//10.0.2.2 is the ip of the Android Studio
	//or you can keep it as localhost by running
	// $adb reverse tcp:3333 tcp:3333
	//this tells the android that instead of looking for his own port:3333 look for the port:3333 of my laptop
	//(the second port is from my laptop, while the first is from the android)
})

export default api
