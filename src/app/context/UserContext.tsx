import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";

export type UserType = {
    uuid: string;
    userRole: "student" | "faculty" | undefined;
    status: "loggedIn" | "notLoggedIn";
};

export type UserContextType = {
    user: UserType;
    setUser: Dispatch<SetStateAction<UserType>>;
};

type UserProviderProps = {
    children: ReactNode;
};

const defaultUser: UserType = {
    uuid: "",
    userRole: "faculty",
    status: "notLoggedIn"
};

export const UserContext = createContext<UserContextType>({
    user: defaultUser,
    setUser: () => {},
}); // Provide default value instead of undefined

export const UserProvider = ({ children }: UserProviderProps) => {
    const [user, setUser] = useState<UserType>(defaultUser);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};