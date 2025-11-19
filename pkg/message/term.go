package message

import (
	"encoding/json"
	"fmt"
	"reflect"
)

var msgTypes = make(map[string]reflect.Type)

// getTypeName extracts type name from struct type
func getTypeName(msgType interface{}) string {
	t := reflect.TypeOf(msgType)
	if t.Kind() == reflect.Ptr {
		t = t.Elem()
	}
	return t.Name()
}

func RegisterMsgType(msgType interface{}) {
	typeName := getTypeName(msgType)
	msgTypes[typeName] = reflect.TypeOf(msgType).Elem()
}

func init() {
	RegisterMsgType(&TermResize{})
	RegisterMsgType(&TermInput{})
	RegisterMsgType(&TermPause{})
	RegisterMsgType(&TermOutputRequest{})
	RegisterMsgType(&TermOutputResponse{})
	RegisterMsgType(&TermSetSessionId{})
}

type TermResize struct {
	Base
	Rows int `json:"rows"`
	Cols int `json:"cols"`
}

type TermInput struct {
	Base
	Data string `json:"data"`
}

type TermPause struct {
	Base
	Pause bool `json:"pause"`
}

// TermOutputRequest request to fetch terminal output
type TermOutputRequest struct {
	Base
	RequestID string `json:"request_id"` // request ID used to match response
	Lines     int    `json:"lines"`      // number of lines requested, 0 means all
}

// TermOutputResponse terminal output response
type TermOutputResponse struct {
	Base
	RequestID string   `json:"request_id"` // corresponding request ID
	Output    []string `json:"output"`     // terminal output lines
	Success   bool     `json:"success"`    // whether fetching succeeded
	Error     string   `json:"error"`      // error message (if any)
}

// TermSetSessionId set terminal session ID
type TermSetSessionId struct {
	Base
	SessionId string `json:"session_id"` // tab key from frontend used as session ID
}

func ParseMessage(data []byte) (interface{}, error) {
	var base Base
	if err := json.Unmarshal(data, &base); err != nil {
		return nil, err
	}
	msgType, ok := msgTypes[base.Type]
	if !ok {
		return nil, fmt.Errorf("unknown message type: %s", base.Type)
	}
	msgPtr := reflect.New(msgType)
	if err := json.Unmarshal(data, msgPtr.Interface()); err != nil {
		return nil, err
	}
	return msgPtr.Interface(), nil
}
