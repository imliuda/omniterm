package api

import (
	"github.com/cloudwego/eino/schema"
	"time"
)

type ChatRequest struct {
	ConversationID string         `json:"conversationId"`
	MessageID      string         `json:"messageId"`
	ParentID       string         `json:"parentId,omitempty"`
	Message        schema.Message `json:"message"`
}

type ChatResponse struct {
	ConversationID string         `json:"conversationId"`
	MessageID      string         `json:"messageId"`
	ParentID       string         `json:"parentId,omitempty"`
	Message        schema.Message `json:"message"`
}

type ChatMessage struct {
	ConversationID string                   `json:"conversationId"`
	MessageID      string                   `json:"messageId"`
	ParentID       string                   `json:"parentId,omitempty"`
	Role           string                   `json:"role"`
	Content        []map[string]interface{} `json:"content,omitempty"`
	CreatedAt      time.Time                `json:"created_at"`
	UpdatedAt      time.Time                `json:"updated_at"`
}
