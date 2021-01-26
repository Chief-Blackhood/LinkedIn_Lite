import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setErrorMsg } from '../app/generalSlice';
import { DataGrid } from '@material-ui/data-grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function MyApplications() {
    const [rows, setRows] = useState();
    const [reload, setReload] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [rate, setRate] = useState();
    const [jobId, setJobId] = useState('');
    const dispatch = useDispatch();

    const openDialogFunc = id => {
        setJobId(id);
        setOpenDialog(true);
    };

    const rateJob = async () => {
        try {
            // console.log(jobId, sop);
            await axios.post(`http://localhost:4000/api/job/${jobId}/rate`, {
                rating: rate
            });
        } catch (err) {
            if (err.response.data.msg)
                dispatch(setErrorMsg({ msg: err.response.data.msg }));
            else dispatch(setErrorMsg({ msg: 'Something went wrong' }));
        }
        setRate();
        setOpenDialog(false);
        setReload(true);
    };

    const columns = [
        { field: 'title', headerName: 'Title', width: 140 },
        {
            field: 'name',
            headerName: 'Recuiter name',
            width: 170
        },
        { field: 'salary', headerName: 'Salary', width: 130 },
        { field: 'status', headerName: 'Status', width: 130 },
        {
            field: 'dateOfAcceptence',
            headerName: 'Date Of Joining',
            width: 250,
            valueFormatter: params => {
                const status = params.getValue('status');
                if (
                    status === 'rejected' ||
                    status === 'applied' ||
                    status === 'shortlisted'
                )
                    return `-- Not Applicable --`;
                else {
                    const date = new Date(params.value);
                    return date.toGMTString();
                }
            }
        },
        {
            field: 'Rate',
            headerName: 'Rate',
            renderCell: params => {
                const status = params.getValue('status');
                if (status === 'accepted') {
                    const id = params.getValue('job');
                    return (
                        <strong>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => openDialogFunc(id)}
                            >
                                Rate
                            </Button>
                        </strong>
                    );
                } else {
                    return <></>;
                }
            }
        }
    ];

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/application');
                setRows(response.data);
            } catch (err) {
                console.log(err);
                if (err.response.data.msg)
                    dispatch(setErrorMsg({ msg: err.response.data.msg }));
                else dispatch(setErrorMsg({ msg: 'Something went wrong' }));
            }
            setReload(false);
        };
        if (reload) getData();
    }, [dispatch, reload]);

    let formatRows = rows || [];

    return (
        <>
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={formatRows.map(el => ({ ...el, id: el._id }))}
                    columns={columns}
                    pageSize={5}
                />
            </div>
            <Dialog
                open={openDialog}
                onClose={() => {
                    setOpenDialog(false);
                }}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">Rating</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To rate this job, please enter a number(integer) between (1-5)
                        here.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Rating"
                        fullWidth
                        value={rate}
                        onChange={e => setRate(Number(e.target.value))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setOpenDialog(false);
                        }}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button onClick={() => rateJob()} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
