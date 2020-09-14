#!/usr/bin/env node
const LIMIT = 20;

/**
 * Check whether the given array of arguments contains the "-limit" flag as its
 * line length.
 *
 * @param args an array of strings representing the recieved command line
 * arguments, including a possible "-limit" flag as the first argument.
 */
const hasLimit = (args: String[]): boolean => args[0] === "-limit";

/**
 * Given the array of command line arguments get what string to print.
 *
 * @param args an array of strings representing the recieved command line
 * arguments, not including a possible "-limit" flag as the first argument.
 */
const getPrintString = (args: String[]): string =>
  args.length === 0 ? "hello world" : args.join(" ");

/**
 * Prints a string derived from the given array of command line arguments
 * as many times as the limit.
 *
 * @param args an array of strings representing the recieved command line
 * arguments, not including a possible "-limit" flag as the first argument.
 */
const printArgsWithLimit = (args: String[]): void => {
  for (var i = 0; i < LIMIT; i++) {
    console.log(getPrintString(args));
  }
};

/**
 * Prints a string derived from the given array of command line arguments
 * infinitely.
 *
 * @param args an array of strings representing the recieved command line
 * arguments, not including a possible "-limit" flag as the first argument.
 */
const printArgsWithoutLimit = (args: String[]): void => {
  while (true) {
    console.log(getPrintString(args));
  }
};

/**
 * Given an array of command line arguments, repeatedly print a concatenation
 * of each of the arguments separated by a space.
 *
 * If there are no arguments, "hello world" is printed.
 *
 * A limit flag "-limit" may also be specified to limit the amount of print
 * repetitions to a set amount defined within LIMIT.
 *
 * @param args an array of strings representing the recieved command line
 * arguments, including a possible "-limit" flag as the first argument.
 */
const xyes = (args: String[]): void => {
  if (hasLimit(args)) {
    printArgsWithLimit(args.slice(1));
  } else {
    printArgsWithoutLimit(args);
  }
};

const args = process.argv.slice(2);
xyes(args);
