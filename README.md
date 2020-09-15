# CS 4500 - Fiona Gridley & Andrew Leung

This project contains assignment work for Northeastern's CS 4500: Software Development course.

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

## To Run

Run these commands within the `B` directory:

```
$ scl enable rh-nodejs10 bash
$ make
$ chmod +x xyes
$ ./xyes [-limit] [args ...]
```

`xyes` behaves similarly to the Unix `yes` command in that it infinitely echoes text to standard output. However, the user may define what string to echo via command line argument and specify whether to limit the output.

If no output string is specified, the program defaults to outputting `hello world`.

Additionally, if the first command line argument given is the `-limit` flag, then the program will limit its output to only 20 lines of the output string.
