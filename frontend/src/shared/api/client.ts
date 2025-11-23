export async function fetchData(
  url: string | Request | URL,
  options?: RequestInit,
) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = await response.json();

  return data;
}
