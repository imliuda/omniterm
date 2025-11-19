package main

import (
	"github.com/imliuda/omniterm/pkg/models"
	"github.com/imliuda/omniterm/pkg/service"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// createAsset creates an asset
func (s *Server) createAsset(assetService *service.AssetService) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.CreateAssetRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			s.logger.Warn("Invalid create asset request", "error", err, "clientIP", c.ClientIP())
			c.JSON(http.StatusBadRequest, models.Response{
				Code:    400,
				Message: "Invalid request parameters: " + err.Error(),
			})
			return
		}

		asset, err := assetService.CreateAsset(&req)
		if err != nil {
			s.logger.Error("Failed to create asset", "name", req.Name, "type", req.Type, "error", err)
			c.JSON(http.StatusBadRequest, models.Response{
				Code:    400,
				Message: err.Error(),
			})
			return
		}

		s.logger.Info("Asset created via API", "assetId", asset.ID, "name", asset.Name, "type", asset.Type, "clientIP", c.ClientIP())
		c.JSON(http.StatusCreated, models.Response{
			Code:    200,
			Message: "Created successfully",
			Data:    asset,
		})
	}
}

// listAssets lists assets
func (s *Server) listAssets(assetService *service.AssetService) gin.HandlerFunc {
	return func(c *gin.Context) {
		assetType := c.Query("type")
		search := c.Query("search")
		tagsStr := c.Query("tags")

		var tags []string
		if tagsStr != "" {
			tags = strings.Split(tagsStr, ",")
		}

		assets, err := assetService.ListAssets(assetType, tags, search)
		if err != nil {
			s.logger.Error("Failed to list assets", "assetType", assetType, "search", search, "tags", tags, "error", err)
			c.JSON(http.StatusInternalServerError, models.Response{
				Code:    500,
				Message: err.Error(),
			})
			return
		}

		s.logger.Debug("Assets listed via API", "count", len(assets), "assetType", assetType, "search", search, "clientIP", c.ClientIP())
		c.JSON(http.StatusOK, models.Response{
			Code:    200,
			Message: "Retrieved successfully",
			Data: models.AssetListResponse{
				Assets: convertToAssetSlice(assets),
				Total:  len(assets),
			},
		})
	}
}

// getAsset gets a single asset
func (s *Server) getAsset(assetService *service.AssetService) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		asset, err := assetService.GetAsset(id)
		if err != nil {
			s.logger.Warn("Asset not found via API", "assetId", id, "clientIP", c.ClientIP())
			c.JSON(http.StatusNotFound, models.Response{
				Code:    404,
				Message: err.Error(),
			})
			return
		}

		s.logger.Debug("Asset retrieved via API", "assetId", id, "name", asset.Name, "clientIP", c.ClientIP())
		c.JSON(http.StatusOK, models.Response{
			Code:    200,
			Message: "Retrieved successfully",
			Data:    asset,
		})
	}
}

// updateAsset updates an asset
func (s *Server) updateAsset(assetService *service.AssetService) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		var req models.UpdateAssetRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			s.logger.Warn("Invalid update asset request", "assetId", id, "error", err, "clientIP", c.ClientIP())
			c.JSON(http.StatusBadRequest, models.Response{
				Code:    400,
				Message: "Invalid request parameters: " + err.Error(),
			})
			return
		}

		asset, err := assetService.UpdateAsset(id, &req)
		if err != nil {
			s.logger.Error("Failed to update asset", "assetId", id, "error", err, "clientIP", c.ClientIP())
			c.JSON(http.StatusBadRequest, models.Response{
				Code:    400,
				Message: err.Error(),
			})
			return
		}

		s.logger.Info("Asset updated via API", "assetId", id, "name", asset.Name, "clientIP", c.ClientIP())
		c.JSON(http.StatusOK, models.Response{
			Code:    200,
			Message: "Updated successfully",
			Data:    asset,
		})
	}
}

// deleteAsset deletes an asset
func (s *Server) deleteAsset(assetService *service.AssetService) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")

		err := assetService.DeleteAsset(id)
		if err != nil {
			s.logger.Error("Failed to delete asset", "assetId", id, "error", err, "clientIP", c.ClientIP())
			c.JSON(http.StatusNotFound, models.Response{
				Code:    404,
				Message: err.Error(),
			})
			return
		}

		s.logger.Info("Asset deleted via API", "assetId", id, "clientIP", c.ClientIP())
		c.JSON(http.StatusOK, models.Response{
			Code:    200,
			Message: "Deleted successfully",
		})
	}
}

// importSSHConfig imports assets from SSH config
func (s *Server) importSSHConfig(assetService *service.AssetService) gin.HandlerFunc {
	return func(c *gin.Context) {
		count, err := assetService.ImportFromSSHConfig()
		if err != nil {
			s.logger.Error("Failed to import SSH config", "error", err, "clientIP", c.ClientIP())
			c.JSON(http.StatusBadRequest, models.Response{
				Code:    400,
				Message: err.Error(),
			})
			return
		}

		s.logger.Info("SSH config imported via API", "importedCount", count, "clientIP", c.ClientIP())
		c.JSON(http.StatusOK, models.Response{
			Code:    200,
			Message: "Import successful",
			Data: map[string]interface{}{
				"imported_count": count,
			},
		})
	}
}

// parseSSHConfig parses SSH config file
func (s *Server) parseSSHConfig(assetService *service.AssetService) gin.HandlerFunc {
	return func(c *gin.Context) {
		hosts, err := assetService.ParseSSHConfig()
		if err != nil {
			s.logger.Error("Failed to parse SSH config", "error", err, "clientIP", c.ClientIP())
			c.JSON(http.StatusBadRequest, models.Response{
				Code:    400,
				Message: err.Error(),
			})
			return
		}

		s.logger.Debug("SSH config parsed via API", "hostsCount", len(hosts), "clientIP", c.ClientIP())
		c.JSON(http.StatusOK, models.Response{
			Code:    200,
			Message: "Parsing successful",
			Data:    hosts,
		})
	}
}

// moveAsset moves an asset using linked list positioning
func (s *Server) moveAsset(assetService *service.AssetService) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		var req models.MoveAssetRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			s.logger.Warn("Invalid move asset request", "assetId", id, "error", err, "clientIP", c.ClientIP())
			c.JSON(http.StatusBadRequest, models.Response{Code: 400, Message: "Invalid request parameters: " + err.Error()})
			return
		}
		asset, err := assetService.MoveAsset(id, &req)
		if err != nil {
			s.logger.Error("Failed to move asset", "assetId", id, "error", err, "clientIP", c.ClientIP())
			c.JSON(http.StatusBadRequest, models.Response{Code: 400, Message: err.Error()})
			return
		}
		newParent := "root"
		if req.NewParentID != nil {
			newParent = *req.NewParentID
		}
		s.logger.Info("Asset moved via API", "assetId", id, "newParent", newParent, "position", strings.ToLower(req.Position), "clientIP", c.ClientIP())
		c.JSON(http.StatusOK, models.Response{Code: 200, Message: "Moved successfully", Data: asset})
	}
}

// convertToAssetSlice converts []*Asset to []Asset
func convertToAssetSlice(assets []*models.Asset) []models.Asset {
	result := make([]models.Asset, len(assets))
	for i, asset := range assets {
		result[i] = *asset
	}
	return result
}
