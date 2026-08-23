# Git basics — fork, branch, pull, push (your repo)

**Timebox:** 45–60 minutes, morning of Day 1.  
**Prerequisites:** Git installed in WSL ([`00-prerequisites-wsl-docker.md`](00-prerequisites-wsl-docker.md) § 2–5).

## The rule for this class

| Remote | URL | You |
|--------|-----|-----|
| `origin` | `https://github.com/YOUR_USER/2B-DevSecOps.git` | **clone, pull, push** |
| `upstream` | `https://github.com/ItayPr/2B-DevSecOps.git` | **fetch / pull only** (curriculum updates) |

You do **not** create classwork branches on the instructor’s public repo. You would get `permission denied`, and even if you had access it would mix 20 people’s half-finished labs into the textbook.

**Day 5 extra remote:** local Gitea (`gitea`). Same Git commands, different URL, for Jenkins. Still not `ItayPr/...`.

---

## Mental model

```text
GitHub: ItayPr/2B-DevSecOps     ← upstream  (textbook)
            │ fork (once, in the browser)
            ▼
GitHub: YOU/2B-DevSecOps        ← origin    (your notebook)
            │ git clone
            ▼
WSL folder ~/src/2B-DevSecOps
            │ git switch -c lab/YOU/day-01
            │ git add / commit
            ▼
        git push -u origin lab/YOU/day-01
```

| Command | Meaning |
|---------|---------|
| `clone` | Copy a repo **once** onto disk |
| `switch -c` | Create and move to a new **branch** (isolated line of history) |
| `add` | Stage files for the next commit |
| `commit` | Snapshot on **your laptop** |
| `push` | Upload commits to **origin** (your fork) |
| `pull` | Download + integrate someone else’s commits |
| `fetch` | Download but do not merge yet |

---

## Lab G0 — confirm remotes

```bash
cd ~/src/2B-DevSecOps    # or wherever you cloned

git remote -v
```

If `origin` is `ItayPr/2B-DevSecOps` and you are not a maintainer, you cloned the textbook. Fix:

```bash
# Point origin at YOUR fork (HTTPS). SSH: git@github.com:YOUR_USER/2B-DevSecOps.git
git remote rename origin upstream
git remote add origin https://github.com/YOUR_USER/2B-DevSecOps.git
git remote -v
```

---

## Lab G1 — branch named after you

```bash
git status          # clean? or list of edited files
git log -1 --oneline

# -c  create the branch if it does not exist
# lab/YOUR_USER/day-01  keeps your work apart from classmates and from main
git switch -c lab/$USER/day-01
# If $USER is not your GitHub name, write it literally:
# git switch -c lab/itay/day-01

git status
# Expected: On branch lab/...
```

Keep private notes **outside** git:

```bash
mkdir -p "$HOME/lab-notes"
echo "Day 1" > "$HOME/lab-notes/day01.md"
```

---

## Lab G2 — one practice commit

```bash
mkdir -p learner-scratch
echo "practice $(date -Is) by $USER" > "learner-scratch/${USER}.txt"

git status
# learner-scratch/... should show as Untracked

git add "learner-scratch/${USER}.txt"
git status
# file should be under Changes to be committed

git commit -m "chore: git practice file for ${USER}"
# -m  commit message (required; describes WHY, not only the filename)
```

Do **not** put passwords in `learner-scratch/`.

---

## Lab G3 — push to **your** fork

```bash
# -u  remember this branch tracks origin/lab/... so later you can type  git push
git push -u origin lab/$USER/day-01
```

HTTPS: username = GitHub user; password = **token**.  
SSH: no password if the key is loaded.

**Expected:** GitHub shows the branch on **your** fork. The instructor repo’s branch list does **not** need your lab branch.

Pull later on another machine:

```bash
git clone https://github.com/YOUR_USER/2B-DevSecOps.git
git switch lab/YOUR_USER/day-01
```

---

## Lab G4 — get textbook updates (`upstream`)

When the instructor fixes a lab:

```bash
git fetch upstream
# fetch  download commits; does not change your files yet

git switch main
git pull --ff-only upstream main
# --ff-only  refuse to merge if you committed on main locally (keeps history simple)

git switch lab/$USER/day-01
git merge main
# or: git rebase main   (replay your commits on top; ask before first rebase)
```

Never: `git push upstream` (you should not have permission anyway).

---

## Lab G5 — secrets stay out of git

```bash
cp -n .env.example .env
git status
git check-ignore -v .env
# Expected: .gitignore tells git to ignore .env
```

If `git add .` stages `.env`, **stop**. Fix `.gitignore`. If you already committed a secret: it is burned — rotate it; `git rm --cached .env` and commit. History still has it. Do not `git push --force` to `main`.

---

## Flag cheat-sheet (Git)

| Flag | Typical use | Meaning |
|------|-------------|---------|
| `-c` | `git switch -c name` | Create branch |
| `-m` | `git commit -m "..."` | Message |
| `-u` | `git push -u origin branch` | Set upstream tracking |
| `-v` | `git remote -v` | Verbose (show URLs) |
| `--ff-only` | `git pull --ff-only` | Fast-forward only; no merge commit surprises |
| `--cached` | `git rm --cached file` | Untrack but keep the file on disk |
| `-p` | `git add -p` | Stage hunk by hunk |

---

## Self-check

- [ ] I can say clone vs pull vs push in one sentence each
- [ ] `origin` is **my** GitHub; `upstream` is `ItayPr/2B-DevSecOps`
- [ ] I pushed `lab/<me>/day-01` to **my** fork and saw it in the GitHub UI
- [ ] `.env` is ignored
- [ ] I will not open a PR to the class repo for homework

## Debug challenge

`git push` is rejected (non-fast-forward). Two safe commands **before** `--force`?

See [`days/day-01-dockerfile/solutions/git-debug.md`](../days/day-01-dockerfile/solutions/git-debug.md).
