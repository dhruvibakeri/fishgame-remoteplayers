#!/usr/bin/env node
const args = process.argv.slice(2)

const printArgs = (limit?: number, args: String[] = ["hello world"]): void => {
    for ( var i = 0; i < limit; i++ ) {
        console.log(args.join(" "));
    }
} 

if (!args.length) {
    console.log('Hello world')
} else if (args[0] === '-limit') {
    console.log(`limit: ${args.slice(1).join(" ")}`)
    printArgs(20)
} else {
    console.log(`no limit: ${args.join(" ")}`)
}

// if (yargs.argv._.includes('')
// console.log(yargs.argv._)



