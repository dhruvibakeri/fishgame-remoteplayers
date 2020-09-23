const getStdin = require("get-stdin");
import parseJsonSequence from "./parse";

interface CountAndSeqOutput {
  readonly count: number;
  readonly seq: any[];
}

type ListOutput = { 0: number } & Array<any>;

/**
 * Take a list of parsed JSON values and output a CountAndSeqOutput with count
 * being the length of the list and seq being the list itself.
 *
 * @param jsonValues the list of parsed JSON values.
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
 * @param jsonValues the list of parsed JSON values.
 */
const generateListOutput = (jsonValues: Array<String>): ListOutput => {
  const count = jsonValues.length;
  const revSeq = jsonValues.reverse();
  return [count, ...revSeq];
};

/**
 * Read input from STDIN and parse it into a sequence of JSON values as strings
 *
 * @return A Promise containing the array of parsed JSON values.
 */
const read = async (): Promise<Array<String>> => {
  const input: string = await getStdin();
  const parsed: Array<String> = parseJsonSequence(input.trim());
  return parsed;
};

/**
 * Given a Promise containing an array of parsed JSON values, generate and log
 * JSON CountAndSeq and List outputs.
 *
 * @param parsedJson The array of parsed JSON values.
 * @return A string containing the generated output.
 */
const generateOutput = (parsedJson: Array<String>): string => {
  const countAndSeqOutput = JSON.stringify(
    generateCountAndSeqOutput(parsedJson)
  );
  const listOutput = JSON.stringify(generateListOutput(parsedJson));

  return countAndSeqOutput + "\n" + listOutput;
};

export { parseJsonSequence, generateOutput };
