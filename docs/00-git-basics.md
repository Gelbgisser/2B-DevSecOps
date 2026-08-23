# Git basics — clone, branch, pull, push

**Timebox:** 45–60 minutes on the morning of Day 1.

You will use Git every remaining day. Day 5’s Gitea remote is the same commands with a different URL.

## Why this matters for DevSec

Git is how **desired state** (Helm values, policies, Jenkinsfiles) moves between laptops and the cluster. Secrets accidentally committed to Git are a supply-chain incident. Learn the happy path *and* how to not put `.env` on `main`.

## Mental model

```text
working tree  --git add-->  index/stage  --git commit-->  local repo  --git push-->  origin
                                    ^                         |
                                    |                         git pull
                                    +------ git checkout / switch
```

- **clone** — copy a remote repo once
- **pull** — fetch + merge (or rebase) others’ commits
- **push** — publish your commits
- **branch** — isolated line of work (your lab user, not `main` if the instructor locks it)

## Lab G1 — identity and first commit (already cloned)

```bash
cd ~/src/devsecops-bootcamp   # or your path
git status
git log -1 --oneline
```

Create a scratch branch so you never push broken labs to `main` by accident:

```bash
git switch -c lab/$USER-day01
echo "# scratch" >> .gitkeep-scratch 2>/dev/null || true
# better: keep notes out of git
mkdir -p $HOME/lab-notes
echo "Day 1 notes" > $HOME/lab-notes/day01.md
```

## Lab G2 — add / commit (only files you intend)

```bash
git status
git diff
# stage a real file you changed, not .env
git add -p
git commit -m "docs: my day 1 notes stay local — this commit is a practice commit"
```

If you have nothing to commit, that is fine. Practice on a branch:

```bash
echo "practice $(date -Is)" >> $HOME/lab-notes/git-practice.txt
# that file is outside the repo — good. Inside the repo:
mkdir -p learner-scratch
echo "practice $(date -Is)" > learner-scratch/$USER.txt
git add learner-scratch/$USER.txt
git commit -m "chore: git practice file for $USER"
```

`learner-scratch/` is gitignored? If not, it is OK for class. Do **not** put passwords there.

## Lab G3 — clone / pull / push (pair or instructor origin)

Instructor writes the origin on the board (GitHub, GitLab, or later Gitea).

```bash
git remote -v
git pull --ff-only
```

Push your branch:

```bash
git push -u origin lab/$USER-day01
```

First-time GitHub HTTPS will prompt a **Personal Access Token**, not your account password. Prefer SSH if the instructor issued keys.

### SSH (optional)

```bash
ls -l ~/.ssh
# generate ONLY if you have no key
ssh-keygen -t ed25519 -C "you@company.example" -f ~/.ssh/id_ed25519_lab
cat ~/.ssh/id_ed25519_lab.pub
```

Paste the **public** key into Gitea/GitHub. Never commit `id_ed25519`.

## Lab G4 — do not commit secrets

```bash
cp .env.example .env
# edit a fake password
git status
git check-ignore -v .env
```

Expected: `.env` is ignored. If `git add .` stages `.env`, **stop** and fix `.gitignore`.

If you already committed a secret: rotate it (it is burned), then `git rm --cached .env` and commit. History still contains it — Day 8 Gitleaks is how we catch this earlier. Do not `git push --force` to `main`.

## Self-check

- [ ] I can explain clone vs pull vs push in one sentence each
- [ ] I work on a branch named after me
- [ ] `.env` is ignored
- [ ] `git log --oneline -5` works

## Debug challenge

Your `git push` is rejected (non-fast-forward). What are the two safe next commands before you even think about `--force`?

See [`days/day-01-dockerfile/solutions/git-debug.md`](../days/day-01-dockerfile/solutions/git-debug.md).
