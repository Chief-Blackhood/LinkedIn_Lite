import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { setErrorMsg } from '../app/generalSlice';
import { DataGrid } from '@material-ui/data-grid';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Divider from '@material-ui/core/Divider';

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

export default function ViewApplication() {
    const [rows, setRows] = useState();
    const [reload, setReload] = useState(true);
    const [sort, setSort] = useState('');
    const [order, setOrder] = useState('');
    const [openSort, setOpenSort] = useState(false);
    const [openOrder, setOpenOrder] = useState(false);
    const dispatch = useDispatch();
    const params = useParams();
    const classes = useStyles();

    const statusUpdate = async (id, text) => {
        try {
            await axios.patch(
                `http://localhost:4000/api/application/${id}/status_update`,
                {
                    status: text
                }
            );
        } catch (err) {
            if (err.response.data.msg)
                dispatch(setErrorMsg({ msg: err.response.data.msg }));
            else dispatch(setErrorMsg({ msg: 'Something went wrong' }));
        }
        setReload(true);
    };

    const columns = [
        {
            field: 'name',
            headerName: 'Name',
            width: 120,
            valueFormatter: params => {
                return `${params.getValue('jobApplicant').name}`;
            }
        },
        {
            field: 'skills',
            headerName: 'Skills',
            width: 150,
            valueFormatter: params => {
                return params.getValue('jobApplicant').skills;
            }
        },
        {
            field: 'dateOfPosting',
            headerName: 'Date of Application',
            width: 240,
            valueFormatter: params => {
                const date = new Date(params.value);
                return date.toGMTString();
            }
        },
        { field: 'sop', headerName: 'SOP', width: 300 },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 120,
            valueFormatter: params => {
                const rating = params.getValue('jobApplicant').rating;
                const length = rating.length || '0';
                let sum = 0.0;
                for (let i = 0; i < length; i++) sum += Number(rating[i].rate * 10) / 10;
                let avg = Number(length) !== 0 ? sum / length : 0;
                return `${avg.toFixed(1)}/5.0 (${length})`;
            }
        },
        {
            field: 'Education',
            headerName: 'Education',
            width: 240,
            valueFormatter: params => {
                return params.getValue('jobApplicant').education.map(el => {
                    if (el.endYear)
                        return `${el.institution} ${el.startYear} ${el.endYear}`;
                    else return `${el.institution} ${el.startYear}`;
                });
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150
        },
        {
            field: 'Shortlist/Accept',
            headerName: 'Shortlist/Accept',
            width: 150,
            renderCell: params => {
                const id = params.getValue('id');
                const status = params.getValue('status');
                if (status === 'applied')
                    return (
                        <strong>
                            <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                onClick={() => statusUpdate(id, 'shortlisted')}
                            >
                                Shortlist
                            </Button>
                        </strong>
                    );
                else if (status === 'shortlisted')
                    return (
                        <strong>
                            <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                onClick={() => statusUpdate(id, 'accepted')}
                            >
                                Accept
                            </Button>
                        </strong>
                    );
                else return <></>;
            }
        },
        {
            field: 'Reject',
            headerName: 'Reject',
            width: 150,
            renderCell: params => {
                const id = params.getValue('id');
                const status = params.getValue('status');
                if (status !== 'accepted')
                    return (
                        <strong>
                            <Button
                                variant="contained"
                                size="small"
                                color="primary"
                                onClick={() => statusUpdate(id, 'rejected')}
                            >
                                Reject
                            </Button>
                        </strong>
                    );
                else return <></>;
            }
        }
    ];

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:4000/api/application/${params.id}`
                );
                setRows(response.data);
            } catch (err) {
                if (err.response.data.msg)
                    dispatch(setErrorMsg({ msg: err.response.data.msg }));
                else dispatch(setErrorMsg({ msg: 'Something went wrong' }));
            }
            setReload(false);
        };
        if (reload) getData();
    }, [dispatch, params.id, reload]);
    // console.log(rows);

    let formatRows = rows ? [...rows] : [];
    if (sort) {
        if (order) {
            if (order === 'Asc') {
                if (sort === 'Name')
                    formatRows = formatRows.sort((a, b) => {
                        if (a.jobApplicant.name < b.jobApplicant.name) {
                            return -1;
                        }
                        if (a.jobApplicant.name > b.jobApplicant.name) {
                            return 1;
                        }
                        return 0;
                    });
                if (sort === 'Date of Application')
                    formatRows = formatRows.sort((a, b) => {
                        if (a.dateOfPosting < b.dateOfPosting) {
                            return -1;
                        }
                        if (a.dateOfPosting > b.dateOfPosting) {
                            return 1;
                        }
                        return 0;
                    });
                if (sort === 'Rating')
                    formatRows = formatRows.sort((a, b) => {
                        const lengtha = a.jobApplicant.rating.length;
                        const lengthb = b.jobApplicant.rating.length;
                        let suma = 0;
                        let sumb = 0;
                        for (let i = 0; i < lengtha; i++)
                            suma += a.jobApplicant.rating[i].rate;
                        for (let i = 0; i < lengthb; i++)
                            sumb += b.jobApplicant.rating[i].rate;
                        return suma - sumb;
                    });
            } else if (order === 'Des') {
                if (sort === 'Name')
                    formatRows = formatRows.sort((a, b) => {
                        if (a.jobApplicant.name < b.jobApplicant.name) {
                            return 1;
                        }
                        if (a.jobApplicant.name > b.jobApplicant.name) {
                            return -1;
                        }
                        return 0;
                    });
                if (sort === 'Date of Application')
                    formatRows = formatRows.sort((a, b) => {
                        if (a.dateOfPosting < b.dateOfPosting) {
                            return 1;
                        }
                        if (a.dateOfPosting > b.dateOfPosting) {
                            return -1;
                        }
                        return 0;
                    });
                if (sort === 'Rating')
                    formatRows = formatRows.sort((a, b) => {
                        const lengtha = a.jobApplicant.rating.length;
                        const lengthb = b.jobApplicant.rating.length;
                        let suma = 0;
                        let sumb = 0;
                        for (let i = 0; i < lengtha; i++)
                            suma += a.jobApplicant.rating[i].rate;
                        for (let i = 0; i < lengthb; i++)
                            sumb += b.jobApplicant.rating[i].rate;
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
                    <MenuItem value="Date of Application">Date of Application</MenuItem>
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
                <DataGrid
                    rows={formatRows.map(el => ({ ...el, id: el._id }))}
                    columns={columns}
                    pageSize={5}
                />
            </div>
        </>
    );
}
