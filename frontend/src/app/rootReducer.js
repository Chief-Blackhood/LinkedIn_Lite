import { combineReducers } from 'redux';
import generalReducer from './generalSlice';

export default combineReducers({
    general: generalReducer // define your reducers here
});
