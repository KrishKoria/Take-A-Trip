import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {Users} from "./users/pages/users.jsx";
import {NewPlace} from "./places/pages/NewPlace.jsx";
import {MainNavigation} from "./shared/components/Navigation/MainNavigation.jsx";
import {UserPlaces} from "./places/pages/UserPlaces.jsx";
import {UpdatePlace} from "./places/pages/UpdatePlace.jsx";
import {Authenticate} from "./users/pages/Authenticate.jsx";
import {authContext} from "./shared/components/Util/Context/auth-context.jsx";
import {useState, useCallback, useEffect} from "react";
import React from "react";

let logoutTimer;

const App = () => {
    const [token, setToken] = useState();
    const [userId, setUserId] = useState(false);
    const [tokenExpirationDate, setTokenExpirationDate] = useState(Date);
    const login = useCallback((uid, token, expirationDate) => {
        setToken(token);
        const tokenDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
        localStorage.setItem('userData', JSON.stringify({
            userId: uid,
            token: token,
            expiration: tokenDate.toISOString()
        }))
        setTokenExpirationDate(tokenDate);
        setUserId(uid)
    }, [])
    const logout = useCallback(() => {
        setToken(null);
        localStorage.removeItem('userData');
        setTokenExpirationDate(null);
        setUserId(null)
    }, [])

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('userData'));
        if (storedData && storedData.token && new Date(storedData.expiration) > new Date()) {
            login(storedData.userId, storedData.token, new Date(storedData.expiration));
        }
    }, [login]);

    useEffect(() => {
        if(token && tokenExpirationDate){
            const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
            logoutTimer = setTimeout(logout, remainingTime)
        } else {
            clearTimeout(logoutTimer);
        }
    }, [token, logout, tokenExpirationDate])

    let routes;
    if (token) {
        routes = (
            <Routes>
                <Route path="/" element={<Users/>}/>
                <Route path="/:userId/places" element={<UserPlaces/>}/>
                <Route path="/places/new" element={<NewPlace/>}/>
                <Route path="/places/:placeid" element={<UpdatePlace/>}/>
                <Route path="*" element={<Navigate to='/' replace/>}/>
            </Routes>
        )
    } else {
        routes = (
            <Routes>
                <Route path="/" element={<Users/>}/>
                <Route path="/:userId/places" element={<UserPlaces/>}/>
                <Route path="/auth" element={<Authenticate/>}/>
                <Route path="*" element={<Navigate to='/auth' replace/>}/>
            </Routes>
        )
    }
    return (
        <authContext.Provider value={{isLoggedIn: !!token, token: token, login: login, logout: logout, userId: userId}}>
            <BrowserRouter>
                <MainNavigation/>
                <main>
                    {routes}
                </main>
            </BrowserRouter>
        </authContext.Provider>
    )
}

export default App;
