import React, { useContext, useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";
import uniqBy from "lodash/uniqBy";
import axios from "axios";
import Contact from "./Contact";

const Chat = () => {
	const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [offlinePeople, setOfflinePeople] = useState({});
	const [selectedUserId, setSelectedUserId] = useState(null);
	const { username, id,setId,setUsername } = useContext(UserContext);
	const [newMessageText, setNewMessageText] = useState("");
	const [messages, setMessages] = useState([]);
	const divUnderMessages = useRef();

    useEffect(() => {
        connectToWs();
		
    }, [selectedUserId]);
    function connectToWs() {
        const ws = new WebSocket("ws://localhost:4000");
				setWs(ws);
				ws.addEventListener("message", handleMessage);
                ws.addEventListener('close', () =>  {
      setTimeout(() => {
        console.log('Disconnected. Trying to reconnect.');
        connectToWs();
      }, 1000);
    });
        
    }

	function showOnlinePeople(peopleArray) {
		const people = {};
		peopleArray.forEach(({ userId, username }) => {
			people[userId] = username;
		});
		setOnlinePeople(people);
	}

	function handleMessage(ev) {
		const messageData = JSON.parse(ev.data);
		if ("online" in messageData) {
			showOnlinePeople(messageData.online);
        } else if ("text" in messageData) {
            if (messageData.sender === selectedUserId) {
                setMessages((prev) => [...prev, { ...messageData }]);
                
            }
			
			
		}
	}
     
    function logout() {
        axios.post('/logout').then(() => {
            setWs(null);
            setId(null);
            setUsername(null);
        })
    }
	function sendMessage(ev, file = null) {
		if (ev) ev.preventDefault();
		ws.send(
			JSON.stringify({
				recipient: selectedUserId,
				text: newMessageText,
				file,
			})
		);
		if (file) {
			axios.get("/messages/" + selectedUserId).then((res) => {
				setMessages(res.data);
			});
		} else {
			setNewMessageText("");
			setMessages((prev) => [
				...prev,
				{
					text: newMessageText,
					sender: id,
					recipient: selectedUserId,
					_id: Date.now(),
				},
			]);
		}
	}
	function sendFile(ev) {
		const reader = new FileReader();
		reader.readAsDataURL(ev.target.files[0]);
		reader.onload = () => {
			sendMessage(null, {
				name: ev.target.files[0].name,
				data: reader.result,
			});
		};
	}
	useEffect(() => {
		const div = divUnderMessages.current;
		if (div) {
			div.scrollIntoView({ behavior: "smooth", block: "end" });
		}
    }, [messages]);
    

    useEffect(() => {
        axios.get('/people').then(res => {
            const offlinePeopleArr = res.data.filter(p => p._id !== id).filter(p => !Object.keys(onlinePeople).includes(p._id));
            const offlinePeople = {};
            offlinePeopleArr.forEach(p => {
                offlinePeople[p._id] = p;
            })
            setOfflinePeople(offlinePeople);
        })
    },[onlinePeople])
    useEffect(() => {
        if (selectedUserId) {
            axios.get('/messages/' + selectedUserId).then(res => {
                setMessages(res.data)
            })
        }
    }, [selectedUserId]);

	const onlinePeopleExcludingOurUser = { ...onlinePeople };
	delete onlinePeopleExcludingOurUser[id];

	const messagesWithoutDupes = uniqBy(messages, "_id");

	return (
		<div className="h-screen flex">
			<div className="bg-white w-1/3 flex flex-col">
				<div className="flex-grow">
					<Logo />
					{Object.keys(onlinePeopleExcludingOurUser).map((userId) => (
						<Contact
							key={userId}
							id={userId}
							online={true}
							username={onlinePeopleExcludingOurUser[userId]}
							onClick={() => setSelectedUserId(userId)}
							selected={userId === selectedUserId}
						/>
					))}
					{Object.keys(offlinePeople).map((userId) => (
						<Contact
							key={userId}
							id={userId}
							online={false}
							username={offlinePeople[userId].username}
							onClick={() => setSelectedUserId(userId)}
							selected={userId === selectedUserId}
						/>
					))}
				</div>
				<div className="p-2 text-center flex items-center gap-2 justify-center">
					<span className="mr-2 text-md flex items-center gap-2 ">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
							/>
						</svg>
						{username}
					</span>
					<button
						onClick={logout}
						className="border  rounded-sm bg-zinc-300 text-lg p-2"
					>
						Logout
					</button>
				</div>
			</div>

			<div className="bg-zinc-300 w-2/3 p-2 flex flex-col">
				<div className="flex-grow">
					{!selectedUserId && (
						<div className="flex h-full items-center justify-center">
							<div className="text-lg">Start your conversation</div>
						</div>
					)}

					{!!selectedUserId && (
						<div className="relative h-full">
							<div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
								{messagesWithoutDupes.map((message) => (
									<div
										key={message._id}
										className={
											message.sender === id ? "text-right" : "text-left"
										}
									>
										<div
											className={
												"text-left inline-block p-2 my-2 rounded-md text-lg " +
												(message.sender === id ? "bg-blue-100" : "bg-gray-100")
											}
										>
											{/* sender:{message.sender}
											<br />
											my id:{id} */}
											<br />
											{message.text}
											{message.file && (
												<div className="">
													<a
														target="_blank"
														className="flex items-center gap-1 border-b"
														href={
															axios.defaults.baseURL +
															"/uploads/" +
															message.file
														}
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 24 24"
															fill="currentColor"
															className="w-4 h-4"
														>
															<path
																fillRule="evenodd"
																d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
																clipRule="evenodd"
															/>
														</svg>
														{message.file}
													</a>
												</div>
											)}
										</div>
									</div>
								))}
								<div ref={divUnderMessages}></div>
							</div>
						</div>
					)}
				</div>
				{!!selectedUserId && (
					<form className="flex gap-2" onSubmit={sendMessage}>
						<input
							type="text"
							value={newMessageText}
							onChange={(ev) => setNewMessageText(ev.target.value)}
							placeholder="Type your message...."
							className="bg-white border rounded-sm flex-grow mb-2"
						/>
						<label className="bg-zinc-400 p-2 text-white border rounded-sm mb-2 cursor-pointer">
							<input type="file" className="hidden" onChange={sendFile} />

							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
								/>
							</svg>
						</label>
						<button
							type="submit"
							className="bg-zinc-500 p-2 text-white border rounded-sm mb-2"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-6"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
								/>
							</svg>
						</button>
					</form>
				)}
			</div>
		</div>
	);
};

export default Chat;
