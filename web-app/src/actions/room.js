import {ADD_MESSAGE, EXIT, SET_USERS, SET_ROOMS, SET_SOCKET, SET_USERNAME} from "./types";


export const setUsername = (username) => {
    return {type: SET_USERNAME, payload: username};
}


export const setSocket = (socket) => {
    return {type: SET_SOCKET, payload: socket};
}

export const setRooms = (rooms) => {
    return {type: SET_ROOMS, payload: rooms};
}

export const setUsers = (clients) => {
    return {type: SET_USERS , payload: clients};
}

export const addMessage = (message) => {
    return {type: ADD_MESSAGE, payload: message};
}

export const clearMessages = () => {
    return {type: ADD_MESSAGE};
}


export const exit = () => {
    return {type: EXIT};
}