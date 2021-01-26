import { Provider as StoreProvider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import Profile from '../components/Home';
// import Main from '../components/Main';
import Login from '../components/login';
import Register from '../components/Register';
import UpdateProfile from '../components/UpdateProfile';
import ErrorHandler from '../components/ErrorHandler';
import DashboardApplicant from '../components/DashboardApplicant';
import MiniDrawer from '../components/templates/navbar';
import MyApplications from '../components/MyApplications';
import CreateJob from '../components/CreateJob';
import MyEmployees from '../components/MyEmployees';
import DashboardRecuiter from '../components/DashboardRecuiter';
import ViewApplication from '../components/ViewApplication';

import './App.css';

import store from './store';

function App() {
    return (
        <StoreProvider store={store}>
            <Router>
                <ErrorHandler />
                <Switch>
                    <Route path="/login" exact component={Login} />
                    <Route path="/" exact component={Login} />
                    <Route path="/register" exact component={Register} />
                    <Route
                        path="/update/profile"
                        exact
                        component={() => (
                            <MiniDrawer>
                                <UpdateProfile />
                            </MiniDrawer>
                        )}
                    />
                    <Route
                        path="/createJob"
                        exact
                        component={() => (
                            <MiniDrawer>
                                <CreateJob />
                            </MiniDrawer>
                        )}
                    />
                    <Route
                        path="/myApplications"
                        exact
                        component={() => (
                            <MiniDrawer>
                                <MyApplications />
                            </MiniDrawer>
                        )}
                    />
                    <Route
                        path="/myEmployees"
                        exact
                        component={() => (
                            <MiniDrawer>
                                <MyEmployees />
                            </MiniDrawer>
                        )}
                    />
                    <Route
                        path="/dashboard/applicant"
                        exact
                        component={() => (
                            <MiniDrawer>
                                <DashboardApplicant />
                            </MiniDrawer>
                        )}
                    />
                    <Route
                        path="/dashboard/recuiter"
                        exact
                        component={() => (
                            <MiniDrawer>
                                <DashboardRecuiter />
                            </MiniDrawer>
                        )}
                    />
                    <Route
                        path="/jobApplicant/:id"
                        exact
                        component={() => (
                            <MiniDrawer>
                                <ViewApplication />
                            </MiniDrawer>
                        )}
                    />
                </Switch>
            </Router>
        </StoreProvider>
    );
}

export default App;
