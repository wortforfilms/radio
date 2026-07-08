#!/usr/bin/env bash
set -eu

REPO_URL="${RADIO_VAIGYAANIQ_REPO_URL:-https://github.com/wortforfilms/radio.git}"
INSTALL_DIR="${RADIO_VAIGYAANIQ_INSTALL_DIR:-$HOME/RadioVaigyaaniqSource}"
BRANCH="${RADIO_VAIGYAANIQ_BRANCH:-main}"

echo "Radio Vaigyaaniq source-preview installer"
echo "PHKD: this is not a signed desktop installer, App Store build, Play Store build, or production release."
echo "Repo: $REPO_URL"
echo "Install dir: $INSTALL_DIR"
echo

if [ "$(id -u)" = "0" ]; then
  echo "Refusing to run as root." >&2
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "git is required." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required." >&2
  exit 1
fi

if [ -d "$INSTALL_DIR/.git" ]; then
  echo "Updating existing checkout..."
  git -C "$INSTALL_DIR" fetch origin "$BRANCH"
  git -C "$INSTALL_DIR" checkout "$BRANCH"
  git -C "$INSTALL_DIR" pull --ff-only origin "$BRANCH"
else
  mkdir -p "$(dirname "$INSTALL_DIR")"
  git clone --branch "$BRANCH" "$REPO_URL" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"
npm ci
npm run radio:install:channels

cat <<'MSG'

Source preview installed.

Next local commands:
  npm run dev
  open http://127.0.0.1:3000/radio-html/install.html

PHKD release status:
  Desktop signed installer: BLOCKED until signed/notarized evidence exists.
  Cloud launch: BLOCKED until deployment URL and smoke evidence exist.
  Apple Store / Play Store: BLOCKED until store listing, signed mobile builds, and review evidence exist.
MSG
