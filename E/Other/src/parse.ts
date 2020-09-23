const Parser = require("jsonparse");

/**
 * Takes in a string containing a series of "well formatted" JSON values and
 * returns an array of single JSON values in string format.
 *
 * @param jsonString The string which is a series of "well formatted" JSON values.
 * @return The parsed array of separate JSON value strings.
 */
const parseJsonSequence = (jsonString: String): Array<String> => {
  const p = new Parser();
  let parsedValues: Array<String> = [];

  p.onValue = (value: string) => {
    if (p.stack.length === 0) {
      parsedValues.push(value);
    }
  };
  p.write(jsonString);

  return parsedValues;
};

export default parseJsonSequence;
