import React, {useState, useEffect, useRef} from "react";
import {connect} from "react-redux";
import {Dropdown, Icon, Popup} from "semantic-ui-react";
import {checkDeviceSupport} from "../utility/checkDeviceSupport";
import {getDisplayMedia, getUserMedia} from "../utility/getMediaDevices";

import {addMessage} from '../actions/room';


import {setCamStream, setScreenStream, setMediaConstraints, setMediaSource} from '../actions/media';

const LocalVideo = ({ source,  setReadyToJoin
                        ,mediaConstraints,  setCamStream, setScreenStream, setMediaConstraints, setMediaSource }) => {

    const localVideoRef = useRef();

    useEffect(() => {
        checkDeviceSupport(function (hasWebcam, hasMicrophone) {
            setMediaConstraints({ video: hasWebcam,  audio: hasMicrophone});
        })
    }, []);

    useEffect(() => {
        const {video , audio} = mediaConstraints;
        if(video ||  audio)
            getMedia();
    }, [mediaConstraints, source]);




    function getMedia() {
        const {video , audio} = mediaConstraints;
        checkDeviceSupport(function (hasWebcam, hasMicrophone) {
            const constraints = {video: hasWebcam && video, audio: hasMicrophone && audio};
            if(!constraints.video && !constraints.audio) {
                setReadyToJoin(true)
                return;
            }
            if(source === 'camera') {
                getUserMedia(constraints).then(getLocalMediaStream).finally(() => setReadyToJoin(true));
            }else {
                getDisplayMedia(constraints).then(getScreenMediaStream).finally(() => setReadyToJoin(true));
            }
        })
    }

    function  changeConstraints ({video, audio}) {

        checkDeviceSupport(function (hasWebcam, hasMicrophone) {

            const constraints = {video: hasWebcam && video, audio: hasMicrophone && audio};
            setMediaConstraints(constraints);
            // getMedia();
        })

    }

    async function getLocalMediaStream(mediaStream) {
        if(!mediaStream) {
            setCamStream(null);
            return;
        }
        if(localVideoRef.current) {
            setCamStream(mediaStream);
             localVideoRef.current.pause()
            localVideoRef.current.srcObject = mediaStream;
            localVideoRef.current.muted =true;
          await  localVideoRef.current.play();
        }

    }
    async function getScreenMediaStream(mediaStream) {
        if(!mediaStream) {
            setCamStream(null);
            return;
        }
        if(localVideoRef.current) {
            setScreenStream(mediaStream);
             localVideoRef.current.pause()

            localVideoRef.current.srcObject = mediaStream;
            localVideoRef.current.muted =true;
          await  localVideoRef.current.play();
        }
    }

    const renderVolumeIcon = () => {
        if(mediaConstraints.audio)
            return <Icon style={{fontSize: '16px', textAlign: 'center' }} name={'unmute'} link
                         onClick={() => changeConstraints({...mediaConstraints, audio: false})} />;
        return (
            <Icon style={{fontSize: '16px', textAlign: 'center' }} name={'mute'} link onClick={() => changeConstraints({...mediaConstraints, audio: true})} />
        );
    }

    const renderVideoIcon = () => {
        if(mediaConstraints.video)
            return <Icon name={'video camera'} link onClick={() => changeConstraints({...mediaConstraints, video: false})}  />
        return (
            <Icon.Group style={{fontSize: '16px'}} onClick={() => changeConstraints({...mediaConstraints, video: true})} >
                <Icon name={'video camera'} link  />
                <Icon corner name='cancel' color={'red'}  />
            </Icon.Group>
        );
    }
    return (
        <div className={'video-grid__item'}>
            <div style={{display: "flex", flexDirection: "row", alignItems: "baseline", gap: '0', justifyContent: "space-between"}}>
                <div />
                <h3 style={{margin: '0 0 0px 0px' , color: 'rgba(0, 147, 208, 1)'}} >You</h3>
                <span>
                    <Popup trigger={renderVolumeIcon()}  content={'audio'}  />
                    <Popup trigger={renderVideoIcon()} content={'video'}  />

                    <Dropdown floating icon={{name: 'ellipsis vertical'}} >
                        <Dropdown.Menu>
                            <Dropdown.Item disabled={!navigator.mediaDevices.getDisplayMedia} onClick={() => {
                                setMediaSource(source === 'camera' ? 'screen' : 'camera');
                                // getMedia()
                            }} >
                                Share  {source === 'camera' ? 'Screen' : 'Camera'} Video</Dropdown.Item>
                        </Dropdown.Menu>

                    </Dropdown>
                </span>
            </div>
            <video  ref={localVideoRef} />
        </div>
    );
}

const mapStateToProps = (state) => {
    const  {camStream, screenStream, mediaConstraints, source} = state.media;
    const  {socket , username} = state.room;
    return {socket , username, camStream, screenStream, mediaConstraints, source};
}

export default connect(mapStateToProps, {addMessage, setCamStream, setScreenStream, setMediaConstraints, setMediaSource})(LocalVideo);