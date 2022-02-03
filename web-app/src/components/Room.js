import React, { useState} from "react";
import {connect} from "react-redux";
import _ from 'lodash';
import {Divider, Grid, Header} from "semantic-ui-react";

import './Room.css'
import VideoContainer from "./VideoList";


const Room = ({ username, socket, messages,room,  roomId}) => {





    const renderUserMessage = (msg, color) => {
        return (
           <div>
               { msg.from !== username ? <div style={{color: `${color ? color : 'black'}`}} className={` message`}>
                       <b>{msg.from}: </b>
                       <div>
                           {msg.text}
                       </div>
                   </div> :
                   <div style={{color: `${color ? color : 'black'}`, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', }}>
                       <div/>
                       <div className={'blue message'}>
                           {msg.text}
                       </div>
                   </div> }
           </div>
        );
    }


    const renderRoomUsers = () => {
        return (
            <React.Fragment>
                <Header textAlign={"center"}>Users</Header>
                <Divider fitted />
                {_.map(room?.users, (u , i) => {
                     return (
                        <React.Fragment key={i}>
                            <div  style={{fontWeight: "bold" , fontSize: '12px', padding: '6px 6px'}}  >
                                {u}
                            </div>
                            <Divider fitted style={{backgroundColor: 'rgba(208, 173, 0, 0.1)'}} />
                        </React.Fragment>
                    );
                    return ;
                })
                }
            </React.Fragment>
        );
    }
    const renderChats =() => {
        return (
                <div className={'chat'} >
                    <div className={'chat__clients'}>
                        {renderRoomUsers()}
                    </div>
                    <div className={'chat__messages'}>

                        {_.map(messages, (m, i) => (
                            <React.Fragment key={i}>
                                {renderUserMessage(m)}
                            </React.Fragment>
                        ))}
                    </div>
                    <ChatInput onSend={(value) => {
                        return socket.send(JSON.stringify({type: 'text', from: username, data: value, room: roomId}));
                    }} />
                </div>

        );
    }


    const renderMedias = () => {

        return (
            <div style={{margin: '50px 0 0 10px'}}>
                <VideoContainer  roomId={roomId}/>
            </div>
        );
    }




    return (
        <div >

            <Grid  id={'room'} stackable >
                <Grid.Row  style={{padding: '8px 0 0 0'}}>
                    <Grid.Column largeScreen={11}  >{renderMedias()}</Grid.Column>
                    <Grid.Column largeScreen={5}  >{renderChats()}</Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    );
}

const ChatInput = ({onSend}) => {
    const [value, setValue] = useState('');

    const  onSendHandler = () => {
        onSend(value)
        setValue('')
    }
    return (
        <div className={'chat__inputs'}>
            <input  value={value} onKeyDown={(e) =>{
                if(e.key === 'Enter') onSendHandler();
            } }  onChange={event => setValue(event.target.value) } />
            <button onClick={onSendHandler}>Send</button>
        </div>
    );
}


const mapStateToProps = (state, props) => {
    const roomId = props.roomId;
    const {username, socket, messages, rooms } = state.room;
    const room = rooms[roomId];
    return {username, socket, messages, room };
}

export default connect(mapStateToProps, {})(Room);