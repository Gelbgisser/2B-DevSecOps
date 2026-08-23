# Debug: git push rejected (non-fast-forward)

> Instructor / self-check — try the exercise first.

Someone else pushed to the same branch (or you pushed from another machine).

**Safe sequence:**

```bash
git fetch origin
git status
git pull --ff-only
# if that fails because you have unique local commits:
git pull --rebase origin lab/$USER-day01
git push
```

**Do not** `git push --force` to `main`. Force-pushing a shared class branch rewrites history other people already pulled.

If the rejection is because you committed `.env`:

```bash
git rm --cached .env
git commit -m "chore: stop tracking env file"
# rotate the password — it is already in history if you pushed
```
