import { Route, Redirect } from 'react-router-dom';
import axios from 'axios';

interface Props {
    path: string;
    component: any;
}

const ProtectedRoute = (props: Props) => {
    var BackURL = process.env.REACT_APP_BACK
    if (!BackURL) {
        BackURL = "http://127.0.0.1:8081"
    }

    const jwt = localStorage.getItem("jwt");
    if (jwt) {
        axios.get(`${BackURL}/user/me`, { headers: { "Authorization": `Bearer ${jwt}` } })
            .then().catch(function (error) {
                if (error.response.status === 401) {
                    console.log('status:', error.response.status);
                    localStorage.removeItem("jwt");
                    window.location.reload();
                }
            })
        return <Route {...props} />
    }
    return <Redirect to="/signin" />

}
export default ProtectedRoute;

