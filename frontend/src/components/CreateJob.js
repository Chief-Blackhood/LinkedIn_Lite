import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { setErrorMsg } from '../app/generalSlice';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Autocomplete from '@material-ui/lab/Autocomplete';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import AddRoundedIcon from '@material-ui/icons/AddRounded';

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
        margin: theme.spacing(3, 1.2, 0)
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200
    }
}));

export default function CreateJob() {
    const dispatch = useDispatch();
    const history = useHistory();
    const classes = useStyles();
    const date = new Date();
    const [data, setData] = useState({
        title: '',
        maxApplication: '',
        maxPosition: '',
        deadline: date.toISOString(),
        skillset: [],
        typeOfJob: '',
        duration: '',
        salary: ''
    });
    const [openType, setOpenType] = React.useState(false);
    const [openDuration, setOpenDuration] = React.useState(false);

    const onChange = e => {
        e.preventDefault();

        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/api/job', data);
            console.log(response.data);
            setData({
                title: '',
                maxApplication: '0',
                maxPosition: '0',
                deadline: '',
                skillset: [],
                typeOfJob: '',
                duration: '0',
                salary: '0'
            });
            history.push('/dashboard/recuiter');
        } catch (err) {
            if (err.response.data.msg)
                dispatch(setErrorMsg({ msg: err.response.data.msg }));
            else dispatch(setErrorMsg({ msg: 'Something went wrong' }));
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <AddRoundedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Create Job
                </Typography>
                <form className={classes.form} noValidate onSubmit={onSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                autoComplete="title"
                                name="title"
                                variant="outlined"
                                required
                                fullWidth
                                label="Title"
                                value={data.title}
                                autoFocus
                                onChange={onChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="maxApplication"
                                label="Maximum number of applications"
                                value={data.maxApplication}
                                onChange={onChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="maxPosition"
                                label="Maximum number of positions"
                                value={data.maxPosition}
                                onChange={onChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
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
                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                id="tags-filled"
                                options={languages.map(option => option.title)}
                                freeSolo
                                fullWidth
                                defaultValue={data.skillset}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            variant="outlined"
                                            label={option}
                                            {...getTagProps({ index })}
                                        />
                                    ))
                                }
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        variant="filled"
                                        label="Skills"
                                        name="skills"
                                        placeholder="Favorites"
                                    />
                                )}
                                onChange={(e, value) => {
                                    setData({ ...data, skillset: value });
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl className={classes.formControl}>
                                <InputLabel
                                    id="demo-controlled-open-select-label"
                                    className={classes.type}
                                >
                                    Type of Job
                                </InputLabel>
                                <Select
                                    labelId="demo-controlled-open-select-label"
                                    id="demo-controlled-open-select"
                                    open={openType}
                                    name="typeOfJob"
                                    fullWidth
                                    onClose={() => {
                                        setOpenType(false);
                                    }}
                                    onOpen={() => {
                                        setOpenType(true);
                                    }}
                                    value={data.typeOfJob}
                                    onChange={onChange}
                                >
                                    <MenuItem value="Full-time">Full-time</MenuItem>
                                    <MenuItem value="Part-time">Part-time</MenuItem>
                                    <MenuItem value="Work from home">
                                        Work from home
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl className={classes.formControl}>
                                <InputLabel
                                    id="demo-controlled-open-select-label"
                                    className={classes.type}
                                >
                                    Duration
                                </InputLabel>
                                <Select
                                    labelId="demo-controlled-open-select-label"
                                    id="demo-controlled-open-select"
                                    open={openDuration}
                                    name="duration"
                                    fullWidth
                                    onClose={() => {
                                        setOpenDuration(false);
                                    }}
                                    onOpen={() => {
                                        setOpenDuration(true);
                                    }}
                                    value={data.duration}
                                    onChange={onChange}
                                >
                                    <MenuItem value="0">0</MenuItem>
                                    <MenuItem value="1">1</MenuItem>
                                    <MenuItem value="2">2</MenuItem>
                                    <MenuItem value="3">3</MenuItem>
                                    <MenuItem value="4">4</MenuItem>
                                    <MenuItem value="5">5</MenuItem>
                                    <MenuItem value="6">6</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="salary"
                                label="Salary"
                                value={data.salary}
                                onChange={onChange}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Add Job
                    </Button>
                </form>
            </div>
        </Container>
    );
}

const languages = [
    { title: 'C' },
    { title: 'C++' },
    { title: 'Java' },
    { title: 'Python' },
    { title: 'Ruby' },
    { title: 'Javascript' },
    { title: 'Qt' },
    { title: 'kotlin' }
];
