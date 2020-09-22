const getStdin = require("get-stdin");
import parseJsonSequence from "./parseUtils";

interface CountAndSeqOutput {
  readonly count: number;
  readonly seq: any[];
}

type ListOutput = { 0: number } & Array<any>;

/**
 * Take a list of parsed JSON values and output a CountAndSeqOutput with count
 * being the length of the list and seq being the list itself.
 *
 * @param jsonValues the list of parsed JSON values
 */
const generateCountAndSeqOutput = (
  jsonValues: Array<String>
): CountAndSeqOutput => {
  const count = jsonValues.length;
  const seq = jsonValues;
  return { count, seq };
};

/**
 * Take a list of parsed JSON values and output a ListOutput with its first element
 * being the length of the list and the rest of the elements being the reversed
 * elements of the given list.
 *
 * @param jsonValues the list of parsed JSON values
 */
const generateListOutput = (jsonValues: Array<String>): ListOutput => {
  const count = jsonValues.length;
  const revSeq = jsonValues.reverse();
  return [count, ...revSeq];
};

const read = async (): Promise<Array<String>> => {
  const input: string = await getStdin();
  const parsed: any[] = parseJsonSequence(input.trim());
  return parsed;
};

read()
  .then((parsed: Array<String>) => {
    console.log(JSON.stringify(generateCountAndSeqOutput(parsed)));
    console.log(JSON.stringify(generateListOutput(parsed)));
  })
  .catch((err) => alert(err));
