const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

try {
  fs.rmdirSync(path.join(__dirname, "stream-processor"), { recursive: true });
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
  const RED = "\x1b[36m%s\x1b[0m";
  console.log(`${RED} error: ${error.message}`);
});

clone.on("close", (code) => {
  if (code) {
    console.log("\x1b[41m", `Clone failed with code: ${code}`, "\x1b[0m");
    process.exit();
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
      const RED = "\x1b[36m%s\x1b[0m";
      console.log(`${RED} error: ${error.message}`);
    });

    build.on("close", (code) => {
      if (code) {
        console.log("\x1b[41m", `Build failed with code: ${code}`, "\x1b[0m");
      }
      else {
        console.log("\x1b[32m", `Build process exited successfully with code: ${code}`, "\x1b[0m");
      }
      process.exit();
    });
  }
});

