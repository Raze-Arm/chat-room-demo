import React, { useState} from "react";
import { Grid} from "semantic-ui-react";


import './Login.css';
import history from "../history";

const Login = () => {
    const [username, setUsername] = useState('');
    // const [password, setPassword] = useState('');






    const onSubmit = (e) => {
        e.preventDefault();
        console.log('username', username)
        // if(password !== 'nopassword123456') return ;
        history.push(`/room?username=${username}`);
    }

    return (
        <div className={'blue-background'}>
            <div className={'login '}>
                <h1>Login</h1>
                <Grid centered>
                    <Grid.Row centered columns={"equal"}>
                        <Grid.Column>
                            <form onSubmit={onSubmit}>
                                <input className="username" onChange={(e) => setUsername(e.target.value)} placeholder="Enter Name" />
                                {/*<input className="username"  type={"password"} onChange={(e) => setPassword(e.target.value)}  placeholder={"Password"}/>*/}
                                <button  type={"submit"}  className="btn">Login</button>
                            </form>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        </div>
    );
}

export default Login;