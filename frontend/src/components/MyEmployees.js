import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setErrorMsg } from '../app/generalSlice';
import { DataGrid } from '@material-ui/data-grid';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

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

export default function MyEmployees() {
    const [rows, setRows] = useState();
    const [reload, setReload] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [rate, setRate] = useState();
    const [userId, setUserId] = useState('');
    const [sort, setSort] = useState('');
    const [order, setOrder] = useState('');
    const [openSort, setOpenSort] = useState(false);
    const [openOrder, setOpenOrder] = useState(false);
    const dispatch = useDispatch();
    const classes = useStyles();

    const openDialogFunc = id => {
        setUserId(id);
        setOpenDialog(true);
    };

    const rateJob = async () => {
        try {
            await axios.post(`http://localhost:4000/api/user/${userId}/rate`, {
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
        {
            field: 'name',
            headerName: 'Employee name',
            width: 170
        },
        {
            field: 'dateOfAcceptence',
            headerName: 'Date Of Joining',
            width: 250,
            valueFormatter: params => {
                const date = new Date(params.value);
                return date.toGMTString();
            }
        },
        { field: 'type', headerName: 'Type of Job', width: 170 },
        { field: 'title', headerName: 'Job Title', width: 170 },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 130,
            valueFormatter: params => {
                const length = params.getValue('rating').length || '0';
                let sum = 0.0;
                for (let i = 0; i < length; i++)
                    sum += Number(params.value[i].rate * 10) / 10;
                let avg = Number(length) !== 0 ? sum / length : 0;
                return `${avg.toFixed(1)}/5.0 (${length})`;
            }
        },
        {
            field: 'Rate',
            headerName: 'Rate',
            renderCell: params => {
                const id = params.getValue('id');
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
            }
        }
    ];

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:4000/api/application/accepted'
                );
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

    let formatRows = rows ? [...rows] : [];
    if (sort) {
        if (order) {
            if (order === 'Asc') {
                if (sort === 'Name')
                    formatRows = formatRows.sort((a, b) => {
                        if (a.name < b.name) {
                            return -1;
                        }
                        if (a.name > b.name) {
                            return 1;
                        }
                        return 0;
                    });
                if (sort === 'Job Title')
                    formatRows = formatRows.sort((a, b) => {
                        if (a.title < b.title) {
                            return -1;
                        }
                        if (a.title > b.title) {
                            return 1;
                        }
                        return 0;
                    });
                if (sort === 'Date of Joining')
                    formatRows = formatRows.sort((a, b) => {
                        if (a.dateOfJoining < b.dateOfJoining) {
                            return -1;
                        }
                        if (a.dateOfJoining > b.dateOfJoining) {
                            return 1;
                        }
                        return 0;
                    });
                if (sort === 'Rating')
                    formatRows = formatRows.sort((a, b) => {
                        const lengtha = a.rating.length;
                        const lengthb = b.rating.length;
                        let suma = 0;
                        let sumb = 0;
                        for (let i = 0; i < lengtha; i++) suma += a.rating[i].rate;
                        for (let i = 0; i < lengthb; i++) sumb += b.rating[i].rate;
                        return suma - sumb;
                    });
            } else if (order === 'Des') {
                if (sort === 'Name')
                    formatRows = formatRows.sort((a, b) => {
                        if (a.name < b.name) {
                            return 1;
                        }
                        if (a.name > b.name) {
                            return -1;
                        }
                        return 0;
                    });
                if (sort === 'Job Title')
                    formatRows = formatRows.sort((a, b) => {
                        if (a.title < b.title) {
                            return 1;
                        }
                        if (a.title > b.title) {
                            return -1;
                        }
                        return 0;
                    });
                if (sort === 'Date of Joining')
                    formatRows = formatRows.sort((a, b) => {
                        if (a.dateOfJoining < b.dateOfJoining) {
                            return 1;
                        }
                        if (a.dateOfJoining > b.dateOfJoining) {
                            return -1;
                        }
                        return 0;
                    });
                if (sort === 'Rating')
                    formatRows = formatRows.sort((a, b) => {
                        const lengtha = a.rating.length;
                        const lengthb = b.rating.length;
                        let suma = 0;
                        let sumb = 0;
                        for (let i = 0; i < lengtha; i++) suma += a.rating[i].rate;
                        for (let i = 0; i < lengthb; i++) sumb += b.rating[i].rate;
                        return sumb - suma;
                    });
            }
        }
    }

    return (
        <>
            <FormControl className={classes.formControl}>
                <InputLabel className={classes.type}>Sort</InputLabel>
                <Select
                    labelId="demo-controlled-open-select-label"
                    id="demo-controlled-open-select"
                    open={openSort}
                    name="sort"
                    fullWidth
                    onClose={() => {
                        setOpenSort(false);
                    }}
                    onOpen={() => {
                        setOpenSort(true);
                    }}
                    value={sort}
                    onChange={e => {
                        setSort(e.target.value);
                    }}
                >
                    <MenuItem value="Name">Name</MenuItem>
                    <MenuItem value="Job Title">Job Title</MenuItem>
                    <MenuItem value="Date of Joining">Date of Joining</MenuItem>
                    <MenuItem value="Rating">Rating</MenuItem>
                </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel className={classes.type}>Order</InputLabel>
                <Select
                    labelId="demo-controlled-open-select-label"
                    id="demo-controlled-open-select"
                    open={openOrder}
                    name="order"
                    fullWidth
                    onClose={() => {
                        setOpenOrder(false);
                    }}
                    onOpen={() => {
                        setOpenOrder(true);
                    }}
                    value={order}
                    onChange={e => {
                        setOrder(e.target.value);
                    }}
                >
                    <MenuItem value="Asc">Ascending</MenuItem>
                    <MenuItem value="Des">Descending</MenuItem>
                </Select>
            </FormControl>
            <Divider />
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid rows={formatRows} columns={columns} pageSize={5} />
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
                        To rate this employee, please enter a number(integer) between
                        (1-5) here.
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
