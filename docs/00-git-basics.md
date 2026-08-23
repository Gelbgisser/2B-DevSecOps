# Git basics — fork, branch, pull, push (your repo)

**Timebox:** 45–60 minutes, morning of Day 1.  
**Prerequisites:** Git for Windows + this folder open in Cursor ([`00-prerequisites-wsl-docker.md`](00-prerequisites-wsl-docker.md)).

You can do this lab **entirely in Cursor Source Control**. The commands below are the same operations if you prefer a terminal (PowerShell or Git Bash). You do **not** need Git inside Ubuntu for this page.

## The rule for this class

| Remote | URL | You |
|--------|-----|-----|
| `origin` | `https://github.com/YOUR_USER/2B-DevSecOps.git` | **clone, pull, push** |
| `upstream` | `https://github.com/ItayPr/2B-DevSecOps.git` | **fetch / pull only** (curriculum updates) |

You do **not** create classwork branches on the instructor’s public repo.

**Day 5 extra remote:** local Gitea. Same Git idea, different URL. Still not `ItayPr/...`.

---

## Cursor (default)

1. Fork https://github.com/ItayPr/2B-DevSecOps (GitHub → Fork → you).
2. Cursor: **Git: Clone** → your fork URL → open the folder.
3. Terminal in Cursor (PowerShell):

```powershell
git remote add upstream https://github.com/ItayPr/2B-DevSecOps.git
git remote -v
```

4. **Branch** icon → create `lab/YOURNAME/day-01`.
5. Create `learner-scratch/YOURNAME.txt` with one line of text.
6. Source Control → stage that file → commit message `chore: git practice` → **Publish Branch** / **Sync**.

That push goes to **your** GitHub. Confirm in the browser on your fork, not on `ItayPr/2B-DevSecOps`.

---

## Same steps as commands (optional)

```powershell
cd path\to\2B-DevSecOps
git remote -v
git switch -c lab/$env:USERNAME/day-01
mkdir learner-scratch
Set-Content learner-scratch\$env:USERNAME.txt "practice $(Get-Date -Format o)"
git add learner-scratch\$env:USERNAME.txt
git commit -m "chore: git practice file"
git push -u origin lab/$env:USERNAME/day-01
```

| Flag | Meaning |
|------|---------|
| `-c` | create branch |
| `-m` | commit message |
| `-u` | remember this branch tracks `origin/...` so later `git push` is enough |

---

## Pull textbook updates

```powershell
git fetch upstream
git switch main
git pull --ff-only upstream main
git switch lab/YOURNAME/day-01
git merge main
```

Never `git push upstream`.

---

## Secrets

```powershell
copy .env.example .env
git check-ignore -v .env
```

If `.env` is staged, stop. Do not commit it.

---

## Self-check

- [ ] `origin` is my GitHub; `upstream` is `ItayPr/2B-DevSecOps`
- [ ] I published `lab/<me>/day-01` to **my** fork (GitHub website)
- [ ] I used Cursor or Git for Windows — not the `docker-desktop` terminal
- [ ] `.env` is ignored

## Debug challenge

`git push` rejected (non-fast-forward). Two safe commands before `--force`?

See [`days/day-01-dockerfile/solutions/git-debug.md`](../days/day-01-dockerfile/solutions/git-debug.md).
