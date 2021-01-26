import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { setRole, setErrorMsg } from '../app/generalSlice';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Autocomplete from '@material-ui/lab/Autocomplete';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
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
        margin: theme.spacing(3, 1.5, 0)
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    }
}));

export default function SignUp() {
    const dispatch = useDispatch();
    const history = useHistory();
    const classes = useStyles();
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        type: '',
        education: [],
        skills: [],
        contactNo: 0,
        sop: ''
    });
    const [newEducation, setnewEducation] = useState({
        institution: ''
    });
    const [open, setOpen] = React.useState(false);

    const onChange = e => {
        e.preventDefault();

        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const addNewChange = e => {
        const { name } = e.target;
        let { value } = e.target;
        if (name === 'startYear' || name === 'endYear') value = Number(value);
        setnewEducation({ ...newEducation, [name]: value });
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:4000/api/core/register',
                data
            );
            const role = response.data.user.type;
            axios.defaults.headers.common = {
                'x-auth-token': response.data.token
            };
            dispatch(setRole({ type: role }));
            setData({
                name: '',
                email: '',
                password: '',
                type: '',
                education: [],
                skills: [],
                contactNo: 0,
                sop: ''
            });
            if (role === 'Job Applicant') history.push('/dashboard/applicant');
            else if (role === 'Recuiter') history.push('/dashboard/recuiter');
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
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign up
                </Typography>
                <form className={classes.form} noValidate onSubmit={onSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                autoComplete="name"
                                name="name"
                                variant="outlined"
                                required
                                fullWidth
                                id="name"
                                label="name"
                                value={data.name}
                                autoFocus
                                onChange={onChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                value={data.email}
                                autoComplete="email"
                                onChange={onChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                value={data.password}
                                autoComplete="current-password"
                                onChange={onChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl className={classes.formControl}>
                                <InputLabel
                                    id="demo-controlled-open-select-label"
                                    className={classes.type}
                                >
                                    Type
                                </InputLabel>
                                <Select
                                    labelId="demo-controlled-open-select-label"
                                    id="demo-controlled-open-select"
                                    open={open}
                                    name="type"
                                    fullWidth
                                    onClose={handleClose}
                                    onOpen={handleOpen}
                                    value={data.type}
                                    onChange={onChange}
                                >
                                    <MenuItem value="Job Applicant">
                                        Job Applicant
                                    </MenuItem>
                                    <MenuItem value="Recuiter">Recuiter</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {data.type === 'Recuiter' && (
                            <>
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        name="contactNo"
                                        label="contactNo"
                                        type="contactNo"
                                        id="contactNo"
                                        autoComplete="current-contactNo"
                                        onChange={onChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        id="outlined-multiline-static"
                                        label="Bio (Write something about yourself)"
                                        name="bio"
                                        multiline
                                        fullWidth
                                        rows={4}
                                        variant="outlined"
                                        onChange={onChange}
                                    />
                                </Grid>
                            </>
                        )}
                        {data.type === 'Job Applicant' && (
                            <>
                                {data.education.map((el, index) => {
                                    return (
                                        <>
                                            <Typography
                                                className={classes.text}
                                                variant="subtitle1"
                                                color="textPrimary"
                                            >
                                                Institution: {el.institution}
                                            </Typography>
                                            <Typography
                                                className={classes.text}
                                                variant="subtitle1"
                                            >
                                                startYear: {el.startYear}
                                            </Typography>
                                            {(el.endYear !== '' || el.endYear) && (
                                                <>
                                                    <Typography
                                                        className={classes.text}
                                                        variant="subtitle1"
                                                    >
                                                        endYear: {el.endYear}
                                                    </Typography>
                                                </>
                                            )}
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                className={classes.add}
                                                onClick={() => {
                                                    const tempEducation = [
                                                        ...data.education
                                                    ];
                                                    console.log(tempEducation);
                                                    tempEducation.splice(index, 1);
                                                    setData({
                                                        ...data,
                                                        education: [...tempEducation]
                                                    });
                                                }}
                                            >
                                                Delete
                                            </Button>
                                            <Divider />
                                        </>
                                    );
                                })}
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        id="institution"
                                        label="Institution"
                                        name="institution"
                                        value={newEducation.institution}
                                        onChange={addNewChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        required
                                        name="startYear"
                                        label="Start Year"
                                        type="number"
                                        id="startYear"
                                        value={String(newEducation.startYear)}
                                        onChange={addNewChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        variant="outlined"
                                        fullWidth
                                        name="endYear"
                                        label="End Year"
                                        type="number"
                                        id="endYear"
                                        value={String(newEducation.endYear)}
                                        onChange={addNewChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        className={classes.add}
                                        onClick={() => {
                                            setData({
                                                ...data,
                                                education: [
                                                    ...data.education,
                                                    newEducation
                                                ]
                                            });
                                            setnewEducation({
                                                institution: ''
                                            });
                                            console.log(newEducation);
                                        }}
                                    >
                                        Add
                                    </Button>
                                </Grid>
                                <Grid item xs={12}>
                                    <Autocomplete
                                        multiple
                                        id="tags-filled"
                                        options={languages.map(option => option.title)}
                                        freeSolo
                                        fullWidth
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
                                            console.log(value);
                                            setData({ ...data, skills: value });
                                        }}
                                    />
                                </Grid>
                            </>
                        )}
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        Sign Up
                    </Button>
                    <Grid container justify="flex-end">
                        <Grid item>
                            <Link to="/login" variant="body2">
                                Already have an account? Sign in
                            </Link>
                        </Grid>
                    </Grid>
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
