# Commands

Validate an inventory update from the umbrella root:

```powershell
git status --short --branch
git diff --check
git diff --submodule=log
git submodule status
```

For an intentionally changed child, run that child's own validation before advancing its gitlink. Do not treat a recursive umbrella command as a substitute for child validation.
