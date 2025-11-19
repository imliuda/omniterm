package utils

// MaskSensitiveString masks sensitive string: show first & last 4 chars, middle replaced by asterisks; if shorter, return all asterisks
func MaskSensitiveString(s string) string {
	if len(s) > 8 {
		return s[:4] + "******" + s[len(s)-4:]
	} else if s != "" {
		return "****"
	}
	return ""
}
