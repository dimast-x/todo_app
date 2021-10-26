import React, { useState, useEffect } from "react";
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';
import Logo from "../../components/ToDoLogo"

export default function UserLogin() {
  const [user, setUser] = useState<boolean>(false);
  var login: string;
  var pass: string;
  var BackURL = process.env.REACT_APP_BACK
  if (!BackURL) {
    BackURL = "http://127.0.0.1:8081"
  }

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      setUser(true);
    }
  }, []);

  const SignIn = () => {
    axios.post(`${BackURL}/user/signin`,
      {
        email: login,
        password: pass,
      },
    ).then((response: any) => {
      console.log(response)
      localStorage.setItem("jwt", response.data);
      setUser(true)
    }).catch(err => { console.log('err', err); alert('invalid login') })
  }

  if (user) {
    return <Redirect to="/" />
  } else
    return (
      <div className="bg-gradient">
        <div className="bg-dino h-screen flex justify-center items-center p-10">
          <div className="w-full max-w-lg bg-white shadow-lg p-6 md:p-11">
            <Logo />
            <h1 className="mt-2 text-xl font-medium">Sign In</h1>
            <form onSubmit={e => {
              SignIn();
              e.preventDefault();
            }} className="flex flex-col">
              <input autoComplete="username" onChange={e => login = e.target.value} className="border-b border-gray-300 focus:border-brand-yellow mt-6 focus:outline-none sm:text-sm md:text-lg" type="email" placeholder="Email"></input>
              <input autoComplete="current-password" onChange={e => pass = e.target.value} className="border-b border-gray-300 focus:border-brand-yellow my-4 focus:outline-none sm:text-sm md:text-lg" type="password" placeholder="Password"></input>
              <div className="text-xs sm:text-sm roboto">
                <div className="mb-1">
                  <p>No account? <a className="text-brand-yellow hover:text-yellow-400" href="/signup">Create one!</a></p>
                </div>
                <a href="/restore" className="hover:text-gray-800">
                  Forgot Password?
                </a>
                <div className="flex sm:justify-end mt-2">
                  <button className="bg-brand-yellow w-full md:w-auto text-sm hover:bg-yellow-400 font-medium mt-4 py-2 px-10">
                    Sign In
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
}

