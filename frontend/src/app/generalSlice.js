import { createSlice } from '@reduxjs/toolkit';

const generalSlice = createSlice({
    name: 'general',
    initialState: {
        role: null,
        error: ''
    },
    reducers: {
        setRole(state, action) {
            state.role = action.payload.type;
        },
        setErrorMsg(state, action) {
            state.error = action.payload.msg;
        },
        removeErrorMsg(state, action) {
            state.error = '';
        }
    }
});

export const { setRole, setErrorMsg, removeErrorMsg } = generalSlice.actions;

export default generalSlice.reducer;
