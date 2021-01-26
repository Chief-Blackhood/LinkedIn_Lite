import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { setErrorMsg } from '../app/generalSlice';
import { DataGrid } from '@material-ui/data-grid';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles(theme => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3)
    },
    add: {
        margin: theme.spacing(3, 20, 2)
    },
    text: {
        margin: theme.spacing(3, 0, 2)
    },
    salary: {
        margin: theme.spacing(3, 1, 2)
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    }
}));

export default function DashboardRecuiter() {
    const history = useHistory();
    const [rows, setRows] = useState();
    const [data, setData] = useState({
        maxApplication: '',
        maxPosition: '',
        deadline: '',
        id: ''
    });
    const [openDialog, setOpenDialog] = useState(false);
    const [reload, setReload] = useState(true);
    const dispatch = useDispatch();
    const classes = useStyles();

    const openDialogFunc = id => {
        const jobData = rows.filter(el => {
            if (el._id === id) return true;
            return false;
        });
        setData({
            maxApplication: jobData[0].maxApplication,
            maxPosition: jobData[0].maxPosition,
            deadline: jobData[0].deadline,
            id
        });
        setOpenDialog(true);
    };

    const updateJob = async () => {
        try {
            console.log(data);
            await axios.patch(`http://localhost:4000/api/job/${data.id}`, data);
        } catch (err) {
            if (err.response.data.msg)
                dispatch(setErrorMsg({ msg: err.response.data.msg }));
            else dispatch(setErrorMsg({ msg: 'Something went wrong' }));
        }
        setData({
            maxApplication: '',
            maxPosition: '',
            deadline: ''
        });
        setOpenDialog(false);
        setReload(true);
    };

    const deleteJob = async id => {
        try {
            await axios.delete(`http://localhost:4000/api/job/${id}`, data);
        } catch (err) {
            if (err.response.data.msg)
                dispatch(setErrorMsg({ msg: err.response.data.msg }));
            else dispatch(setErrorMsg({ msg: 'Something went wrong' }));
        }
        setReload(true);
    };

    const viewApplicant = id => {
        history.push(`/jobApplicant/${id}`);
    };

    const columns = [
        { field: 'title', headerName: 'Title', width: 200 },
        {
            field: 'dateOfPosting',
            headerName: 'Date of Posting',
            width: 250,
            valueFormatter: params => {
                const date = new Date(params.value);
                return date.toGMTString();
            }
        },
        { field: 'numberOfApplicant', headerName: 'Number of Applicant', width: 200 },
        { field: 'remaining', headerName: 'Position left', width: 150 },
        {
            field: 'Update',
            headerName: 'Update',
            width: 150,
            renderCell: params => {
                const id = params.getValue('id');
                return (
                    <strong>
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            onClick={() => openDialogFunc(id)}
                        >
                            Update
                        </Button>
                    </strong>
                );
            }
        },
        {
            field: 'Delete',
            headerName: 'Delete',
            width: 150,
            renderCell: params => {
                const id = params.getValue('id');

                return (
                    <strong>
                        <Button
                            variant="contained"
                            size="small"
                            color="secondary"
                            onClick={() => deleteJob(id)}
                        >
                            Delete
                        </Button>
                    </strong>
                );
            }
        },
        {
            field: 'View',
            headerName: 'View',
            width: 150,
            renderCell: params => {
                const id = params.getValue('id');

                return (
                    <strong>
                        <Button
                            variant="contained"
                            size="small"
                            color="primary"
                            onClick={() => viewApplicant(id)}
                        >
                            View
                        </Button>
                    </strong>
                );
            }
        }
    ];

    const onChange = e => {
        e.preventDefault();

        const { name } = e.target;
        let { value } = e.target;
        if (name === 'maxApplication' || name === 'maxPosition') value = Number(value);
        setData({ ...data, [name]: value });
    };

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/job/mine');
                setRows(response.data);
            } catch (err) {
                if (err.response.data.msg)
                    dispatch(setErrorMsg({ msg: err.response.data.msg }));
                else dispatch(setErrorMsg({ msg: 'Something went wrong' }));
            }
            setReload(false);
        };
        if (reload) getData();
    }, [dispatch, reload]);
    // console.log(rows);

    let formatRows = rows ? [...rows] : [];
    // console.log(sort, order);
    // console.log(sop, jobId);
    // console.log(formatRows);

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
                <DialogTitle id="form-dialog-title">Update Job</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Fill the fields you want to update.
                    </DialogContentText>
                    <Grid item xs={12} className={classes.text}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            name="maxApplication"
                            label="Max number of applications"
                            value={data.maxApplication}
                            onChange={onChange}
                        />
                    </Grid>
                    <Grid item xs={12} className={classes.text}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            name="maxPosition"
                            label="Max number of positions"
                            value={data.maxPosition}
                            onChange={onChange}
                        />
                    </Grid>
                    <Grid item xs={12} className={classes.text}>
                        <form className={classes.container} noValidate>
                            <TextField
                                id="datetime-local"
                                label="Deadline"
                                type="datetime-local"
                                name="deadline"
                                className={classes.textField}
                                value={data.deadline}
                                InputLabelProps={{
                                    shrink: true
                                }}
                                onChange={onChange}
                            />
                        </form>
                    </Grid>
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
                    <Button onClick={() => updateJob()} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
