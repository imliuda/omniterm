# Security Policy

## Reporting Vulnerabilities
Please email security@example.com or use a private channel (do not open a public Issue).

## Supported Scope
- Latest commit on the main branch
- The two most recent released versions (after release)

## Sensitive Data
Terminal output is stored only in memory and not written to disk. Do not enter production secrets in sessions.

## Recommendations
- Use a firewall to restrict source access to port 8088 in deployments
- If adding a custom port variable (Roadmap OMNITERM_PORT), audit the configuration source
