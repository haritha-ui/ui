import React, { createContext, useEffect, useState } from 'react';

export const UserContext = createContext();

const UserProvider = (props) => {
    // User data
    const[user, setUser] = useState({
        name: '',
        email: '',
        tokenAccess: '',
        tokenId: '',
        tokenExpiration: 0,
        firstName: '',
        lastName: '',
        shortName: ''
    });

    // Gets the user data from local storage
    useEffect(()=>{
        setUser({
            ...JSON.parse(window.localStorage.getItem('sso-user'))
        });
    },[]);

    // Saves the user in local storage
    useEffect(()=>{
        window.localStorage.setItem('sso-user', JSON.stringify(user));
    },[user]);

    // When authentication is done
    const setUserCredentials = (tokenAccess, tokenId, tokenExpiration, email, name, first_name, last_name) => {
        setUser({
            ...user, // If you add more information it won't be deleted
            name: name,
            email: email,
            firstName: first_name,
            lastName: last_name,
            tokenAccess: tokenAccess,
            tokenId: tokenId,
            tokenExpiration: tokenExpiration,
            shortName: email.split('@')[0]
        });
    }

    return (
        <UserContext.Provider
            value={{
                user,
                setUserCredentials,
            }}
        >
            {props.children}
        </UserContext.Provider>
    );
}

export default UserProvider;