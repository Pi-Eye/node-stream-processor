import fs from "fs";
import path from "path";

function FindFileRec(dir: string): Array<string> {
  const files = fs.readdirSync(dir);
  let files_rec: Array<string> = [];
  for (let i = 0; i < files.length; i++) {
    files[i] = path.join(dir, files[i]);
    if (fs.lstatSync(files[i]).isDirectory()) {
      files_rec = files_rec.concat(FindFileRec(files[i]));
      files.splice(i, 1);
      i--;
    }
  }
  return files.concat(files.concat(files_rec));
}

export function FindFile(filename: string, start_dir?: string): string {
  if (!start_dir) start_dir = __dirname;
  const files = FindFileRec(start_dir);
  for (let i = 0; i < files.length; i++) {
    if (path.basename(files[i]) === filename) {
      return files[i];
    }
  }
  throw new Error(`File: "${filename}" does not exist anywhere inside directory: ${start_dir}`);
}