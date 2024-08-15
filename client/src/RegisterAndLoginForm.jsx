import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "./UserContext";


export default function Register() {
    const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	
	const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
	

    const {setUsername:setLoggedInUsername,setId}= useContext(UserContext);

    async function handleSubmit(ev) {
		ev.preventDefault();
		const url = isLoginOrRegister === 'register' ? 'register' : 'login';

        
        const { data } = await axios.post(url, { username, password });
        setLoggedInUsername(username);
        setId(data.id);
    }
    return (
			<div className="bg-blue-50 h-screen flex items-center">
				<form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
					<input
						value={username}
						onChange={(ev) => setUsername(ev.target.value)}
						type="text"
						placeholder="Username"
						className="block w-full rounded-sm p-2 mb-2 border"
					/>
					<input
						value={password}
						onChange={(ev) => setPassword(ev.target.value)}
						type="text"
						placeholder="Password"
						className="block w-full rounded-sm p-2 mb-2 border"
					/>
					<button className="bg-blue-500 text-white block w-full rounded-sm p-2">
						{isLoginOrRegister === "register" ? "Register" : "Login"}
					</button>
				<div className="text-center mt-2 flex ">
					
					<div className="mx-2  p-1">
						{isLoginOrRegister === "register" ? 'Already a member?' : 'Not a member?'}
					</div>

						{isLoginOrRegister === "register" && (
							<button
								onClick={() => {
									setIsLoginOrRegister("login");
								}}
								className="bg-zinc-300 border rounded p-1"
							>
								Login here!
							</button>
						)}
						{isLoginOrRegister === "login" && (
							<button
								onClick={() => {
									setIsLoginOrRegister("register");
								}}
								className="bg-zinc-300 border rounded p-1"
							>
								Register here!
							</button>
						)}
					</div>
				</form>
			</div>
		);
}