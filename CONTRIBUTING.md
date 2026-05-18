# Contributing

Thank you for helping improve this public Codex skill collection.

## What Fits

Good contributions usually:

- Improve a reusable agent workflow.
- Make a skill easier to install, validate, or adapt.
- Add clear examples without relying on private files or accounts.
- Keep instructions concise and implementation-oriented.

## What Does Not Fit

Please do not contribute:

- Secrets, tokens, cookies, private keys, account exports, or local credentials.
- Customer files, private chats, contracts, payment records, or personal identity data.
- Private deployment runbooks or infrastructure-specific operational notes.
- Anti-detection, academic misconduct, or platform-bypass workflows.
- Large vendored tool suites or media/template assets without a clear license boundary.

## Pull Request Checklist

Before opening a pull request:

```bash
./scripts/validate.sh
rg -n -i "(password|secret|token|api[_-]?key|apikey|ghp_|gho_|sk-[A-Za-z0-9]|ssh-rsa|BEGIN (RSA|OPENSSH|PRIVATE) KEY|xox[baprs]-|AKIA[0-9A-Z]{16})" .
```

Review any matches manually. Placeholder environment variable names are fine
when they are clearly examples and not real credentials.
