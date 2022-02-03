import _ from "lodash";
import {ADD_MESSAGE, CLEAR_MESSAGES, SET_USERS, SET_ROOMS, SET_SOCKET, SET_USERNAME} from "../actions/types";


const INITIAL_STATE = {
    username: '',
    socket: null,
    rooms: {},
    users: {},
    messages: [],
}


export const roomReducer = (state = INITIAL_STATE, action) => {

    switch (action.type) {
        case SET_USERNAME: {
            return {...state, username: action.payload};
        }
        case SET_SOCKET : {
            return {...state, socket: action.payload};
        }
        case SET_ROOMS: {
            return {...state, rooms: _.mapKeys(action.payload , 'name')};
        }
        case SET_USERS: {
            return  {...state, users: action.payload};
        }
        case ADD_MESSAGE :{
            return  {...state, messages: [...state.messages, action.payload]}
        }
        case CLEAR_MESSAGES: {
            return  {...state, messages:  []};
        }
        default: {
            return state;
        }
    }


}