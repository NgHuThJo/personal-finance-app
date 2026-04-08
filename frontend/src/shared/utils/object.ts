import { Logger } from "#frontend/shared/app/logging";

export function formDataToObject(formData: FormData) {
  const convertedFormData = Array.from(formData.entries()).reduce<{
    [Key: string]: FormDataEntryValue | FormDataEntryValue[];
  }>((acc, [key, value]) => {
    if (acc[key] !== undefined) {
      acc[key] = Array.isArray(acc[key])
        ? [...acc[key], value]
        : [acc[key], value];
    } else {
      acc[key] = value;
    }

    return acc;
  }, {});

  return convertedFormData;
}

export function assignValue<T, K extends keyof T>(obj: T, key: K, value: T[K]) {
  return (obj[key] = value);
}

export function decodeJwt(jwt: string) {
  // Get mid section of JWT which contains the payload
  const payload = jwt.split(".")[1];

  if (payload === undefined) {
    Logger.error(`JWT has not payload in ${decodeJwt.name}`, jwt);
    throw new Error("JWT parsing error");
  }

  // Convert Base64URL to standard Base64 since atob() method only works with standard Base64
  const decodedPayload = payload?.replace(/-/g, "+").replace(/_/g, "/");
  // Convert standard Base64 to binary string (string where each character is a byte (0-255), it may not be readable text)
  // Additional note: atob() is not safe for UTF-8 multibyte characters
  const binaryString = atob(decodedPayload);
  // Convert binary string to typed array of 8-bit unsigned integers
  const byteArray = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
  // Interpret bytes as UTF-8 and return UTF-8 string
  const json = new TextDecoder().decode(byteArray);
  const parsedJson = JSON.parse(json);

  if (parsedJson.sub === null || parsedJson.sub === undefined) {
    Logger.error(`JWT has no user ID in ${decodeJwt.name}`, jwt);
    throw new Error("Parsed JWT does not have a user ID");
  } else {
    return parsedJson as {
      sub: string;
    };
  }
}
