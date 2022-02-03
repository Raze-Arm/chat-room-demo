import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import { getSupportedDevices} from "../utility/checkDeviceSupport";
import {Dropdown, Icon, Popup} from "semantic-ui-react";

export const peers = {};


const VideoItem = ({socket, username, remoteUser, peerConnectionConfig
                       , roomId, resetVideo, stream}) => {
    const [fullscreen, setFullscreen ] = useState(false);

    console.log('stream #######', stream)


    useEffect(() => {
        if(peers[remoteUser]?.pc && peers[remoteUser].sender)
            changeMedia();
    }, [stream?.id]);



    // useEffect(() => {
    //     const id = setInterval(() => {
    //         console.log('running ....');
    //         if(peers[remoteUser].pc  ) {
    //             if(peers[remoteUser].pc.remoteDescription === null) {
    //                 console.log('null remoteDescription');
    //                 sendToServer({
    //                     from: username,
    //                     type: 'negotiate',
    //                     room: roomId,
    //                     data: remoteUser
    //                 });
    //             }else {
    //                 console.log('removing interval')
    //                 clearInterval(id);
    //             }
    //         }else {
    //             socket.addEventListener('message',messageHandler)
    //             sendNegotiateMessage()
    //         }
    //     }, 10000)
    //     return () => clearInterval(id);
    // }, [])




    window.onbeforeunload = function (e) {
        stop()
    };


    const remoteVideoRef = useRef();

    useEffect(() => {
        if(!peers[remoteUser])peers[remoteUser] = {};
        if(peers[remoteUser].pc) {
            console.log('STOPPING CONNECTION ...');
            stop();
        }
        peers[remoteUser].pc = null;
            socket.addEventListener('message',messageHandler)
            sendNegotiateMessage()

        return () => {
            console.log('REMOVING VIDEO ITEM');
            socket.removeEventListener('message',messageHandler)
            stop();
        };

        }
        , []);

    function messageHandler (msg) {
        let message = JSON.parse(msg.data);
        let from = message.from;
        switch (message.type) {
            case 'negotiate': {
                if( message.room === roomId && from === remoteUser ) {
                    console.log('message ', message)
                    createOfferMessage();
                }
                break;
            }
            case 'reset': {
                if(from === remoteUser && message.data === username && message.room === roomId) {
                    resetVideo();
                    socket.removeEventListener('message',messageHandler)
                }
                break;
            }
            case 'offer': {
                console.log('message ', message)
                if(from === remoteUser)
                    handleOfferMessage(message);
                break;
            }
            case "answer": {
                if(from === remoteUser &&  peers[remoteUser].pc )
                    handleAnswerMessage(message);
                break;
            }
            case "ice": {
                if(from === remoteUser &&  peers[remoteUser].pc)
                handleNewICECandidateMessage(message);
                break;
            }
            default: {
                return;
            }

        }
    }



    function sendNegotiateMessage()  {
        if (!peers[remoteUser].pc  || peers[remoteUser].pc.signalingState === 'closed' ) {
            sendToServer({
                from: username,
                type: 'negotiate',
                room: roomId,
                data: remoteUser
            });
        }
    }

    function resetConnection() {
        sendToServer({
            from: username,
            type: 'reset',
            room: roomId,
            data: remoteUser
        });
        resetVideo();
        socket.removeEventListener('message',messageHandler)

    }



    function createPeerConnection() {
        if(peers[remoteUser].pc) stop();
        peers[remoteUser].pc = new RTCPeerConnection(peerConnectionConfig);
        peers[remoteUser].pc.oniceconnectionstatechange = function () {
            console.log('peer connection ice state ', peers[remoteUser].pc.iceConnectionState , remoteUser);
        }
        peers[remoteUser].pc.onsignalingstatechange = function(event) {
            switch (peers[remoteUser].pc.signalingState) {
                case "stable":
                    if(!peers[remoteUser].iceCandidate) return;
                    let candidate = new RTCIceCandidate(peers[remoteUser].iceCandidate);
                    if(candidate && peers[remoteUser].pc.localDescription && peers[remoteUser].pc.remoteDescription?.type )
                        peers[remoteUser].pc.addIceCandidate(candidate).catch((e) => console.log('ICE Error ', e));
                    console.log('Signaling State: Stable');
                    break;
                case "closed":
                    console.log('Signaling State: Closed');
                    break;


            }
        }
        peers[remoteUser].pc.onconnectionstatechange = function(event) {
            console.log('Peer connection ', peers[remoteUser].pc.connectionState)
            switch(peers[remoteUser].pc.connectionState) {
                case "connected":
                    break;
                case "disconnected":
                case "failed":
                    console.log('Peer connection ', peers[remoteUser].pc.connectionState , "event##", event)
                    // createOfferMessage();
                    resetConnection();
                    break;
                case "closed":
                    console.log('Peer connection closed')
                    break;
            }
        }
        peers[remoteUser].pc.addEventListener("icegatheringstatechange",  ev => {
            switch(peers[remoteUser].pc.iceGatheringState) {
                case "new":
                    console.log('Ice New')
                    break;
                case "gathering":
                    console.log('Ice Gathering')
                    break;
                case "complete":
                    console.log('Ice  Complete')
                    if(remoteVideoRef.current) {
                        remoteVideoRef.current.play().catch(e => console.log('Failed to play video ', e));
                    }
                    break;
            }
        });
        peers[remoteUser].pc.onicecandidate = handleICECandidateEvent;
        peers[remoteUser].pc.ontrack = handleTrackEvent;

    }
    function getMedia() {
        if( peers[remoteUser].pc){
            console.log('getting media ...' )
             getSupportedDevices().then(({hasMicrophone, hasWebcam}) => {
                 if(stream && !peers[remoteUser].sender)
                     stream.getTracks().forEach(track => peers[remoteUser].sender = peers[remoteUser].pc.addTrack(track, stream) );

             });
        }
    }

    function changeMedia() {
        if(stream)
            stream.getTracks().forEach(track => peers[remoteUser].sender.replaceTrack(track));
    }

    function stop() {
        if (peers[remoteUser].pc) {
            console.log('disconnect all our event listeners')
            // disconnect all our event listeners
            peers[remoteUser].pc.onicecandidate = null;
            peers[remoteUser].pc.ontrack = null;
            peers[remoteUser].pc.onnegotiationneeded = null;
            peers[remoteUser].pc.oniceconnectionstatechange = null;
            peers[remoteUser].pc.onsignalingstatechange = null;
            peers[remoteUser].pc.onicegatheringstatechange = null;
            peers[remoteUser].pc.onnotificationneeded = null;
            peers[remoteUser].pc.onremovetrack = null;
            // Stop the videos
            if (remoteVideoRef.current || remoteVideoRef.current?.srcObject) {
                if(remoteVideoRef.current.srcObject && remoteVideoRef.current.srcObject.getTracks() !== null)
                    remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
                remoteVideoRef.current.pause();
                // remoteVideoRef.current.srcObject = null;
            }

            // peers[remoteUser].pc.removeTrack(peers[remoteUser].sender);
            // close the peer connection
            peers[remoteUser].videoSender = null;
            peers[remoteUser].audioSender = null;
            peers[remoteUser].sender = null;
            peers[remoteUser].pc.close();
            peers[remoteUser].pc = null;

            if(peers[remoteUser].iceCandidate) peers[remoteUser].iceCandidate= null;
            // setMyPeerConnection(null);
        }
    }
    function handleNegotiationNeededEvent() {
        if(peers[remoteUser].pc.signalingState !== 'stable' ) return ;
        // peers[remoteUser].pc.createOffer().then(function(offer) {
        peers[remoteUser].pc.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: true}).then(function(offer) {
            return peers[remoteUser].pc.setLocalDescription(offer);
        })
            .then(function() {
                sendToServer({
                    from: username,
                    type: 'offer',
                    room: roomId,
                    sdp: peers[remoteUser].pc.localDescription,
                    data: remoteUser
                });
            })
            .catch((e) => {
                console.log('Error ', e);
                resetConnection()

            });
    }


     function createOfferMessage() {
        createPeerConnection();

         if(stream) {
             getMedia();
             peers[remoteUser].pc.onnegotiationneeded = handleNegotiationNeededEvent;
         } else {
             handleNegotiationNeededEvent();
         }

    }


    function handleICECandidateEvent(event) {
        if (event.candidate) {
            sendToServer({
                from: username,
                type: 'ice',
                room: roomId,
                candidate: event.candidate,
                data: remoteUser
            });
        }
    }
     const handleTrackEvent =  (event) => {
        if(remoteVideoRef.current) {
            console.log('track event', event)
            // if(remoteVideoRef.current.srcObject && remoteVideoRef.current.srcObject.getTracks() !== null)
            //     remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            remoteVideoRef.current.srcObject = event.streams[0];
            // await remoteVideoRef.current.play();
            remoteVideoRef.current.addEventListener('loadedmetadata',  function () {
                console.log('video on loaded meta data');
                 if(remoteVideoRef.current) {
                     // remoteVideoRef.current.muted = true;

                     remoteVideoRef.current.play().catch(e => console.log('Failed to play video ', e));
                 }
            })

        }
    }

    function handleOfferMessage(message) {
        createPeerConnection();
        let desc = new RTCSessionDescription(message.sdp);
        //TODO test this
        if(peers[remoteUser].pc.signalingState !== 'stable' ) return ;
        if (desc !== null && message.sdp !== null) {
            peers[remoteUser].pc.setRemoteDescription(desc)
                .then(function () {
                    if(stream)
                      stream.getTracks().forEach(track => peers[remoteUser].sender = peers[remoteUser].pc.addTrack(track, stream) );
                })
                .then(function () {
                    return peers[remoteUser].pc.createAnswer();
                })
                .then(function (answer) {
                    return peers[remoteUser].pc.setLocalDescription(answer);
                })
                .then(function () {
                    sendToServer({
                        from: username,
                        type: 'answer',
                        room: roomId,
                        sdp: peers[remoteUser].pc.localDescription,
                        data: remoteUser
                    });
                })
                .catch((e) => {
                    console.log('Error handleOfferMessage', e);
                    resetConnection()
                })
        }
    }

    function handleAnswerMessage(message) {
            peers[remoteUser].pc.setRemoteDescription(message.sdp).catch((e) => {
                console.log('Error ', e);
                resetConnection()
            });

    }

    function handleNewICECandidateMessage(message) {
        if(peers[remoteUser].pc) {
            if( peers[remoteUser].pc.signalingState === 'stable') {
                let candidate = new RTCIceCandidate(message.candidate);
                if(candidate && peers[remoteUser].pc.localDescription && peers[remoteUser].pc.remoteDescription?.type )
                    peers[remoteUser].pc.addIceCandidate(candidate).catch((e) => console.log('ICE Error ', e));

            } else {
                peers[remoteUser].iceCandidate = message.candidate;
            }


        }
    }


    function sendToServer(msg) {
        let msgJSON = JSON.stringify(msg);
            if(socket.readyState === WebSocket.OPEN )
            socket.send(msgJSON);

    }

    return (
        <div className={'video-grid__item'}  >
            <h4  >{remoteUser}</h4>
            <div className={`${fullscreen ? 'fullscreen' : ''}`} style={{position: 'relative', objectFit: 'cover', width: '100%', height: '100%'}}>
                <video     ref={remoteVideoRef}  />
                <div style={{width: 'fit-content' , height: '30px', color: 'white', zIndex: '1'
                    , position: 'absolute' ,top: '5px', right: '0px', background: 'transparent' }} >
                    <Popup trigger={<Icon onClick={() => setFullscreen(!fullscreen)} name={`${fullscreen ? 'compress' : 'expand'}`} link size={"large"} /> }
                           content={`${fullscreen ? 'Exit full screen' : 'Full screen'}`} /></div>
                <div style={{width: 'fit-content' , height: '30px', color: 'white', zIndex: '1', fontSize: 'large', fontWeight: 'bolder'
                    , position: 'absolute' ,top: '5px', left: '10px', background: 'transparent' }} >{fullscreen ? remoteUser : ''}</div>
            </div>
        </div>
    );

}

const mapStateToProps = (state) => {
    const  {   stream} = state.media;
    const {socket} = state.room;
    return { socket, stream}
}

export default connect(mapStateToProps, {})(VideoItem);