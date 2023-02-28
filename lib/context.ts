import { createContext } from "react";

interface Ins{
    user: any,
    username: string | null
}

export const UserContext = createContext(<Ins>{ user: null, username: null });
