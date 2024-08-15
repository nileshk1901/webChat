import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    

    const [username, setUsername] = useState(null);
    const [id, setId] = useState(null);


    useEffect(() => {
        axios
					.get("/profile", { withCredentials: true })
					.then((response) => {
						setId(response.data.userId);
						setUsername(response.data.username);
					})
					.catch((error) => {
						console.error("Error fetching profile:", error);
						if (error.response && error.response.status === 401) {
							// Handle unauthenticated state
							setId(null);
							setUsername(null);
						}
					});
    }, []);

    return (
        <UserContext.Provider value={{ username, setUsername, id, setId }}>
            {children}

        </UserContext.Provider>
    )

}