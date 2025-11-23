export function capitalizeFirstLetter(text: string) {
  if (text?.[0] === undefined) {
    return text;
  } else {
    return text[0].toUpperCase() + text.substring(1);
  }
}
