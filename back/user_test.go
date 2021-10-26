package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

type parsedResponse struct {
	status int
	body   []byte
}

func createRequester(t *testing.T) func(req *http.Request, err error) parsedResponse {
	return func(req *http.Request, err error) parsedResponse {
		if err != nil {
			t.Errorf("unexpected error: %v", err)
			return parsedResponse{}
		}
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			t.Errorf("unexpected error: %v", err)
			return parsedResponse{}
		}
		resp, err := io.ReadAll(res.Body)
		res.Body.Close()
		if err != nil {
			t.Errorf("unexpected error: %v", err)
			return parsedResponse{}
		}
		return parsedResponse{res.StatusCode, resp}
	}
}
func prepareParams(t *testing.T, params map[string]interface{}) io.
	Reader {
	body, err := json.Marshal(params)
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	return bytes.NewBuffer(body)
}
func newTestUserService() *UserService {
	return &UserService{
		repository: NewInMemoryUserStorage(),
	}
}
func assertStatus(t *testing.T, expected int, r parsedResponse) {
	if r.status != expected {
		t.Errorf("Unexpected response status. Expected: %d, actual: %d", expected, r.status)
	}
}
func assertBody(t *testing.T, expected string, r parsedResponse) {
	actual := string(r.body)
	if actual != expected {
		t.Errorf("Unexpected response body. Expected: %s, actual: %s", expected, actual)
	}
}
func TestUserAPI(t *testing.T) {
	doRequest := createRequester(t)
	t.Run("user does not exist and logs test", func(t *testing.T) {
		u := newTestUserService()
		j, err := NewJWTService("pubkey.rsa", "privkey.rsa")
		if err != nil {
			t.FailNow()
		}
		ts := httptest.NewServer(http.HandlerFunc(logRequest(wrapJwt(j, u.JWT))))
		defer ts.Close()
		params := map[string]interface{}{
			"email":    "test@mail.com",
			"password": "somepass",
		}
		resp := doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params)))
		assertStatus(t, 422, resp)
		assertBody(t, "invalid login params", resp)
	})

	t.Run("invalid password", func(t *testing.T) {
		u := newTestUserService()
		ts := httptest.NewServer(http.HandlerFunc(u.Register))
		defer ts.Close()
		params := map[string]interface{}{
			"email":    "hackademy@gmail.com",
			"password": "fdj2",
		}
		resp := doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params)))
		assertStatus(t, 422, resp)
		assertBody(t, "password should be at least 8 symbols", resp)
	})

	t.Run("invalid email", func(t *testing.T) {
		u := newTestUserService()
		ts := httptest.NewServer(http.HandlerFunc(u.Register))
		defer ts.Close()
		params := map[string]interface{}{
			"email":    "hackademy_gmail.com",
			"password": "fdj2333223412",
		}
		resp := doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params)))
		assertStatus(t, 422, resp)
		assertBody(t, "email is incorrect", resp)
	})

	t.Run("register user", func(t *testing.T) {
		u := newTestUserService()
		ts := httptest.NewServer(http.HandlerFunc(u.Register))
		defer ts.Close()
		params := map[string]interface{}{
			"email":    "hackademy@gmail.com",
			"password": "fdj232dlf",
		}
		resp := doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params)))
		assertStatus(t, 201, resp)
		assertBody(t, "registered", resp)
	})

	t.Run("login is already present", func(t *testing.T) {
		u := newTestUserService()
		ts := httptest.NewServer(http.HandlerFunc(u.Register))
		defer ts.Close()
		params := map[string]interface{}{
			"email":    "hackademy@gmail.com",
			"password": "fdj232dlf",
		}
		ts.Client().Post(ts.URL+"/user/signup", "", prepareParams(t, params))
		resp, err := ts.Client().Post(ts.URL, "", prepareParams(t, params))
		if err != nil {
			return
		}
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return
		}
		res := parsedResponse{resp.StatusCode, body}
		assertStatus(t, 422, res)
		assertBody(t, "login is already present", res)
	})

	t.Run("Get users JWT", func(t *testing.T) {
		u := newTestUserService()
		j, err := NewJWTService("pubkey.rsa", "privkey.rsa")
		if err != nil {
			t.FailNow()
		}
		ts := httptest.NewServer(http.HandlerFunc(u.Register))
		defer ts.Close()
		params := map[string]interface{}{
			"email":    "hackademy@gmail.com",
			"password": "fdj232dlf",
		}
		doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params)))
		ts = httptest.NewServer(http.HandlerFunc(wrapJwt(j, u.JWT)))
		params2 := map[string]interface{}{
			"email":    "hackademy@gmail.com",
			"password": "fdj232dlf",
		}
		resp := doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params2)))
		assertStatus(t, 200, resp)
	})

	t.Run("Update user's email", func(t *testing.T) {
		u := newTestUserService()
		j, err := NewJWTService("pubkey.rsa", "privkey.rsa")
		if err != nil {
			t.FailNow()
		}
		ts := httptest.NewServer(http.HandlerFunc(u.Register))
		defer ts.Close()
		params := map[string]interface{}{
			"email":    "hackademy@gmail.com",
			"password": "fdj232dlf",
		}
		doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params)))
		ts = httptest.NewServer(http.HandlerFunc(wrapJwt(j, u.JWT)))
		params2 := map[string]interface{}{
			"email":    "hackademy@gmail.com",
			"password": "fdj232dlf",
		}
		resp := doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params2)))
		jwt := string(resp.body)
		bearer := "Bearer " + jwt

		email := "newmail@gmail.com"
		ts = httptest.NewServer(http.HandlerFunc(j.jwtAuth(u.repository, u.UpdateEmail)))

		req, err := http.NewRequest("PUT", ts.URL, bytes.NewBuffer([]byte(email)))
		if err != nil {
			t.FailNow()
		}
		req.Header.Add("Authorization", bearer)
		doRequest(req, nil)

		ts = httptest.NewServer(http.HandlerFunc(wrapJwt(j, u.JWT)))
		params3 := map[string]interface{}{
			"email":    "newmail@gmail.com",
			"password": "fdj232dlf",
		}
		resp = doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params3)))

		assertStatus(t, 200, resp)
	})

	t.Run("Update user's password", func(t *testing.T) {
		u := newTestUserService()
		j, err := NewJWTService("pubkey.rsa", "privkey.rsa")
		if err != nil {
			t.FailNow()
		}
		ts := httptest.NewServer(http.HandlerFunc(u.Register))
		defer ts.Close()
		params := map[string]interface{}{
			"email":    "hackademy@gmail.com",
			"password": "fdj232dlf",
		}
		doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params)))
		ts = httptest.NewServer(http.HandlerFunc(wrapJwt(j, u.JWT)))
		params2 := map[string]interface{}{
			"email":    "hackademy@gmail.com",
			"password": "fdj232dlf",
		}
		resp := doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params2)))
		jwt := string(resp.body)
		bearer := "Bearer " + jwt

		pass := "ytgrrfed4343r"
		ts = httptest.NewServer(http.HandlerFunc(j.jwtAuth(u.repository, u.UpdatePassword)))

		req, err := http.NewRequest("PUT", ts.URL, bytes.NewBuffer([]byte(pass)))
		if err != nil {
			t.FailNow()
		}
		req.Header.Add("Authorization", bearer)
		doRequest(req, nil)

		ts = httptest.NewServer(http.HandlerFunc(wrapJwt(j, u.JWT)))
		params3 := map[string]interface{}{
			"email":    "hackademy@gmail.com",
			"password": "ytgrrfed4343r",
		}
		resp = doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params3)))
		assertStatus(t, 200, resp)
	})

	t.Run("Get user's info", func(t *testing.T) {
		u := newTestUserService()
		j, err := NewJWTService("pubkey.rsa", "privkey.rsa")
		if err != nil {
			t.FailNow()
		}
		ts := httptest.NewServer(http.HandlerFunc(u.Register))
		defer ts.Close()
		params := map[string]interface{}{
			"email":    "hackademy@gmail.com",
			"password": "fdj232dlf",
		}
		doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params)))
		ts = httptest.NewServer(http.HandlerFunc(wrapJwt(j, u.JWT)))
		params2 := map[string]interface{}{
			"email":    "hackademy@gmail.com",
			"password": "fdj232dlf",
		}
		resp := doRequest(http.NewRequest(http.MethodPost, ts.URL, prepareParams(t, params2)))
		jwt := string(resp.body)
		bearer := "Bearer " + jwt
		ts = httptest.NewServer(http.HandlerFunc(j.jwtAuth(u.repository, getInfoHandler)))

		req, err := http.NewRequest("GET", ts.URL, nil)
		if err != nil {
			t.FailNow()
		}
		req.Header.Add("Authorization", bearer)
		resp = doRequest(req, nil)

		assertStatus(t, 200, resp)
		assertBody(t, "hackademy@gmail.com", resp)
	})

}
