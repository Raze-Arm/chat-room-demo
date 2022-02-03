import {
    SET_CAM_STREAM,
    SET_MEDIA_CONSTRAINTS,
    SET_MEDIA_SOURCE,
    SET_SCREEN_STREAM
} from "../actions/types";


const INITIAL_STATE = {
    camStream: null,
    screenStream: null,
    stream: null,
    mediaConstraints: {video: true, audio: true},
    source: 'camera',
}


export const mediaReducer = (state = INITIAL_STATE, action) => {

    switch (action.type) {
        case SET_CAM_STREAM: {
            const camStream = action.payload;
            if(!camStream) return state;
           // const {stream} = state;
           // if(stream) {
           //     state.stream.getVideoTracks().forEach(track => track.stop());
           //     state.stream.getAudioTracks().forEach(track => track.stop());
           // }
            return {...state, camStream , stream: camStream};
        }
        case SET_SCREEN_STREAM: {
            const screenStream = action.payload;
            if(!screenStream) return state;
            // const {stream} = state;
            // if(stream) {
            //     state.stream.getVideoTracks().forEach(track => track.stop());
            //     state.stream.getAudioTracks().forEach(track => track.stop());
            // }
            return {...state, screenStream , stream: screenStream};
        }
        case SET_MEDIA_CONSTRAINTS: {
            const constraints = action.payload;
            const  {video, audio } = constraints;
            const stream = state.stream;
            if(stream) {
                    //  stream.getVideoTracks().forEach(track => track.enabled = video)
                    // stream.getAudioTracks().forEach(track => track.enabled = audio);
                if(video === false) stream.getVideoTracks().forEach(track => track.stop() )
                if(audio === false) stream.getAudioTracks().forEach(track => track.stop() )
            }
            return {...state, mediaConstraints:  action.payload, stream: stream};
        }
        case SET_MEDIA_SOURCE: {
            const source = action.payload;
            return {...state, source};
        }

        default: {
            return state;
        }
    }
}