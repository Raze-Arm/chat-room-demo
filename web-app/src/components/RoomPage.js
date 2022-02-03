import React, {useState, useEffect} from "react";
import {connect} from "react-redux";
import  {useParams} from 'react-router-dom';
import _ from 'lodash';
import RoomList from "./RoomList";
import Room from "./Room";
import history from "../history";
import {Button, Confirm, Header, Menu} from "semantic-ui-react";
import {peers} from "./VideoItem";
import {checkDeviceSupport} from "../utility/checkDeviceSupport";


import {setUsername, setSocket, setUsers, setRooms, exit} from '../actions/room';




var timeout;
var pingInterval;

const RoomPage = ({setUsername, setSocket, setUsers, setRooms, exit, socket}) => {
    const [error, setError] = useState({type: '', message: ''});
    const {id} = useParams();  //roomId

    window.onbeforeunload = function (e) {
        if(socket) socket.close();
    };





    const username = new URLSearchParams(history.location.search).get('username');
    useEffect(() => {
        if(username) {
            setUsername(username);
            console.log('creating socket connection...', socket);
            // dispatch({type: 'SET_USERNAME', payload: username});
            if(!socket ) {
                createSocketConnection();

            }
        }

    // } ,  [socket]);
    } ,  []);


    function createSocketConnection() {
        let so;
        if(window.location.protocol === 'http:')
            so= new WebSocket(`ws://localhost:8080/signal` );
        // so= new WebSocket(`ws://${window.location.host}/signal` );
        else
            so = new WebSocket(`wss://${window.location.host}/signal` );



        so.onopen = function () {
            pingInterval = setInterval(() => ping(so), 30000);

            console.log('Socket connection successful')
            so.send(JSON.stringify({type: 'join', from: username, }));
            // dispatch({type: 'SET_SOCKET', payload: so});
            setSocket(so);
        }
        so.onclose = function() {
            history.push('/');
            clearInterval(pingInterval);
            clearTimeout(timeout);
        }
        so.onerror = function (event) {
            console.log('Socket connection error ', event);
        }

    }
    function ping(so) {
        so.send(JSON.stringify({type: '__ping__', from: username }));
        timeout = setTimeout(function () {
            clearInterval(pingInterval);
            //connection closed
        }, 5000);
    }

    function pong() {
        clearTimeout(timeout)
    }

    if(socket) {
        socket.onmessage = function (msg) {
            const message = JSON.parse(msg.data);
            switch (message.type) {
                case '__pong__': {
                    pong();
                    break;
                }
                case 'state':{
                    console.log('message ' ,message)
                    setUsers(message.users);
                    setRooms(message.rooms);
                    break;
                }
                case 'error': {
                    console.log('Error message ', message)
                    setError({type: 'join', message: message.data  });
                    break;
                }
                case 'room_error': {
                    console.log('Error message ', message)
                    setError({type: 'room', message: message.data  });

                }
            }


        }

    }

    const onExit = () => {
        _.forEach(peers , (peer, i) => {
            stopConnection(peer.pc);
        });
        stopMediaDevices();
        socket.close();
        exit()
        history.push('/')
    }
    const onLeave = () => {
        _.forEach(peers , (peer, i) => {
            stopConnection(peer.pc);
        });
        stopMediaDevices();
        history.push(`/room?username=${username}`);
        socket.send(JSON.stringify({type: 'leave_room', from: username, room: id }));
    }


    if(!socket ) return <div>Loading...</div>


    const onCancel = () => {
        if(error.type === 'join') {
            console.log('on close error modal')
            socket.close();
            exit();
            history.push('/');

        }
        if(error.type === 'room') {
            history.push(`/room?username=${username}`);
        }
        setError({type:  '', message: ''});

    };
    return (
        <React.Fragment>
            <Confirm
                size={"tiny"}
                open={!!error.message}
                header={<Header style={{margin: 0 ,  padding: '25px 8px', textAlign: 'center'
                    , backgroundColor: 'rgba(253,0,0, 0.8)', color: 'white'}}>Error</Header>}
                content={error.message}
                style={{fontWeight: 'bolder'}}
                confirmButton={<React.Fragment /> }

                cancelButton={<Button    content={'Cancel'} /> }
                onCancel={onCancel}

            />
            <Menu fixed={"top"} >
                <Menu.Item name={id ? 'Leave' : 'Exit'}  as={'a'} header onClick={() => id ? onLeave() : onExit()}/>
                <Menu.Item name={username} position={"right"} header />
            </Menu>
            <div>
                {!id  ? <RoomList  />
                    : <Room  roomId={id}/>}
            </div>
        </React.Fragment>
    );
}




function stopConnection(pc) {
    if (pc) {
        pc.onicecandidate = null;
        pc.ontrack = null;
        pc.onnegotiationneeded = null;
        pc.oniceconnectionstatechange = null;
        pc.onsignalingstatechange = null;
        pc.onicegatheringstatechange = null;
        pc.onnotificationneeded = null;
        pc.onremovetrack = null;

        pc.close();
        pc = null;

    }
}

function stopMediaDevices() {
    checkDeviceSupport(function (hasWebcam, hasMicrophone) {
        if(hasMicrophone || hasWebcam) {
            navigator.mediaDevices.getUserMedia({video: hasWebcam, audio: hasMicrophone})
                .then(function (stream) {
                    stream.getTracks().forEach(function(track) {
                        track.stop();
                    });
                }).catch(function (e) {
                console.log(e)
            });
        }
    })
}


const mapStateToProps = (state) => {
    const {username, socket} = state.room;
    return {username, socket};
}

export default connect(mapStateToProps, {setUsername, setSocket,  setUsers, setRooms, exit})(RoomPage);