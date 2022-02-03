import { SET_CAM_STREAM, SET_MEDIA_CONSTRAINTS, SET_MEDIA_SOURCE, SET_SCREEN_STREAM} from "./types";


export const setCamStream = (stream) => {
    return {type: SET_CAM_STREAM, payload: stream};
}

export const setScreenStream = (stream) => {
    return {type: SET_SCREEN_STREAM, payload: stream};
}



export const setMediaConstraints = (constraints) => {
    return {type: SET_MEDIA_CONSTRAINTS, payload: constraints};
}

export const setMediaSource = (source) => {
    return {type: SET_MEDIA_SOURCE, payload: source};
}