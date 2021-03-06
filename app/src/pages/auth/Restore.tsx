import React from "react";
import Logo from "../../components/ToDoLogo"
import './Auth.css';

export default function Restore() {

    return (
      <div className="bg-gradient">
        <div className="bg-dino h-screen flex justify-center items-center p-10">
          <div className="w-full max-w-lg bg-white shadow-lg p-6 md:p-11">
            <Logo />
            <h1 className="mt-2 text-xl font-medium">Forgot password</h1>
            <form onSubmit={e => {
              e.preventDefault();
            }} className="flex flex-col">
              <input autoComplete="username" className="border-b border-gray-300 focus:border-brand-yellow mt-6 focus:outline-none sm:text-sm md:text-lg" type="email" placeholder="Email"></input>
              <div className="text-xs sm:text-sm roboto">
                <div className="flex sm:justify-end mt-2">
                <a href="/login" className="bg-gray-300 mr-4 w-full md:w-auto text-sm hover:bg-yellow-400 font-medium mt-4 py-2 px-10">
                    Back
                  </a>
                  <a href="/login" className="bg-brand-yellow w-full md:w-auto text-sm hover:bg-yellow-400 font-medium mt-4 py-2 px-10">
                    Send
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>

      </div>
    );
}
