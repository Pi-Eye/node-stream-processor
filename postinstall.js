const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

try {
  fs.rmSync(path.join(__dirname, "stream-processor"), { recursive: true });
}
catch { /**/ }

const clone = exec("git clone --recursive https://github.com/Pi-Eye/stream-processor/");

clone.stdout.on("data", (data) => {
  process.stdout.write(`${data}`);
});

clone.stderr.on("data", (data) => {
  process.stdout.write(`${data}`);
});

clone.on("error", (error) => {
  console.log("\x1b[32m", `error: ${error.message}`, "\x1b[0m");
  throw error;
});

clone.on("close", (code) => {
  if (code) {
    console.log("\x1b[41m", `Clone failed with code: ${code}`, "\x1b[0m");
    throw new Error("Clone process failed");
  }
  else {
    console.log("\x1b[32m", `Clone process exited successfully with code: ${code}`, "\x1b[0m");

    const build = exec("npm run build");

    build.stdout.on("data", (data) => {
      process.stdout.write(`${data}`);
    });

    build.stderr.on("data", (data) => {
      process.stdout.write(`${data}`);
    });

    build.on("error", (error) => {
      console.log("\x1b[32m", `error: ${error.message}`, "\x1b[0m");
      throw error;
    });

    build.on("close", (code) => {
      if (code) {
        console.log("\x1b[41m", `Build failed with code: ${code}`, "\x1b[0m");
        throw new Error("Build process failed");
      }
      else {
        console.log("\x1b[32m", `Build process exited successfully with code: ${code}`, "\x1b[0m");
      }
      process.exit();
    });
  }
});

