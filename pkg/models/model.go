package models

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
	"sync"
)

const modelFileName = ".aitern/model.json"

// ModelConfig unified struct containing common fields and vendor extension fields
// Extra stores vendor specific additional parameters
// json field names kept consistent with BaseModel
type ModelConfig struct {
	ID       string                 `json:"id"`
	Provider string                 `json:"provider"`
	Model    string                 `json:"model"`
	Name     string                 `json:"name"`
	BaseUrl  string                 `json:"base_url"`
	ApiKey   string                 `json:"api_key"`
	Extra    map[string]interface{} `json:"extra"`
}

// Get model storage file path
func getModelFilePath() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return modelFileName // fallback
	}
	return filepath.Join(home, modelFileName)
}

// Load model list
func LoadModels() ([]*ModelConfig, error) {
	path := getModelFilePath()
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return []*ModelConfig{}, nil
	}
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var models []*ModelConfig
	if err := json.Unmarshal(data, &models); err != nil {
		return nil, err
	}
	return models, nil
}

// Save model list
func SaveModels(models []*ModelConfig) error {
	path := getModelFilePath()
	os.MkdirAll(filepath.Dir(path), 0700)
	data, err := json.MarshalIndent(models, "", "  ")
	if err != nil {
		return err
	}
	return ioutil.WriteFile(path, data, 0600)
}

// SupportedModelProviders supported model providers
var SupportedModelProviders = map[string]struct{}{
	"ark": {}, "deepseek": {}, "claude": {}, "gemini": {}, "ollama": {}, "openai": {}, "qianfan": {}, "qwen": {},
}

// BaseModel model configuration structure
type BaseModel struct {
	ID       string `json:"id"`
	Provider string `json:"provider"`
	Model    string `json:"model"`
	Name     string `json:"name"`
	BaseUrl  string `json:"base_url"`
	ApiKey   string `json:"api_key"`
}

type ArkModel struct {
	BaseModel `json:",inline"`
	Region    string `json:"region"`
}

var (
	modelList  = make([]*BaseModel, 0)
	modelMutex sync.RWMutex
)
