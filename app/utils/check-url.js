export default function checkURL(urlString) {
  try {
    return Boolean(new URL(urlString));
  } catch {
    return false;
  }
}
