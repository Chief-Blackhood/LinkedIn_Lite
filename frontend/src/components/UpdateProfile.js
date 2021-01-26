import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
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
import Divider from '@material-ui/core/Divider';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';

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
    }
}));

export default function UpdateProfile() {
    const dispatch = useDispatch();
    const [reload, setReload] = useState(false);
    const classes = useStyles();
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        type: '',
        education: [],
        skills: [],
        contactNo: '0',
        bio: ''
    });
    const [newEducation, setnewEducation] = useState({
        institution: ''
    });
    const [open, setOpen] = React.useState(false);

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/user/me');
                console.log(response.data);
                if (response.data.type === 'Job Applicant') {
                    const {
                        name,
                        email,
                        password,
                        type,
                        bio,
                        education,
                        skills
                    } = response.data;
                    setData({
                        name,
                        email,
                        password,
                        type,
                        bio,
                        education,
                        skills
                    });
                } else if (response.data.type === 'Recuiter') {
                    const { name, email, password, type, contactNo, bio } = response.data;
                    setData({
                        name,
                        email,
                        password,
                        type,
                        contactNo: String(contactNo),
                        bio
                    });
                }
                setReload(false);
            } catch (err) {
                if (err.response.data.msg)
                    dispatch(setErrorMsg({ msg: err.response.data.msg }));
                else dispatch(setErrorMsg({ msg: 'Something went wrong' }));
            }
        };
        getData();
    }, [dispatch, reload]);

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
            const response = await axios.put('http://localhost:4000/api/user/me', data);
            console.log(response.data);
            setData({
                name: '',
                email: '',
                password: '',
                type: '',
                education: [],
                skills: [],
                contactNo: 0,
                bio: ''
            });
            setReload(true);
        } catch (err) {
            if (err.response.data.msg)
                dispatch(setErrorMsg({ msg: err.response.data.msg }));
            else dispatch(setErrorMsg({ msg: 'Something went wrong' }));
        }
    };

    console.log(data);

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <AccountCircleOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Update profile
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
                                disabled
                                label="Email Address"
                                name="email"
                                value={data.email}
                                autoComplete="email"
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
                                    disabled
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
                                        value={data.contactNo}
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
                                        value={data.bio}
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
                                        label="startYear"
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
                                        label="endYear"
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
                                        defaultValue={data.skills}
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
                        Update profile
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
