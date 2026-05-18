# Selection Policy

This repository is a public-safe subset of a larger private Codex skill library.

## Public Inclusion Criteria

A skill can be included here when it:

- Solves a reusable problem for other Codex users.
- Installs and validates without private files, account state, or local paths.
- Does not require customer data, private chats, credentials, or infrastructure details.
- Has a clear license boundary.
- Reads like public project documentation, not a private operating note.

## Excluded By Default

The public repository intentionally excludes:

- Private deployment runbooks and server operations.
- Customer, payment, contract, or freelance operations workflows.
- Anti-detection writing workflows or skills framed around bypassing AI checks.
- Large third-party/vendored suites with separate license obligations.
- Branded presentation templates, private visual assets, and large media fixtures.
- Workflows that only make sense inside one person's private memory system.

## Current Notes

- `academic-research-suite` is not included in this public package. The local
  adapter is useful, but the vendored upstream suite is large and carries
  non-commercial license obligations that deserve separate handling.
- `ppt-master` is not included because the private version contains large
  template assets and brand-specific materials.
- Thesis-specific and delivery-operations skills are not included because they
  are too close to private service workflows.

## Publishing Checklist

Before a public push:

```bash
./scripts/validate.sh
rg -n -i "(password|secret|token|api[_-]?key|apikey|ghp_|gho_|sk-[A-Za-z0-9]|ssh-rsa|BEGIN (RSA|OPENSSH|PRIVATE) KEY|xox[baprs]-|AKIA[0-9A-Z]{16}|/Users/|/Volumes/)" .
```

Matches are review prompts, not automatic failures. Environment variable names
and safety examples may be acceptable when they are clearly placeholders. Add
project-specific private terms to the scan before publishing from your own fork.
