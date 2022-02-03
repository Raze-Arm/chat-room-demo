import React , {useState, useEffect} from "react";
import {connect} from "react-redux";
import _ from 'lodash';

import './VideoList.css';
import VideoItem from "./VideoItem";
import {Dimmer, Loader} from "semantic-ui-react";
import LocalVideo from "./LocalVideo";


import {addMessage} from '../actions/room';

const peerConnectionConfig = {
    'iceServers': [
        // {'urls': 'stun:stun.gmx.net:3478'},
        // {'urls': 'stun:stun.stunprotocol.org:3478'},
        // {'urls': 'stun:stun.l.google.com:19302'},
        // {
        //     url: 'turn:turn.anyfirewall.com:443?transport=tcp',
        //     credential: 'webrtc',
        //     username: 'webrtc'
        // },
        // {
        //     url: 'turn:numb.viagenie.ca',
        //     credential: 'muazkh',
        //     username: 'webrtc@live.com'
        // },
    ]
};

const VideoContainer = ({ socket, addMessage,username, room, roomId}) => {

    const [readyToJoin , setReadyToJoin] = useState(false);

    useEffect(() => {
        if(readyToJoin) {
            socket.send(JSON.stringify({type: 'join_room', from: username, data: roomId}))
            socket.addEventListener('message' , function (msg) {
                const message = JSON.parse(msg.data);
                if(message.type === 'text') {
                    // dispatch({type: 'ADD_MESSAGE', payload: {from: message.from, text: message.data}})
                    addMessage({from: message.from, text: message.data});
                }
            })
        }
    } , [readyToJoin])



    function handleGetUserMediaError(error) {
        switch(error.name) {
            case "NotFoundError":
                alert("Unable to open your call because no camera and/or microphone were found.");
                break;
            case "SecurityError":
            case "PermissionDeniedError":
                break;
            default:
                alert("Error opening your camera and/or microphone: " + error.message);
                break;
        }
    }
    return (
        <div className={'video-grid'}>

            <LocalVideo   roomId={roomId}  setReadyToJoin={setReadyToJoin}   />
            {_.chain(room?.users).filter((u) => u !== username).map((r) => {

                if(!readyToJoin) return <div key={r}>Loading...</div>;
                return (

                    <PeerVideo key={r}   roomId={roomId} username={username}  remoteUser={r}
                                    />
                );
            }).value()}
        </div>
    );
}



const PeerVideo = ({ username, remoteUser ,roomId}) => {
    const [loading, setLoading ]= useState(false);
    useEffect(() => {
        if(loading) {
            setTimeout(() => {
                setLoading(false)
            }, 5000);
        }
    } ,[loading])
    if(loading) return <Dimmer.Dimmable className={'video-grid__item'} dimmed >
        <Loader active={loading} style={{border: 0}} />
    </Dimmer.Dimmable>;
    return (
        <React.Fragment>
            <VideoItem key={remoteUser}    remoteUser={remoteUser}
                       username={username}  peerConnectionConfig={peerConnectionConfig} roomId={roomId} resetVideo={() => setLoading(true)}   />
        </React.Fragment>
    );
}


const mapStateToProps = (state, props) => {
    const roomId = props.roomId;
    const {username, rooms , socket} = state.room;
    const room = rooms[roomId];


    const {stream} = state.media;
    return {username, room: room , socket, stream};
}

export default connect(mapStateToProps, {addMessage})(VideoContainer);