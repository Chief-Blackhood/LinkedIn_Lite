import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeErrorMsg } from '../app/generalSlice';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function ErrorHandler() {
    const msg = useSelector(state => state.general.error);
    const dispatch = useDispatch();

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        dispatch(removeErrorMsg());
    };

    return (
        <div>
            <Snackbar open={msg !== ''} autoHideDuration={3000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error">
                    {msg}
                </Alert>
            </Snackbar>
        </div>
    );
}
