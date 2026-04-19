# Publish Notes

This folder was generated from the live OpenClaw workspace on the VPS so the original environment could remain untouched.

## Why a separate repo?

The live workspace contains runtime state, logs, personal memory, and side-project files that are useful operationally but not good candidates for a public GitHub repository.

## Current GitHub blocker on the VPS

The VPS already has a dedicated SSH key configured in `~/.ssh/id_ed25519_github`, but GitHub does **not** currently accept it for push access.

To finish a direct push from the VPS:

1. Add the public key from `~/.ssh/id_ed25519_github.pub` to your GitHub account or repo deploy keys.
2. Create an empty GitHub repository.
3. Run:
   - `git branch -M main`
   - `git remote add origin git@github.com:<your-user>/<your-repo>.git`
   - `git push -u origin main`

If you prefer HTTPS, use a GitHub token instead of SSH.
