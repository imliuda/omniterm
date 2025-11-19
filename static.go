//go:build !headless

package main

import "github.com/gin-gonic/gin"

// GUI build: Wails internal static server serves assets; Gin no-op here.
func attachStatic(_ *gin.Engine) {}
