export function capitalizeFirstLetter(text: string) {
  if (text?.[0] === undefined) {
    return text;
  } else {
    return text[0].toUpperCase() + text.substring(1);
  }
}

export function removeLeadingZeroes(numericString: string) {
  const trimmedString = numericString.replace(/^0+/, "");

  return trimmedString || "0";
}
