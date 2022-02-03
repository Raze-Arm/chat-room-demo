
import {combineReducers} from "redux";
import {roomReducer} from "./room";
import {mediaReducer} from "./media";



export default combineReducers({
    room: roomReducer,
    media: mediaReducer
});