const getStdin = require("get-stdin");

interface CountAndSeqOutput {
  readonly count: number;
  readonly seq: any[];
}

type ListOutput = { 0: number } & Array<any>;

/**
 * Take in a string and returns a boolean indicating if the string
 * is a valid JSON value.
 *
 * @param str string to evaluate
 * @return boolean indicating if the string can be parsed to JSON
 */
const isJsonString = (str: string): boolean => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

/**
 * Takes in a starting index and string and returns the index marking the end of
 * a parseable JSON value
 *
 * This is used for JSON values such as numbers, where the taking the first parseable
 * substring would not work (ex. with the string '12345' it shouldn't stop at '1' even
 * though '1' is a valid JSON value)
 *
 * @param start the index of the first character in jsonString to start evaluating
 * @param jsonString the string to be searched for a parseable JSON value
 * @return index indicating the end of a parseable JSON value
 */
const loopUntilUnparseable = (start: number, jsonString: String): number => {
  var tempString = "";
  for (var i = start; i < jsonString.length; ++i) {
    if (!isJsonString(tempString + jsonString[i]) && jsonString[i] !== ".") {
      return i;
    }
    tempString = tempString + jsonString[i];
  }
  return jsonString.length;
};

/**
 * Takes in a starting index and string and returns the index marking the point at which
 * there is a parseable JSON value
 *
 * This is used for JSON values such as strings, objects, lists, etc, the string is not
 * parseable until it includes the entire value (ex. string needs closing quotation marks,
 * object needs matching closing bracket)
 *
 * @param start the index of the first character in jsonString to start evaluating
 * @param jsonString the string to be searched for a parseable JSON value
 * @return index indicating the end of a parseable JSON value
 */
const loopUntilParseable = (start: number, jsonString: String): number => {
  var tempString = "";
  for (var i = start; i < jsonString.length; ++i) {
    tempString = tempString + jsonString[i];
    if (isJsonString(tempString)) {
      return loopUntilUnparseable(i + 1, jsonString);
    }
  }
  return -1;
};

/**
 * Takes in a string containing a series of "well formatted" JSON values and
 * returns an array of single JSON values in string format
 *
 * @param jsonString the string which is a series of "well formatted" JSON values
 * @return index indicating the end of a parseable JSON value
 */
const parseJsonSequence = (jsonString: String): Array<String> => {
  var jsonObjs = [];
  var i = 0;
  while (i < jsonString.length) {
    if (isJsonString(jsonString[i])) {
      var endParseable = loopUntilUnparseable(i, jsonString);
      jsonObjs.push(JSON.parse(jsonString.slice(i, endParseable)));
      i = endParseable;
    } else {
      var endParseable = loopUntilParseable(i, jsonString);
      if (endParseable !== -1) {
        jsonObjs.push(JSON.parse(jsonString.slice(i, endParseable)));
        i = endParseable;
      } else {
        i = jsonString.length;
      }
    }
  }
  return jsonObjs;
};

/**
 * Take a list of parsed JSON values and output a CountAndSeqOutput with count
 * being the length of the list and seq being the list itself.
 *
 * @param jsonValues the list of parsed JSON values
 */
const generateCountAndSeqOutput = (
  jsonValues: Array<any>
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
const generateListOutput = (jsonValues: Array<any>): ListOutput => {
  const count = jsonValues.length;
  const revSeq = jsonValues.reverse();

  return [count, ...revSeq];
};

const read = async (): Promise<any[]> => {
  const input: string = await getStdin();
  const parsed: any[] = parseJsonSequence(input);

  return parsed;
};

read().then((parsed: any[]) => {
  console.log(JSON.stringify(generateCountAndSeqOutput(parsed)));
  console.log(JSON.stringify(generateListOutput(parsed)));
});
