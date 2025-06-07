import fs from "fs";
import { IFileSystem } from "../types/filesystem";

export const realFileSystem: IFileSystem = {
  readFileSync: (path, encoding) =>
    fs.readFileSync(path, encoding as BufferEncoding),
  writeFileSync: fs.writeFileSync,
  existsSync: fs.existsSync,
  copyFileSync: fs.copyFileSync,
  mkdirSync: (path, options) => fs.mkdirSync(path, options),
  readdirSync: (path, options: { withFileTypes: true }) => fs.readdirSync(path, options),
  // Add other methods as needed
};
