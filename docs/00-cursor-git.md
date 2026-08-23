# Install Cursor (or VS Code) and connect it to GitHub

This is the Git client for class. Docker still runs in **Ubuntu**. Git commit/push runs in **Cursor** on Windows.

You need **both**:

1. [Git for Windows](https://git-scm.com/download/win) (`git.exe` on PATH)
2. [Cursor](https://cursor.com/download) **or** [VS Code](https://code.visualstudio.com/)

The steps below say **Cursor**. In VS Code the same buttons exist (Source Control, Command Palette `Ctrl+Shift+P`).

---

## 1. Install Git for Windows first

Cursor does not ship Git. If Git is missing, Source Control shows “Git not found”.

1. https://git-scm.com/download/win → 64-bit installer.
2. Next through the wizard. Leave **Git from the command line and also from 3rd-party software** selected (puts `git` on PATH).
3. Close and reopen PowerShell:

```powershell
git --version
# Expected: git version 2.x.x
where.exe git
# Expected: C:\Program Files\Git\cmd\git.exe  (or similar)
```

Identity (shown on every commit):

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@github-email.example"
git config --global init.defaultBranch main
```

Use the **same email** as your GitHub account if you want commits to link to your profile.

---

## 2. Install Cursor

1. https://cursor.com/download → Windows.
2. Install, open Cursor.
3. Optional: sign in with a Cursor account (editor features). That is **not** GitHub login.

VS Code instead: https://code.visualstudio.com/ → install. Enable the built-in Git (it is on by default).

---

## 3. Point Cursor at Git (only if Source Control is empty / error)

1. `Ctrl+Shift+P` → **Preferences: Open Settings (UI)**.
2. Search `git path`.
3. If `Git: Path` is empty and Git still fails, set it to:

`C:\Program Files\Git\cmd\git.exe`

4. `Ctrl+Shift+P` → **Git: Show Git Output** if a clone/push fails — the red error is in that log.

Restart Cursor after installing Git for Windows.

---

## 4. Log Cursor into GitHub (so push does not ask for a password forever)

GitHub **does not** accept your GitHub password on `git push`.

**Easiest:** first push/clone in Cursor → browser window “Authorize Git Credential Manager” / “Sign in to GitHub”. Allow access.

If that never appears:

### Personal Access Token (HTTPS)

1. GitHub (website, logged in) → **Settings** → **Developer settings** → **Personal access tokens**.
2. Generate a token (fine-grained: this fork, **Contents: Read and write**; or classic `repo` scope).
3. Copy it **once**. When Git asks for a password, paste the **token**, not your GitHub password.
4. Username = your GitHub username.

Git Credential Manager (installed with Git for Windows) should remember it.

SSH is optional and not required for class.

---

## 5. Fork, then clone **your** repo into Cursor

You must clone **your fork**, not `ItayPr/2B-DevSecOps` (you cannot push to the class repo).

1. Browser: open https://github.com/ItayPr/2B-DevSecOps → **Fork** → owner = **you** → Create fork.
2. On **your** fork page, click green **Code** → copy HTTPS URL. It must look like:

   `https://github.com/YOUR_USER/2B-DevSecOps.git`

3. In Cursor: `Ctrl+Shift+P` → **Git: Clone**.
4. Paste that URL → choose a folder (example: `C:\Users\You\Desktop\Projects`).
5. When asked **Open** the cloned folder → **Open**.

You are “connected” when:

- Bottom-left (or Source Control) shows branch `main`.
- `Ctrl+Shift+P` → **Git: Show Remote** / or integrated terminal:

```powershell
git remote -v
# origin  https://github.com/YOUR_USER/2B-DevSecOps.git
```

Add the textbook remote (pull updates, never push):

```powershell
git remote add upstream https://github.com/ItayPr/2B-DevSecOps.git
git remote -v
```

If `origin` is still `ItayPr/...`, you cloned the textbook. Fix:

```powershell
git remote rename origin upstream
git remote add origin https://github.com/YOUR_USER/2B-DevSecOps.git
git push -u origin main
```

---

## 6. Already have the folder on disk? Open it instead of cloning again

**File → Open Folder** → `C:\Users\You\Desktop\Projects\2B-DevSecOps`.

Do **not** clone a second copy. Two folders = two Git histories.

---

## 7. Everyday Git in the UI (this is “connected and working”)

1. Left activity bar → **Source Control** (branch icon).
2. **+** next to a file = stage (`git add`).
3. Message box at the top → type a message → **Commit** (`git commit`).
4. **Sync** / **Publish Branch** / **Push** (`git push` to `origin`).

Create a branch: status bar branch name (bottom-left) → **Create new branch** → `lab/YOURNAME/day-01`.

You are done when GitHub.com on **your** user shows that branch.

---

## 8. Docker labs: Ubuntu terminal **inside** Cursor (same folder)

Do not open the **docker-desktop** distro.

In Cursor: **Terminal → New Terminal**. Click the `+` dropdown → **Ubuntu** (or `wsl -d Ubuntu`).

```bash
# You should already be in the Windows repo via /mnt/c/...
pwd
# Example: /mnt/c/Users/You/Desktop/Projects/2B-DevSecOps
docker version
```

If `pwd` is `/home/you`, you are in the Linux home, not the class repo:

```bash
cd /mnt/c/Users/You/Desktop/Projects/2B-DevSecOps
```

PowerShell terminal in Cursor is fine for `git`. Ubuntu terminal is for `docker`.

---

## If something fails

| What you see | What it means |
|--------------|----------------|
| Git not found | Install Git for Windows, restart Cursor, set Git: Path |
| Authentication failed | Password is wrong — use a PAT or browser login, not GitHub account password |
| `permission denied` on push to `ItayPr/...` | `origin` is the class repo — point `origin` at your fork |
| `docker-desktop:` prompt | Wrong WSL distro — use Ubuntu |
| Source Control empty | Folder is not a git clone, or you opened a parent directory |

More: [`troubleshooting.md`](troubleshooting.md). Next lab: [`00-git-basics.md`](00-git-basics.md).
