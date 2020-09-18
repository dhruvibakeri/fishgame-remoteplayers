# CS 4500 - Fiona Gridley & Andrew Leung

This project contains assignment work for Northeastern's CS 4500: Software Development course.

# C

This directory is for the assignment, [C — JSON](https://felleisen.org/matthias/4500-f20/C.html). The purpose of this assignment was to be an exercise in our chosen programming language, [Typescript](https://www.typescriptlang.org/), and in collaborating on and delivering software.

It contains the following elements:

- `Makefile` : Used to handle basic environment setup for a Node environment compatible with Khoury's machines along with Typescript compilation.
- `xjson` : The shell-executable command-line program specified within the assignment prompt.
- `Test` : Directory containing test files.
  - `1-in.json` : input for testing the `xjson` program
  - `1-out.json` : expected output generated when running `xjson` with `1-in.json`
- `Other` : Directory containing all auxiliary files.
  - `package-lock.json` : Node generated file for specifying exact versions of Node packages.
  - `package.json` : Node generated file for handling project information and dependencies.
  - `tsconfig.json` : Configuration file for Typescript
  - `xjson.ts` : Typescript implementation for the prompt program.

### How To Run On Khoury Machines

Run these commands within the `C` directory:

```
scl enable rh-nodejs10 bash
make
chmod +x xjson
./xjson < [JSON file] // Run with input file
echo '[sequence of JSON values]' | ./xjson // Run with text input from command line 
```

`xjson` takes in a sequence of well-formatted JSON values from STDIN, parses them, and outputs them in the following two outputs to STDOUT:
- First, a JSON object with two fields, `count` which represents the number of JSON values entered in the input sequence, and `seq`, a list of all JSON values entered in the order they were entered.
- Second, a JSON list in which the first element represents the count of JSON values entered, and the remaining elements are the JSON values in reverse order.

### Design Decisions

To parse the JSON input, we used the `JSON.parse()` function that is included in the latest Javascript standard. While this function is the standard for parsing JSON in Javascript, it is somewhat limited in that it can only parse a single JSON value. Because JSON.parse() is so widely used, there aren't many well-supported JSON libraries for Javascript which is why we decided to use this function despite its limit. 

We decided not to use a library to tokenize the string input before parsing using `JSON.parse()` because the ones we found had little, if any, documentation and did not handle edge cases well. We decided it was not a good design decision to use a library that is not reliable and not well-supported. For this reason, we implemented our own method of separating the input string into valid JSON values before parsing.

# B

This directory is for the assignment, [B — Command Line](https://www.ccs.neu.edu/home/matthias/4500-f20/B.html). The purpose of this assignment was to be an exercise in our chosen programming language, [Typescript](https://www.typescriptlang.org/), and in collaborating on and delivering software.

It contains the following elements:

- `Makefile` : Used to handle basic environment setup for a Node environment compatible with Khoury's machines along with Typescript compilation.
- `xyes` : The shell-executable command-line program specified within the assignment prompt.
- `Other` : Directory containing all auxiliary files.
  - `package-lock.json` : Node generated file for specifying exact versions of Node packages.
  - `package.json` : Node generated file for handling project information and dependencies.
  - `tsconfig.json` : Configuration file for Typescript
  - `xyes.ts` : Typescript implementation for the prompt program.

### How To Run On Khoury Machines

Run these commands within the `B` directory:

```
scl enable rh-nodejs10 bash
make
chmod +x xyes
./xyes [-limit] [args ...]
```

`xyes` behaves similarly to the Unix `yes` command in that it infinitely echoes text to standard output. However, the user may define what string to echo via command line argument and specify whether to limit the output.

If no output string is specified, the program defaults to outputting `hello world`.

Additionally, if the first command line argument given is the `-limit` flag, then the program will limit its output to only 20 lines of the output string.
