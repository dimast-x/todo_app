package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func wrapJwt(jwt *JWTService, f func(http.ResponseWriter, *http.Request, *JWTService)) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		f(rw, r, jwt)
	}
}

func main() {

	r := mux.NewRouter()
	users := NewInMemoryUserStorage()

	userService := UserService{repository: users}
	jwtService, err := NewJWTService("pubkey.rsa", "privkey.rsa")
	if err != nil {
		panic(err)
	}

	r.HandleFunc("/user/signup", logRequest(userService.Register)).Methods(http.MethodPost)
	r.HandleFunc("/user/signin", logRequest(wrapJwt(jwtService, userService.JWT))).Methods(http.MethodPost)
	r.HandleFunc("/user/me", logRequest(jwtService.jwtAuth(users, getInfoHandler))).Methods(http.MethodGet)
	r.HandleFunc("/user/todo/lists", logRequest(jwtService.jwtAuth(users, userService.createList))).Methods(http.MethodPost)
	r.PathPrefix("/user/todo/lists/{list_id}/tasks/{task_id}").HandlerFunc(logRequest(jwtService.jwtAuth(users, userService.updateTask))).Methods(http.MethodPut)
	r.PathPrefix("/user/todo/lists/{list_id}/tasks/{task_id}").HandlerFunc(logRequest(jwtService.jwtAuth(users, userService.deleteTask))).Methods(http.MethodDelete)
	r.PathPrefix("/user/todo/lists/{list_id}").HandlerFunc(logRequest(jwtService.jwtAuth(users, userService.updateList))).Methods(http.MethodPut)
	r.PathPrefix("/user/todo/lists/{list_id}").HandlerFunc(logRequest(jwtService.jwtAuth(users, userService.deleteList))).Methods(http.MethodDelete)
	r.HandleFunc("/user/todo/lists", logRequest(jwtService.jwtAuth(users, userService.getLists))).Methods(http.MethodGet)
	r.PathPrefix("/user/todo/lists/{list_id}/tasks").HandlerFunc(logRequest(jwtService.jwtAuth(users, userService.createTask))).Methods(http.MethodPost)
	r.PathPrefix("/user/todo/lists/{list_id}/tasks").HandlerFunc(logRequest(jwtService.jwtAuth(users, userService.getTasks))).Methods(http.MethodGet)

	header := handlers.AllowedHeaders([]string{"X-Requested-With", "Content-Type", "Authorization"})
	methods := handlers.AllowedMethods([]string{"GET", "POST", "PUT", "HEAD", "OPTIONS", "DELETE"})
	origins := handlers.AllowedOrigins([]string{"*"})

	srv := http.Server{
		Addr:    ":8081",
		Handler: handlers.CORS(header, methods, origins)(r),
	}
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)
	go func() {
		<-interrupt
		ctx, cancel := context.WithTimeout(context.Background(),
			5*time.Second)
		defer cancel()
		srv.Shutdown(ctx)
	}()
	log.Println("Server started, hit Ctrl+C to stop")
	err = srv.ListenAndServe()
	if err != nil {
		log.Println("Server exited with error:", err)
	}
	log.Println("Good bye :)")
}
