import React from "react";
import {Switch, Route, Router, Redirect} from 'react-router-dom';

import history from "./history";
import Login from "./components/Login";
import RoomPage from "./components/RoomPage";


const Routes = () => {


    return (
        <Router history={history}>
                <Switch>
                    <Route exact path={'/'} >
                        <Redirect to={'/login'} />
                    </Route>
                    <Route exact path={'/login'} component={Login} />
                    <Route exact path={'/room'} component={RoomPage} />
                    <Route exact path={'/room/:id'} component={RoomPage} />
                    <Routes />

                </Switch>
        </Router>
    );
}

export default Routes;