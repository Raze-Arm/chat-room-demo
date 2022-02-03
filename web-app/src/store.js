import {createStore, compose} from "redux";

import reducers from './reducers';
import {EXIT} from "./actions/types";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = (state, action) => {
    if(action.type  === EXIT) {
        return reducers(undefined, action);
    }
    return reducers(state, action);
};

const store = createStore(rootReducer, composeEnhancers());



export default store;