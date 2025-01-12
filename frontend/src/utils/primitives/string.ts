export function convertAllUnderscoresToHyphens(text: string) {
  return text.replaceAll(/_/g, "-");
}

export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}
