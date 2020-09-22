/**
 * Given a string of command line arguments and pre-defined error message,
 * return the parsed size argument as a number or throw an exception on
 * invalid inputs.
 *
 * @param args The command line arguments.
 */
const fetchSizeFromArgs = (args: string[]): number => {
  const sizeStr: string = args[2];
  const sizeNum: number = sizeStr && parseFloat(sizeStr);

  if (!isValidSize(sizeNum)) {
    throw new Error();
  }

  return sizeNum;
};

/**
 * Determine whether the given number is a valid non-negative size.
 *
 * @param size The number to check.
 */
const isValidSize = (size: number): boolean => !isNaN(size) && size > 0 && Number.isInteger(size);

export { fetchSizeFromArgs, isValidSize };
