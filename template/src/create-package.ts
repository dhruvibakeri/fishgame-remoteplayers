#!/usr/bin/env ts-node
import fs from "fs";

const projectDir: string = process.argv[2];
const packageFile: string = `${projectDir}/package.json`;

const packageJson = fs.readFileSync(packageFile).toString();
const parsedPackageJson = JSON.parse(packageJson);

parsedPackageJson.scripts = {
  build: "tsc",
  prestart: "npm run build",
  start: "node .",
  lint: "eslint '*/**/*.{js,ts}' --quiet --fix",
  test: "jest",
};

parsedPackageJson.main = `build/${parsedPackageJson.main}`;

parsedPackageJson.jest = {
  preset: "ts-jest",
  testEnvironment: "node",
  maxWorkers: "1",
};

fs.writeFile(
  packageFile,
  JSON.stringify(parsedPackageJson),
  { flag: "w" },
  (err) => {}
);
