import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import logo from '../../images/logo.svg';

function App() {

  var BackURL = process.env.REACT_APP_BACK
  if (!BackURL) {
    BackURL = "http://127.0.0.1:8081"
  }

  const [email, setEmail] = useState<string>();
  const [sidebar, setSidebar] = useState(false);
  const [settingsopen, setSettingsOpen] = useState(false);
  const [addingactive, setAddingActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemlist, setItemlist] = useState<any>();
  const [lists, setLists] = useState<any>();
  const [currentlist, setCurrentlist] = useState<any>();
  const [tasklist, setTasklist] = useState<any>();
  const [tasks, setTasks] = useState<any>();
  const [completedtasklist, setCompletedTasklist] = useState<any>();

  const [task_id, setTask_id] = useState<any>();
  const [task_name, setTask_name] = useState<any>();
  const [task_desc, setTask_desc] = useState<any>();
  const [task_status, setTask_status] = useState<any>();

  var newlist: string;
  var newtask: string;

  React.useEffect(() => {
    if (task_status === "completed") {
      (document.getElementById("done") as HTMLInputElement).checked = true;
    } else {
      (document.getElementById("done") as HTMLInputElement).checked = false;
    }
  }, [task_id]);

  React.useEffect(() => {
    var res;
    if (tasks) {
      tasks.sort((a: any, b: any) => (a.id > b.id) ? 1 : -1)

      res = tasks.map(function (task: any) {
        if (task.status !== "completed") {
          return (
            <div onClick={() => { setTask_id(task.id); setTask_name(task.name); setTask_desc(task.description); setTask_status(task.status); document.getElementById("rightsidebar")?.classList.remove("hidden"); }} key={task.name + task.id} className="cursor-pointer flex items-center border-b border-gray-200 py-4">
              <div className="h-5 w-5 border border-brand-yellow rounded-full"></div>
              <h1 className="text-xl ml-6">{task.name}</h1>
            </div>)
        }
      })
    }
    setTasklist(res)
  }, [tasks]);

  React.useEffect(() => {
    var res;
    if (tasks) {
      tasks.sort((a: any, b: any) => (a.id > b.id) ? 1 : -1)
      res = tasks.map(function (task: any) {
        if (task.status === "completed") {
          return (
            <div onClick={() => { setTask_id(task.id); setTask_name(task.name); setTask_desc(task.description); setTask_status(task.status); document.getElementById("rightsidebar")?.classList.remove("hidden"); }} key={task.name + task.id} className="cursor-pointer flex items-center border-b border-gray-200 py-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 text-brand-yellow" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h1 className="text-xl ml-6 line-through">{task.name}</h1>
            </div>)
        }
      })
    }
    setCompletedTasklist(res)
  }, [tasks]);

  React.useEffect(() => {
    if (currentlist) {
      var list = document.getElementById(currentlist[1] + currentlist[0]);
      var items = document.querySelectorAll(".lists");
      [].forEach.call(items, function (item: HTMLElement | null) {
        item?.classList.remove("bg-amber-200")
      });
      list?.classList.toggle("bg-amber-200");
    }
  }, [currentlist]);


  React.useEffect(() => {
    var res;
    if (lists) {
      lists.sort((a: any, b: any) => (a.id > b.id) ? 1 : -1)
      res = lists.map(function (list: any) {
        return <div key={list.name + list.id}>
          <div id={list.name + list.id} className="lists flex -mt-2 py-1">
            <button onClick={() => setCurrentlist([list.id, list.name])} className="flex justify-around w-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 select-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="sidebar-item hidden">
              <div className="flex justify-between w-44">
                <button onClick={() => setCurrentlist([list.id, list.name])} className="ml-1 text-left font-medium text-lg w-full">{list.name}</button>
                <button onClick={() => DeleteList(list.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      })
    }
    setItemlist(res)
  }, [lists]);

  React.useEffect(() => {
    if (currentlist) {
      const jwt = localStorage.getItem("jwt");
      axios.get(`${BackURL}/user/todo/lists/${currentlist[0]}/tasks`, { headers: { "Authorization": `Bearer ${jwt}` } })
        .then((res: any) => {
          setTasks(res?.data)
        })
        .catch(err => console.log('err', err))
    }

  }, [currentlist, loading]);

  React.useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    axios.get(`${BackURL}/user/todo/lists`, { headers: { "Authorization": `Bearer ${jwt}` } })
      .then((res: any) => {
        setLists(res?.data)
      })
      .catch(err => console.log('err', err))
  }, [loading]);

  React.useEffect(() => {
    if (sidebar) {
      var items = document.querySelectorAll(".sidebar-item");
      [].forEach.call(items, function (item: HTMLElement | null) {
        item?.classList.remove("hidden")
      });
    }
  }, [itemlist]);

  function ToggleSidebar(type: number) {
    const items = document.querySelectorAll(".sidebar-item");
    const down = document.querySelector(".sidebar-down-menu");
    const toggle_open = document.querySelector(".toggle-open");
    const toggle_close = document.querySelector(".toggle-close");
    const sidebar_id = document.querySelector(".sidebar");

    if (type !== 1 || (type === 1 && !sidebar)) {
      sidebar_id?.classList.toggle("w-14");
      sidebar_id?.classList.toggle("w-72");

      [].forEach.call(items, function (item: any) {
        item?.classList.toggle("hidden");
      });

      down?.classList.toggle("flex-col");
      down?.classList.toggle("space-y-6");
      down?.classList.toggle("space-x-6");
      toggle_open?.classList.toggle("hidden");
      toggle_close?.classList.toggle("hidden");

      if (addingactive) {
        ToggleCreateList()
      }
      if (settingsopen) {
        Settings()
      }
      if (!sidebar) {
        setSidebar(true);
      } else {
        setSidebar(false);
      }
    }
  }

  function Settings() {
    var popup = document.getElementById("settings");
    if (!settingsopen) {
      setSettingsOpen(true);
    } else {
      setSettingsOpen(false);
    }

    if (!sidebar) {
      popup?.classList.toggle("hidden");
      ToggleSidebar(0)
    } else {
      popup?.classList.toggle("hidden");
    }
  }

  function ListOpts() {
    var popup = document.getElementById("list-opts");
    popup?.classList.toggle("hidden");
  }

  function ToggleRightSidebar() {
    var sidebar = document.getElementById("rightsidebar");
    sidebar?.classList.toggle("hidden");
  }

  function userInfo() {
    const jwt = localStorage.getItem("jwt");
    axios.get(`${BackURL}/user/me`, { headers: { "Authorization": `Bearer ${jwt}` } })
      .then((res: any) => {
        setEmail(res?.data)
      })
      .catch(err => console.log('err', err))

    var popup = document.getElementById("userinfo");
    popup?.classList.toggle("hidden");
  }

  function ToggleCreateList() {
    var createlist = document.getElementById("createlist");
    var label = document.getElementById("sidebar-add");
    var add_div = document.getElementById("add-div");
    createlist?.classList.toggle("hidden");
    label?.classList.toggle("hidden");
    add_div?.classList.toggle("bg-white");
    add_div?.classList.toggle("bg-transparent");
    add_div?.classList.toggle("text-gray-400");
    if (!addingactive) {
      setAddingActive(true)
    } else {
      setAddingActive(false)
    }
  }

  function ToggleCreateTask() {
    var createtask = document.getElementById("createtask");
    var label = document.getElementById("addtask-label");
    var add_div = document.getElementById("add-task");
    createtask?.classList.toggle("hidden");
    label?.classList.toggle("hidden");
    add_div?.classList.toggle("bg-gray-300");
    add_div?.classList.toggle("bg-transparent");
    add_div?.classList.toggle("text-gray-400");
    if (!addingactive) {
      setAddingActive(true)
    } else {
      setAddingActive(false)
    }
  }

  function Completed() {
    var completed = document.getElementById("completed");
    var arr_up = document.getElementById("arr-up");
    var arr_down = document.getElementById("arr-down");
    completed?.classList.toggle("hidden");
    arr_up?.classList.toggle("hidden");
    arr_down?.classList.toggle("hidden");
  }

  function ToggleRenameList() {
    var item1 = document.getElementById("rename-list-input");
    item1?.classList.toggle("hidden");
    ListOpts();
  }

  function handleLogout() {
    localStorage.removeItem("jwt");
    window.location.reload();
  }

  function CreateNewList(name: string) {
    if (name) {
      const jwt = localStorage.getItem("jwt");
      axios.post(`${BackURL}/user/todo/lists`, { name: name }, {
        headers: { "Authorization": `Bearer ${jwt}` },
      }).then().catch(err => console.log('err', err))
      ToggleCreateList();
      var empty: string = "";
      (document.getElementById('add-list-input') as HTMLInputElement).value = empty;
      if (!loading) {
        setLoading(true);
      } else {
        setLoading(false);
      }
    }
  }

  function CreateTask(name: string, description: string) {
    if (name) {
      if (currentlist) {
        const jwt = localStorage.getItem("jwt");
        axios.post(`${BackURL}/user/todo/lists/${currentlist[0]}/tasks`,
          {
            task_name: name,
            task_description: description
          }, {
          headers: { "Authorization": `Bearer ${jwt}` },
        }).then().catch(err => console.log('err', err))
        var empty: string = "";
        (document.getElementById('add-task-input') as HTMLInputElement).value = empty;
        ToggleCreateTask();
        if (!loading) {
          setLoading(true);
        } else {
          setLoading(false);
        }
      }
    }
  }

  function updateList(name: string) {

    if (currentlist) {
      const jwt = localStorage.getItem("jwt");
      axios.put(`${BackURL}/user/todo/lists/${currentlist[0]}`,
        {
          name: name,

        }, {
        headers: { "Authorization": `Bearer ${jwt}` },
      }).then().catch(err => console.log('err', err))
      var item1 = document.getElementById("rename-list-input");
      //var item2 = document.getElementById("list-name");
      item1?.classList.toggle("hidden");
      setCurrentlist([currentlist[0], name])
      if (!loading) {
        setLoading(true);
      } else {
        setLoading(false);
      }
    }
  }

  function UpdateTask(name: string, descr: string, status: boolean) {
    var stat = "open"
    if (status === true) {
      stat = "completed"
    }
    if (currentlist) {
      const jwt = localStorage.getItem("jwt");
      axios.put(`${BackURL}/user/todo/lists/${currentlist[0]}/tasks/${task_id}`,
        {
          task_name: name,
          task_description: descr,
          task_status: stat,
        }, {
        headers: { "Authorization": `Bearer ${jwt}` },
      }).then().catch(err => console.log('err', err))

      var empty: string = "";
      (document.getElementById('taskname') as HTMLInputElement).value = empty;
      (document.getElementById('taskdesc') as HTMLInputElement).value = empty;

      if (stat === "completed") {
        (document.getElementById("done") as HTMLInputElement).checked = true;
      } else {
        (document.getElementById("done") as HTMLInputElement).checked = false;
      }


      if (!loading) {
        setLoading(true);
      } else {
        setLoading(false);
      }
    }
  }

  function DeleteList(id: number) {
    const jwt = localStorage.getItem("jwt");
    axios.delete(`${BackURL}/user/todo/lists/${id}`,
      {
        headers: { "Authorization": `Bearer ${jwt}` },
      }).then().catch(err => console.log('err', err))

    if (!loading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
    setCurrentlist("");
    setTask_id("");
    setTask_name("");
    setTask_desc("");
    setTask_status("open");
  }

  function DeleteTask(id: number) {
    ToggleRightSidebar();
    const jwt = localStorage.getItem("jwt");
    axios.delete(`${BackURL}/user/todo/lists/${currentlist[0]}/tasks/${id}`,
      {
        headers: { "Authorization": `Bearer ${jwt}` },
      }).then().catch(err => console.log('err', err))
    if (!loading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex">
      {/* Left sidebar */}
      <div className="sidebar w-14 h-full bg-brand-yellow flex flex-col justify-between px-2 py-5">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-around w-10 h-10">
            <img alt="logo" className="w-8 mb-3" src={logo} />
          </div>
          <div className="flex justify-around w-10">
            <button onClick={e => ToggleSidebar(0)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="toggle-open w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" className="toggle-close hidden w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Lists' icons */}
          <div className="flex flex-col space-y-4" onClick={e => ToggleSidebar(1)}>{itemlist}</div>

          {/* Add new list */}
          <div id="add-div" className="flex items-center bg-transparent cursor-pointer">
            <div onClick={e => ToggleSidebar(1)} className="flex items-center">
              <div className="flex w-10 justify-around">
                <svg xmlns="http://www.w3.org/2000/svg" onClick={e => ToggleCreateList()} className="w-7 select-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="sidebar-item hidden ml-1 w-44 text-left font-medium text-lg">
                <p id="sidebar-add" onClick={e => ToggleCreateList()} >New list</p>
                <div id="createlist" className="hidden">
                  <div className="flex items-center justify-between font-medium mr-2">
                    <input id="add-list-input" onChange={e => newlist = e.target.value} className="focus:outline-none text-lg w-2/3" type="text" placeholder="New list"></input>
                    <button onClick={e => CreateNewList(newlist)} className="text-brand-yellow">Add</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Three-icon menu at he bottom of the left sidebar */}
        <div className="sidebar-down-menu w-full flex flex-col items-center justify-center space-y-6 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="relative cursor-pointer" onClick={() => Settings()}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>

            {/* Popup */}
            <div id="settings" className="absolute w-48 select-none p-2 bottom-10 -left-20 hidden bg-white shadow-lg rounded-md text-gray-400">
              <div className="flex p-2 hover:bg-gray-100 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                <button className="font-medium text-base ml-2">Profile</button>
              </div>
              <div className="flex p-2 mt-2 hover:bg-gray-100 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <button onClick={() => handleLogout()} className="font-medium text-base ml-2">Log Out</button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="flex flex-col h-full w-full">

        {/* Search and user bar */}
        <div className="w-full border-b border-gray-200 flex justify-between h-auto">
          <div className="flex items-center w-4/5 md:w-1/2 lg:w-1/3 mx-4 my-2 border border-gray-200">
            <label htmlFor="search">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 ml-4 text-coolgray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </label>
            <input id="search" type="text" placeholder="Search" name="hero-field" className="w-full h-full outline-none my-1 mx-3 text-lg placeholder-coolgray-500"></input>
          </div>
          <div className="flex items-center  relative cursor-pointer" onClick={() => { userInfo(); }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="select-none h-9 mr-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
            <div id="userinfo" className="absolute w-72  top-16 right-5 hidden bg-white shadow-lg rounded-md text-gray-400">
              <div className="flex mt-4 ml-4 justify-between">
                <svg className="w-16" viewBox="0 0 98 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M49.04 26H46.448V11.096H41.312V8.864H54.176V11.096H49.04V26ZM66.2279 19.52C66.2279 21.664 65.6759 23.32 64.5719 24.488C63.4679 25.656 61.9799 26.24 60.1079 26.24C58.9399 26.24 57.8999 25.976 56.9879 25.448C56.0919 24.92 55.3799 24.16 54.8519 23.168C54.3399 22.16 54.0839 20.944 54.0839 19.52C54.0839 17.376 54.6279 15.728 55.7159 14.576C56.8039 13.408 58.2919 12.824 60.1799 12.824C61.3639 12.824 62.4039 13.088 63.2999 13.616C64.2119 14.128 64.9239 14.88 65.4359 15.872C65.9639 16.864 66.2279 18.08 66.2279 19.52ZM56.6999 19.52C56.6999 20.976 56.9719 22.112 57.5159 22.928C58.0759 23.744 58.9559 24.152 60.1559 24.152C61.3559 24.152 62.2279 23.744 62.7719 22.928C63.3319 22.112 63.6119 20.976 63.6119 19.52C63.6119 18.048 63.3319 16.92 62.7719 16.136C62.2119 15.336 61.3319 14.936 60.1319 14.936C58.9319 14.936 58.0599 15.336 57.5159 16.136C56.9719 16.92 56.6999 18.048 56.6999 19.52ZM73.8929 26.24C72.3409 26.24 71.0849 25.68 70.1249 24.56C69.1809 23.44 68.7089 21.776 68.7089 19.568C68.7089 17.344 69.1889 15.664 70.1489 14.528C71.1089 13.392 72.3729 12.824 73.9409 12.824C74.9169 12.824 75.7169 13.008 76.3409 13.376C76.9649 13.744 77.4689 14.192 77.8529 14.72H77.9969C77.9649 14.512 77.9249 14.192 77.8769 13.76C77.8289 13.328 77.8049 12.944 77.8049 12.608V7.76H80.3489V26H78.3569L77.9249 24.272H77.8049C77.4369 24.832 76.9409 25.304 76.3169 25.688C75.6929 26.056 74.8849 26.24 73.8929 26.24ZM74.4929 24.152C75.7409 24.152 76.6209 23.808 77.1329 23.12C77.6449 22.416 77.9009 21.368 77.9009 19.976V19.592C77.9009 18.088 77.6529 16.936 77.1569 16.136C76.6769 15.32 75.7809 14.912 74.4689 14.912C73.4289 14.912 72.6449 15.336 72.1169 16.184C71.5889 17.016 71.3249 18.16 71.3249 19.616C71.3249 21.072 71.5889 22.192 72.1169 22.976C72.6449 23.76 73.4369 24.152 74.4929 24.152ZM95.7358 19.52C95.7358 21.664 95.1838 23.32 94.0798 24.488C92.9758 25.656 91.4878 26.24 89.6158 26.24C88.4478 26.24 87.4078 25.976 86.4958 25.448C85.5998 24.92 84.8878 24.16 84.3598 23.168C83.8478 22.16 83.5918 20.944 83.5918 19.52C83.5918 17.376 84.1358 15.728 85.2238 14.576C86.3118 13.408 87.7998 12.824 89.6878 12.824C90.8718 12.824 91.9118 13.088 92.8078 13.616C93.7198 14.128 94.4318 14.88 94.9438 15.872C95.4718 16.864 95.7358 18.08 95.7358 19.52ZM86.2078 19.52C86.2078 20.976 86.4798 22.112 87.0238 22.928C87.5838 23.744 88.4638 24.152 89.6638 24.152C90.8638 24.152 91.7358 23.744 92.2798 22.928C92.8398 22.112 93.1198 20.976 93.1198 19.52C93.1198 18.048 92.8398 16.92 92.2798 16.136C91.7198 15.336 90.8398 14.936 89.6398 14.936C88.4398 14.936 87.5678 15.336 87.0238 16.136C86.4798 16.92 86.2078 18.048 86.2078 19.52Z" fill="#797979" />
                  <path d="M26.5911 4.35142C26.8396 4.01134 27.0995 4 27.461 4L31.6071 4.02267C32.1607 4.02267 32.7595 4.54413 32.5674 5.0996L17.1352 27.4544C16.6946 28.0553 16.1636 27.9986 15.8021 27.9986L11.3961 27.9759C11.0685 27.9759 10.6505 27.4431 11.0007 26.933L26.5911 4.35142Z" fill="#FCD000" />
                  <path d="M16.6082 26.8895C16.9042 27.6034 16.7107 28 16.3919 28H11.2009C10.8594 28 10.5634 27.7734 10.4496 27.4448L0.0447463 5.11048C-0.137395 4.55524 0.261036 4 0.796076 4H5.24715C5.58866 4 5.88465 4.22663 6.02125 4.55524L16.6082 26.8895Z" fill="black" />
                  <path d="M30.1951 26.8895C30.4875 27.6034 30.2963 28 29.9815 28H24.5619C24.2471 28 23.9323 27.7734 23.8198 27.4448L13.1831 5.11048C12.9919 4.55524 13.363 4 13.9252 4H18.6251C18.9737 4 19.2548 4.22663 19.3672 4.55524L30.1951 26.8895Z" fill="black" />
                  <path d="M35.0413 9.2282C35.4284 10.1128 34.9417 10.3396 34.6209 10.3396H30.2405C29.9308 10.3396 29.4109 10.1468 29.256 9.78391L26.734 5.11142C26.3911 4.41962 26.6565 4 27.1986 4H31.5237C31.8666 4 32.3312 4.1928 32.5081 4.55571L35.0413 9.2282Z" fill="black" />
                </svg>
                <button onClick={() => handleLogout()} className="ml-2 mr-4 font-medium text-sm">Sign Out</button>
              </div>
              <div className="flex my-4">
                <div className="w-2/5"><svg xmlns="http://www.w3.org/2000/svg" className="text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                </div>
                <div className="ml-2 mt-2 w-3/5">
                  <p className="font-normal text-black">{email}</p>
                  <p className="font-normal text-sm text-brand-yellow">My profile</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main body */}
        <div className="flex justify-between h-full">
          <div className="w-full">
            {currentlist ?
              <div className="p-4">

                {/* List name and three-dot icon */}
                <div className="flex flex-row items-center mb-4 py-2">
                  <h1 id="list-name" className="font-semibold text-xl">{currentlist[1]}</h1>
                  <div className="relative cursor-pointer select-none" >
                    <div className="flex h-8 items-center w-full">
                      <svg xmlns="http://www.w3.org/2000/svg" onClick={() => ListOpts()} className="h-6 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                      <div id="rename-list-input" className="hidden">
                        <div className="flex items-center">
                          <input onChange={e => newlist = e.target.value} className="ml-2 p-2 py-1 focus:outline-none text-xl border border-gray-200 w-44" type="text" placeholder="Enter a new name"></input>
                          <h1 onClick={() => updateList(newlist)} className="text-xl text-brand-yellow ml-2 p-2 py-1">Update</h1>
                        </div>
                      </div>
                    </div>

                    {/* Popup List options */}
                    <div id="list-opts" className="absolute w-44 select-none top-10 -left-14 hidden bg-white shadow-lg rounded-md">
                      <div className="border-b p-1 border-gray-300">
                        <h1 className="text-base font-medium text-center">List options</h1>
                      </div>
                      <div className="flex my-2 mx-2 p-2 hover:bg-gray-100 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <button onClick={() => ToggleRenameList()} className="ml-2 font-medium text-base">Rename list</button>
                      </div>
                      <div className="flex my-2 mx-2 text-red-600 p-2 hover:bg-gray-100 rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <button onClick={() => DeleteList(currentlist[0])} className="ml-2 font-medium text-base">Delete list</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add a task */}
                <div className="flex items-center select-none border-b border-gray-200 h-16">
                  <div className="ml-1 text-left font-medium text-lg flex my-4 bg-transparent">
                    <div onClick={() => ToggleCreateTask()} className="cursor-pointer flex items-center ">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      <h1 id="addtask-label" className="text-xl text-brand-yellow ml-2 p-2 py-1">Add a task</h1>
                    </div>
                    <div id="createtask" className="hidden">
                      <div className="flex items-center justify-between font-medium">
                        <input id="add-task-input" onChange={e => newtask = e.target.value} className="ml-2 p-2 py-1 focus:outline-none text-xl border border-gray-200 w-52" type="text" placeholder="Add a task"></input>
                        <button onClick={() => CreateTask(newtask, "")} className="text-brand-yellow ml-2 py-1 px-3 text-xl font-medium">Add</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Open tasks */}
                {tasklist}

                {/* Dropdown */}
                <div className="cursor-pointer select-none flex items-center border-b border-gray-200 py-4" onClick={() => Completed()}>
                  <svg xmlns="http://www.w3.org/2000/svg" id="arr-up" className="w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  </svg>
                  <svg xmlns="http://www.w3.org/2000/svg" id="arr-down" className="w-6 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <h1 className="text-xl ml-6">Completed</h1>
                </div>

                {/* Completed tasks */}
                <div id="completed">
                  {completedtasklist}
                </div>
              </div>
              :
              <div className="h-full w-full flex justify-center">
                <div className="flex flex-col items-center justify-center h-3/4 w-4/5">
                  <h1 className="text-base md:text-xl lg:text-2xl text-brand-yellow font-semibold">List not found</h1>
                  <h1 className="text-sm md:text-base lg:text-xl font-medium text-center">We can't find the list you're looking for. Select one of your lists from the sidebar or create a new list.</h1>
                </div>
              </div>}
          </div>

          {/* Right Sidebar */}
          {task_id ?
            <div id="rightsidebar" className="flex flex-col w-full xl:w-1/3 bg-brand-yellow justify-between">
              <div className="flex flex-col space-y-4 p-2 md:p-5">

                <div className="flex items-center bg-white border border-gray-200">

                  <input id="done" className="md:mr-2 md:ml-4 ml-1 rounded-full w-5 h-5 border-2 border-brand-yellow checked:bg-brand-yellow" onChange={e => setTask_status((document.getElementById("done") as HTMLInputElement).checked)} type="checkbox" />
                  <input id="taskname" onChange={e => setTask_name(e.target.value)} className="w-full p-1 md:p-3 focus:outline-none text-xl placeholder-black" value={task_name}></input>
                </div>

                <textarea id="taskdesc" onChange={e => setTask_desc(e.target.value)} className="w-full h-60 focus:outline-none p-1 md:p-3" value={task_desc} placeholder="Description"></textarea>
                <button onClick={() => UpdateTask(task_name, task_desc, task_status)} className="py-4 text-xl font-medium">Update</button>
              </div>
              <div className="border-t border-gray-400 h-14 px-5 w-full flex justify-between">
                <button>
                  <svg onClick={() => ToggleRightSidebar()} xmlns="http://www.w3.org/2000/svg" className="h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button onClick={() => DeleteTask(task_id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            : (<input id="done" className="hidden" type="checkbox" />)}
        </div>
      </div>
    </div>
  );
}

export default App;


