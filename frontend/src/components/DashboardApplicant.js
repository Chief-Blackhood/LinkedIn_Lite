import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { setErrorMsg } from '../app/generalSlice';
import { DataGrid } from '@material-ui/data-grid';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
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

export default function DashboardApplicant() {
    const [rows, setRows] = useState();
    const [search, setSearch] = useState('');
    const [workFromHome, setWorkFromHome] = useState(false);
    const [fullTime, setFullTime] = useState(false);
    const [partTime, setPartTime] = useState(false);
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');
    const [duration, setDuration] = useState('');
    const [sort, setSort] = useState('');
    const [order, setOrder] = useState('');
    const [openSort, setOpenSort] = useState(false);
    const [openOrder, setOpenOrder] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [jobId, setJobId] = useState('');
    const [sop, setSop] = useState('');
    const [reload, setReload] = useState(true);
    const dispatch = useDispatch();
    const classes = useStyles();

    const openDialogFunc = id => {
        setJobId(id);
        setOpenDialog(true);
    };

    const applyToJob = async () => {
        try {
            // console.log(jobId, sop);
            await axios.post(`http://localhost:4000/api/job/${jobId}/apply`, {
                sop
            });
        } catch (err) {
            if (err.response.data.msg)
                dispatch(setErrorMsg({ msg: err.response.data.msg }));
            else dispatch(setErrorMsg({ msg: 'Something went wrong' }));
        }
        setSop('');
        setOpenDialog(false);
        setReload(true);
    };

    const columns = [
        { field: 'title', headerName: 'Title', width: 200 },
        {
            field: 'name',
            headerName: 'Recuiter name',
            width: 200,
            valueGetter: params => `${params.getValue('userId').name}`
        },
        { field: 'salary', headerName: 'Salary', width: 130 },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 130,
            valueFormatter: params => {
                const length = params.value.length || '0';
                let sum = 0.0;
                for (let i = 0; i < length; i++)
                    sum += Number(params.value[i].rate * 10) / 10;
                let avg = Number(length) !== 0 ? sum / length : 0;
                return `${avg.toFixed(1)}/5.0 (${length})`;
            }
        },
        { field: 'duration', headerName: 'Duration', width: 120 },
        {
            field: 'deadline',
            headerName: 'Deadline',
            width: 250,
            valueFormatter: params => {
                const date = new Date(params.value);
                return date.toGMTString();
            }
        },
        {
            field: 'Apply',
            headerName: 'Apply',
            width: 150,
            renderCell: params => {
                const typeToShow = params.getValue('remaining');
                const id = params.getValue('id');
                const status = params.getValue('status');
                // console.log(status);
                if (status === 'applied') {
                    return (
                        <strong>
                            <Button
                                variant="contained"
                                size="small"
                                style={{ marginLeft: 13 }}
                            >
                                Applied
                            </Button>
                        </strong>
                    );
                } else {
                    if (typeToShow > 0) {
                        return (
                            <strong>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    style={{ marginLeft: 16 }}
                                    onClick={() => openDialogFunc(id)}
                                >
                                    Apply
                                </Button>
                            </strong>
                        );
                    } else {
                        return (
                            <strong>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    style={{ marginLeft: 16 }}
                                >
                                    Filled
                                </Button>
                            </strong>
                        );
                    }
                }
            }
        }
    ];

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/job');
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
    formatRows = formatRows.filter(el => el.title.includes(search));
    if (!workFromHome)
        formatRows = formatRows.filter(el => el.typeOfJob !== 'Work from home');
    if (!fullTime) formatRows = formatRows.filter(el => el.typeOfJob !== 'Full-time');
    if (!partTime) formatRows = formatRows.filter(el => el.typeOfJob !== 'Part-time');
    if (minSalary) formatRows = formatRows.filter(el => el.salary >= minSalary);
    if (maxSalary) formatRows = formatRows.filter(el => el.salary <= maxSalary);
    if (duration) formatRows = formatRows.filter(el => el.duration < duration);
    if (sort) {
        if (order) {
            if (order === 'Asc') {
                if (sort === 'Salary')
                    formatRows = formatRows.sort((a, b) => a.salary - b.salary);
                if (sort === 'Duration')
                    formatRows = formatRows.sort((a, b) => a.duration - b.duration);
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
                if (sort === 'Salary')
                    formatRows = formatRows.sort((a, b) => b.salary - a.salary);
                if (sort === 'Duration')
                    formatRows = formatRows.sort((a, b) => b.duration - a.duration);
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
    // console.log(sort, order);
    // console.log(sop, jobId);
    console.log(formatRows);

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        className={classes.text}
                        variant="outlined"
                        fullWidth
                        label="Search"
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                        }}
                    />
                </Grid>
            </Grid>
            <Divider />
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
                    <MenuItem value="Salary">Salary</MenuItem>
                    <MenuItem value="Duration">Duration</MenuItem>
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
            <TextField
                className={classes.salary}
                variant="outlined"
                label="Min Value"
                value={minSalary}
                onChange={e => {
                    setMinSalary(Number(e.target.value));
                }}
            />
            <TextField
                className={classes.salary}
                variant="outlined"
                label="Max Value"
                value={maxSalary}
                onChange={e => {
                    setMaxSalary(Number(e.target.value));
                }}
            />
            <TextField
                className={classes.salary}
                variant="outlined"
                label="Duration"
                value={duration}
                onChange={e => {
                    setDuration(Number(e.target.value));
                }}
            />
            <Divider />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={workFromHome}
                        onChange={e => setWorkFromHome(e.target.checked)}
                        name="workFromHome"
                    />
                }
                label="Work From Home"
            />

            <FormControlLabel
                control={
                    <Checkbox
                        checked={fullTime}
                        onChange={e => setFullTime(e.target.checked)}
                        name="fullTime"
                    />
                }
                label="Full Time"
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={partTime}
                        onChange={e => setPartTime(e.target.checked)}
                        name="partTime"
                    />
                }
                label="Part Time"
            />
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
                <DialogTitle id="form-dialog-title">Statement of Purpose</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        To apply to this job, please enter your sop here.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="sop"
                        label="SOP"
                        fullWidth
                        multiline
                        rows={4}
                        value={sop}
                        onChange={e => setSop(e.target.value)}
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
                    <Button onClick={() => applyToJob()} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
