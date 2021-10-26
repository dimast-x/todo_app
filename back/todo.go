package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

type InMemoryToDo struct {
	userCounter  int
	listsCounter int
	tasksCounter int
	todos        map[int]UserToDo
}

type UserToDo struct {
	lists map[int]ToDoList
}

type ToDoList struct {
	id    int
	name  string
	tasks map[int]Task
}

type ListResp struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}

type ListName struct {
	Name string `json:"name"`
}

type Task struct {
	id          int
	name        string
	description string
	status      string
}

type TaskResp struct {
	Id          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

type CreateTaskParameters struct {
	Task_name        string `json:"task_name"`
	Task_description string `json:"task_description"`
}

type UpdateTaskParameters struct {
	Task_name        string `json:"task_name"`
	Task_description string `json:"task_description"`
	Task_status      string `json:"task_status"`
}

func NewInMemoryToDo() *InMemoryToDo {
	return &InMemoryToDo{
		userCounter:  0,
		listsCounter: 0,
		tasksCounter: 0,
		todos:        make(map[int]UserToDo),
	}
}

var GlobalTodos = NewInMemoryToDo()

func (u *UserService) createList(w http.ResponseWriter, r *http.Request, user User) {

	params := &ListName{}
	err := json.NewDecoder(r.Body).Decode(params)
	if err != nil {
		handleError(errors.New("could not read params"), w)
		return
	}

	name := params.Name
	userTodos := GlobalTodos.todos[user.Id]

	listId := GlobalTodos.listsCounter
	list := ToDoList{
		id:    listId,
		name:  name,
		tasks: make(map[int]Task),
	}
	userTodos.lists[GlobalTodos.listsCounter] = list
	GlobalTodos.listsCounter++

	resp := ListResp{
		Id:   listId,
		Name: name,
	}
	jsonResp, err := json.Marshal(resp)
	if err != nil {
		handleError(err, w)
	}

	log.Println(user.Email + " created a list \"" + name + "\". List id: " + fmt.Sprint(listId))
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(jsonResp))
}

func (u *UserService) updateList(w http.ResponseWriter, r *http.Request, user User) {

	params := &ListName{}
	err := json.NewDecoder(r.Body).Decode(params)
	if err != nil {
		handleError(errors.New("could not read params"), w)
		return
	}

	name := params.Name
	userTodos := GlobalTodos.todos[user.Id]

	list_id := mux.Vars(r)["list_id"]
	listId, err := strconv.Atoi(list_id)
	if err != nil {
		handleError(err, w)
	}

	updatedList := ToDoList{
		id:    listId,
		name:  name,
		tasks: userTodos.lists[listId].tasks,
	}

	_, ok := userTodos.lists[listId]

	if ok && userTodos.lists[listId].id != -1 {
		userTodos.lists[listId] = updatedList
	} else {
		w.WriteHeader(422)
		w.Write([]byte("no list with id: " + list_id))
		return
	}

	resp := ListResp{
		Id:   listId,
		Name: name,
	}
	jsonResp, err := json.Marshal(resp)
	if err != nil {
		handleError(err, w)
	}

	log.Println(user.Email + " updated a list " + fmt.Sprint(listId) + " to \"" + name)
	w.WriteHeader(200)
	w.Write([]byte(jsonResp))
}

func (u *UserService) deleteList(w http.ResponseWriter, r *http.Request, user User) {

	userTodos := GlobalTodos.todos[user.Id]

	list_id := mux.Vars(r)["list_id"]
	listId, err := strconv.Atoi(list_id)
	if err != nil {
		handleError(err, w)
	}

	_, ok := userTodos.lists[listId]

	if ok && userTodos.lists[listId].id != -1 {
		userTodos.lists[listId] = ToDoList{id: -1}
	} else {
		w.WriteHeader(422)
		w.Write([]byte("no list with id: " + list_id))
		return
	}

	log.Println(user.Email + " deleted a list with id: " + list_id)
	w.WriteHeader(204)
}

func (u *UserService) getLists(w http.ResponseWriter, r *http.Request, user User) {

	userTodos := GlobalTodos.todos[user.Id]
	var full_resp []ListResp
	for _, list := range userTodos.lists {
		if list.id != -1 {
			resp := ListResp{
				Id:   list.id,
				Name: list.name,
			}
			full_resp = append(full_resp, resp)

		}
	}
	jsonResp, err := json.Marshal(full_resp)
	if err != nil {
		handleError(err, w)
	}
	w.Write([]byte(jsonResp))
	w.WriteHeader(200)
}

func (u *UserService) createTask(w http.ResponseWriter, r *http.Request, user User) {

	list_id := mux.Vars(r)["list_id"]
	listId, err := strconv.Atoi(list_id)
	if err != nil {
		handleError(err, w)
	}

	params := &CreateTaskParameters{}
	err = json.NewDecoder(r.Body).Decode(params)
	if err != nil {
		handleError(errors.New("could not read params"), w)
		return
	}
	userTodos := GlobalTodos.todos[user.Id]

	var list ToDoList
	_, ok := userTodos.lists[listId]

	if ok && userTodos.lists[listId].id != -1 {
		list = userTodos.lists[listId]
	} else {
		w.WriteHeader(422)
		w.Write([]byte("no list with id: " + list_id))
		return
	}

	taskId := GlobalTodos.tasksCounter
	task := Task{
		id:          taskId,
		name:        params.Task_name,
		description: params.Task_description,
		status:      "open",
	}
	list.tasks[taskId] = task
	GlobalTodos.tasksCounter++

	resp := TaskResp{
		Id:          taskId,
		Name:        list.tasks[taskId].name,
		Description: list.tasks[taskId].description,
		Status:      list.tasks[taskId].status,
	}
	jsonResp, err := json.Marshal(resp)
	if err != nil {
		handleError(err, w)
	}

	log.Println(user.Email + " created a new task: " + fmt.Sprint(taskId))
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(jsonResp))
}

func (u *UserService) updateTask(w http.ResponseWriter, r *http.Request, user User) {

	params := &UpdateTaskParameters{}
	err := json.NewDecoder(r.Body).Decode(params)
	if err != nil {
		handleError(errors.New("could not read params"), w)
		return
	}

	userTodos := GlobalTodos.todos[user.Id]

	list_id := mux.Vars(r)["list_id"]
	listId, err := strconv.Atoi(list_id)
	if err != nil {
		handleError(err, w)
	}
	task_id := mux.Vars(r)["task_id"]
	taskId, err := strconv.Atoi(task_id)
	if err != nil {
		handleError(err, w)
	}

	name := params.Task_name
	description := params.Task_description
	status := params.Task_status

	list, ok := userTodos.lists[listId]

	if ok && list.id != -1 && list.tasks[taskId].id != -1 {
		if name == "" {
			name = list.tasks[taskId].name
		}
		if description == "" {
			description = list.tasks[taskId].description
		}
		if status == "" {
			status = list.tasks[taskId].status
		}

		updatedTask := Task{
			id:          taskId,
			name:        name,
			description: description,
			status:      status,
		}
		list.tasks[taskId] = updatedTask
	} else {
		w.WriteHeader(422)
		w.Write([]byte("no list or task"))
		return
	}

	resp := TaskResp{
		Id:          taskId,
		Name:        list.tasks[taskId].name,
		Description: list.tasks[taskId].description,
		Status:      list.tasks[taskId].status,
	}
	jsonResp, err := json.Marshal(resp)
	if err != nil {
		handleError(err, w)
	}

	log.Println(user.Email + " updated the task: " + task_id + " at the list :" + list_id)
	w.WriteHeader(200)
	w.Write([]byte(jsonResp))
}

func (u *UserService) deleteTask(w http.ResponseWriter, r *http.Request, user User) {

	userTodos := GlobalTodos.todos[user.Id]

	list_id := mux.Vars(r)["list_id"]
	listId, err := strconv.Atoi(list_id)
	if err != nil {
		handleError(err, w)
	}
	task_id := mux.Vars(r)["task_id"]
	taskId, err := strconv.Atoi(task_id)
	if err != nil {
		handleError(err, w)
	}

	list, ok := userTodos.lists[listId]

	if ok && list.id != -1 && list.tasks[taskId].id != -1 {
		updatedTask := Task{id: -1}
		list.tasks[taskId] = updatedTask
	} else {
		w.WriteHeader(422)
		w.Write([]byte("no list or task"))
		return
	}

	log.Println(user.Email + " deleted the task: " + task_id + " at the list :" + list_id)
	w.WriteHeader(204)
}

func (u *UserService) getTasks(w http.ResponseWriter, r *http.Request, user User) {

	userTodos := GlobalTodos.todos[user.Id]
	list_id := mux.Vars(r)["list_id"]
	listId, err := strconv.Atoi(list_id)
	if err != nil {
		handleError(err, w)
	}

	var full_resp []TaskResp
	for _, task := range userTodos.lists[listId].tasks {
		if task.id != -1 {
			resp := TaskResp{
				Id:          task.id,
				Name:        task.name,
				Description: task.description,
				Status:      task.status,
			}
			full_resp = append(full_resp, resp)
		}
	}
	jsonResp, err := json.Marshal(full_resp)
	if err != nil {
		handleError(err, w)
	}
	w.Write([]byte(jsonResp))
	w.WriteHeader(200)
}
