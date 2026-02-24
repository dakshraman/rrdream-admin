const [major, minor] = process.versions.node.split(".").map(Number);

if (major >= 25) {
  console.error(
    [
      `Unsupported Node.js version: ${process.versions.node}`,
      "Node 25 is not supported for this project and causes Next.js to crash (dev exits early / build may fail with bus error).",
      "Switch to Node 24 (recommended) and reinstall dependencies:",
      "  nvm install 24 && nvm use 24",
      "  rm -rf node_modules package-lock.json && npm install",
    ].join("\n"),
  );
  process.exit(1);
}

const supported =
  (major === 20 && minor >= 9) || major === 21 || major === 22 || major === 23 || major === 24;

if (!supported) {
  console.error(
    [
      `Unsupported Node.js version: ${process.versions.node}`,
      "Use Node 24 (recommended) or Node 20.9+ / 21-23.",
      "Example:",
      "  nvm install 24 && nvm use 24",
    ].join("\n"),
  );
  process.exit(1);
}
