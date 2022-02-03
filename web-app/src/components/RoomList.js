import React, {useState} from "react";
import {connect} from "react-redux";
import _ from 'lodash';
import {Button, Confirm, Divider, Grid, Header, Icon, Input, Label} from "semantic-ui-react";
import RoomItem from "./RoomItem";

import './RoomList.css'
import history from "../history";




const RoomList = ({username , socket, users, rooms}) => {
    const [activeItem, setActiveItem] = useState(null);
    const [open, setOpen] = useState(false);


    const onAddRoom = (name) => {
        if(!name) return ;
        socket.send(JSON.stringify({type: 'add_room', data: name, }))
    }

    const onJoinRoom = () => {
        history.push(`/room/${activeItem}?username=${username}`)
    }
    return (
        <React.Fragment>
           <RoomForm open={open} onCancel={() => setOpen(false)} onAdd={(name) => onAddRoom(name)} />
            <div className={'rooms-grid'}   >
                <div   className={'rooms-container'} >
                    <Header textAlign={"center"}>Rooms
                        <Header.Subheader style={{color: 'green'}}>Online User:{_.size(users)}</Header.Subheader>
                    </Header>
                    {activeItem ? <span id={'join_room'} onClick={() => onJoinRoom() } >Join Room <Icon name={'plus'} /></span> : ''}
                    <Divider />
                    <Grid    centered    className={'rooms-list'} >
                        <Grid.Row centered >
                            {_.map(rooms, (r , i) => {
                                return (
                                    <Grid.Column key={i} largeScreen={3} computer={4} tablet={5} mobile={6} >
                                        <RoomItem active={activeItem === r.name} onClick={() => setActiveItem(r.name)} room={r} />
                                    </Grid.Column>
                                );
                            })}

                        </Grid.Row>
                    </Grid>

                    <Divider inverted />
                    <div style={{display: 'flex', justifyContent: "space-between"}}>
                        <div/>
                        <Button secondary inverted onClick={() => setOpen(true)}>Create</Button>
                    </div>

                </div>
            </div>
        </React.Fragment>

    );
}


const RoomForm = ({open , onCancel , onAdd}) => {
    const [value, setValue] = useState('');
    const [touched, setTouched] = useState(false);

    const onSubmit = () => {
        setValue('')
        onAdd(value);
        onCancel();
    }

    const renderRoomForm =() => {
        return (
            <div style={{padding: '12px 8px'}}>
                <Header size={"small"}>Name</Header>
                <Input value={value}  onChange={(e) => setValue(e.target.value)}
                       onFocus={() => setTouched(true)} onBlur={() => setTouched(false)}  onKeyDown={(e) =>{
                    if(e.key === 'Enter') {
                        onSubmit()
                    }
                } }  />
               <div>
                   {touched && !value ? <Label basic color={'red'}  pointing content={'Invalid room name'} /> : '' }
               </div>

            </div>
        );
    }
    return (
        <Confirm
            size={"tiny"}
            open={open}
            header={<Header style={{margin: 0 ,  padding: '25px 8px', textAlign: 'center'
                , backgroundColor: 'rgba(0, 147, 208, 1)', color: 'white'}}>New Room</Header>}
            content={renderRoomForm()}
            confirmButton={<Button primary content={'Add'} /> }
            cancelButton={<Button   content={'Cancel'} /> }
            onCancel={() => {
                setValue('')
                onCancel()
            }}
            onConfirm={onSubmit}
        />
    );
}

const mapStateToProps = (state) => {
    const {username , socket, users, rooms} = state.room;
    return {username , socket, users, rooms};
}


export default connect(mapStateToProps, {})(RoomList);