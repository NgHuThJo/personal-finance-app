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
