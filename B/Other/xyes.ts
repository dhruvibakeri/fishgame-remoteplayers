#!/usr/bin/env node
const LIMIT = 20;

const hasLimit = (args: String[]): boolean => args[0] === "-limit";

const getPrintString = (args: String[]): string =>
  args.length === 0 ? "hello world" : args.join(" ");

const printArgsWithLimit = (args: String[]): void => {
  for (var i = 0; i < LIMIT; i++) {
    console.log(getPrintString(args));
  }
};

const printArgsWithoutLimit = (args: String[]): void => {
  while (true) {
    console.log(getPrintString(args));
  }
};

const xyes = (args: String[]): void => {
  if (hasLimit(args)) {
    printArgsWithLimit(args.slice(1));
  } else {
    printArgsWithoutLimit(args);
  }
};

const args = process.argv.slice(2);
xyes(args);

export {
  hasLimit,
  getPrintString,
  printArgsWithLimit,
  printArgsWithoutLimit,
  xyes,
};
