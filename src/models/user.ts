import { ObjectId } from "mongodb";

export interface User {
    _id?: ObjectId;
    displayName: string;
    photoURL?: string;
    darkTheme: boolean;
}