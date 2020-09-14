#!/usr/bin/env node
const args = process.argv.slice(2);

const printArgs = (args: String[], limit?: number): void => {
  const printString = args.length === 0 ? "hello world" : args.join(" ");
  if (limit) {
    for (var i = 0; i < limit; i++) {
      console.log(printString);
    }
  } else {
    while (true) {
      console.log(printString);
    }
  }
};

const getArgs = (args: String[]): String[] => {
  if (args[0] === "-limit") {
    return args.slice(1);
  } else {
    return args;
  }
};

if (args[0] === "-limit") {
  printArgs(getArgs(args), 20);
} else {
  printArgs(getArgs(args));
}
