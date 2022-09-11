const path = require("path");
const { exec } = require("child_process");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Directory of VCPKG: ", function (dir) {
  const build = exec(`npm run build -- --CDCMAKE_TOOLCHAIN_FILE=${path.join(dir, "scripts", "buildsystems", "vcpkg.cmake").trim()}`);
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
});