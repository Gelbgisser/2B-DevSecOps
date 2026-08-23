package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, _ *http.Request) {
		fmt.Fprintln(w, "hello from multi-stage")
	})
	http.ListenAndServe(":8080", nil)
}
