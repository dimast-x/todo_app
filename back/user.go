package main

import (
	"crypto/md5"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"net/mail"
)

type User struct {
	Id       int
	Email    string
	Password string
}

type UserRepository interface {
	Add(string, User) error
	Get(string) (User, error)
	Update(string, User) error
	Delete(string) (User, error)
	GetLen() int
}
type UserService struct {
	repository UserRepository
}

type UserRegisterParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (u *InMemoryUserStorage) GetLen() int {
	return len(u.storage)
}

func (u *InMemoryUserStorage) Add(usr string, data User) error {
	if len(u.storage[usr].Email) != 0 {
		return errors.New("login is already present")
	}
	u.storage[usr] = data
	return nil
}

func (u *InMemoryUserStorage) Get(usr string) (User, error) {
	return u.storage[usr], nil
}

func (u *InMemoryUserStorage) Update(usr string, data User) error {
	if len(u.storage[usr].Email) == 0 {
		return errors.New("there is no such user to update")
	}
	delete(u.storage, usr)
	u.storage[data.Email] = data
	return nil
}
func (u *InMemoryUserStorage) Delete(usr string) (User, error) {
	if len(u.storage[usr].Email) != 0 {
		return User{}, errors.New("there is no such user to delete")
	}
	user := u.storage[usr]
	delete(u.storage, usr)
	return user, nil
}

func IsAlpha(s string) bool {
	for _, r := range s {
		if (r < 'a' || r > 'z') && (r < 'A' || r > 'Z') {
			return false
		}
	}
	return true
}

func validateEmail(str string) error {
	_, err := mail.ParseAddress(str)
	if err != nil {
		return errors.New("email is incorrect")
	}
	return nil
}

func validatePass(str string) error {
	if len(str) < 8 {
		return errors.New("password should be at least 8 symbols")
	}
	return nil
}

func validateRegisterParams(p *UserRegisterParams) error {

	if err := validateEmail(p.Email); err != nil {
		return err
	}
	if err := validatePass(p.Password); err != nil {
		return err
	}
	return nil
}

func (u *UserService) Register(w http.ResponseWriter, r *http.Request) {
	params := &UserRegisterParams{}
	err := json.NewDecoder(r.Body).Decode(params)
	if err != nil {
		handleError(errors.New("could not read params"), w)
		return
	}
	if err := validateRegisterParams(params); err != nil {
		handleError(err, w)
		return
	}
	GlobalTodos.userCounter++
	Password := md5.New().Sum([]byte(params.Password))
	newUser := User{
		Id:       GlobalTodos.userCounter,
		Email:    params.Email,
		Password: string(Password),
	}
	err = u.repository.Add(params.Email, newUser)
	if err != nil {
		handleError(err, w)
		return
	}

	GlobalTodos.todos[GlobalTodos.userCounter] = UserToDo{lists: make(map[int]ToDoList)}

	log.Println(params.Email + " is successfully registered")
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("registered"))
}

func (u *UserService) UpdateEmail(w http.ResponseWriter, r *http.Request, usr User) {
	resp, err := io.ReadAll(r.Body)
	if err != nil {
		panic(err)
	}
	email := string(resp)
	if err := validateEmail(email); err != nil {
		handleError(err, w)
		return
	}
	newData := User{
		Id:       usr.Id,
		Email:    email,
		Password: usr.Password,
	}
	err = u.repository.Update(usr.Email, newData)
	if err != nil {
		handleError(err, w)
		return
	}
	log.Println(usr.Email + " has successfully updated his email")
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Email updated"))
}

func (u *UserService) UpdatePassword(w http.ResponseWriter, r *http.Request, usr User) {
	resp, err := io.ReadAll(r.Body)
	if err != nil {
		panic(err)
	}
	pass := string(resp)
	if err := validatePass(pass); err != nil {
		handleError(err, w)
		return
	}
	Password := md5.New().Sum([]byte(pass))
	newData := User{
		Id:       usr.Id,
		Email:    usr.Email,
		Password: string(Password),
	}
	err = u.repository.Update(usr.Email, newData)
	if err != nil {
		handleError(err, w)
		return
	}
	log.Println(usr.Email + " has successfully updated his password")
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Password updated"))
}

func getInfoHandler(w http.ResponseWriter, r *http.Request, u User) {
	w.Write([]byte(u.Email))
	log.Println(u.Email)
}

func handleError(err error, w http.ResponseWriter) {
	w.WriteHeader(http.StatusUnprocessableEntity)
	w.Write([]byte(err.Error()))
}
