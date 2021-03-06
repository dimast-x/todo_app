import React, { useState, useEffect } from "react";
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import Logo from "../../components/ToDoLogo"
import './Auth.css';

export default function Register() {
  const [user, setUser] = useState<boolean>(false);
  var login: string;
  var pass: string;
  var pass2: string;
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

  const SignUp = () => {
    if (pass === pass2) {
      axios.post(`${BackURL}/user/signup`,
      {
        email: login,
        password: pass,
      },

    ).then((response: any) => {
      axios.post(`${BackURL}/user/signin`,
        {
          email: login,
          password: pass,
        })
        .then((res: any) => {
          localStorage.setItem("jwt", res.data);
          setUser(true)
        })
        .catch(error => console.log(error))

    }).catch(err => {console.log('err', err); alert('user already exists')})
    } else {
      alert("Password mismatch")
    }
  }

  if (user) {
    return <Redirect to="/" />
  } else
    return (
      <div className="bg-gradient">
        <div className="bg-dino h-screen flex justify-center items-center p-10">
          <div className="w-full max-w-lg bg-white shadow-lg p-6 md:p-11">
            <Logo />
            <h1 className="mt-2 text-xl font-medium">Sign up</h1>
            <form onSubmit={e => {
              SignUp();
              e.preventDefault();
            }} className="flex flex-col">
              <input autoComplete="username" onChange={e => login = e.target.value} className="border-b border-gray-300 focus:border-brand-yellow mt-6 focus:outline-none sm:text-sm md:text-lg" type="email" placeholder="Email"></input>
              <input autoComplete="current-password" onChange={e => pass = e.target.value} className="border-b border-gray-300 focus:border-brand-yellow my-4 focus:outline-none sm:text-sm md:text-lg" type="password" placeholder="Password"></input>
              <input autoComplete="current-password" onChange={e => pass2 = e.target.value} className="border-b border-gray-300 focus:border-brand-yellow mb-4 focus:outline-none sm:text-sm md:text-lg" type="password" placeholder="Confirm password"></input>
              <div className="text-xs sm:text-sm roboto">
              <div className="mb-1">
              <p>Already have an account? <a className="text-brand-yellow hover:text-yellow-400" href="/signin">Sign In!</a></p>
              </div>
                <div className="flex sm:justify-end mt-2">
                  <button className="bg-brand-yellow w-full md:w-auto text-sm hover:bg-yellow-400 font-medium mt-4 py-2 px-10">
                    Sign Up
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

      </div>
    );
}
