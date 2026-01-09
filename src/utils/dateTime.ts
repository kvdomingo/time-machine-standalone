export function getTimezoneOffsetMillis() {
  return new Date().getTimezoneOffset() * 60 * 1000;
}

export function millisToDays(ms: number) {
  return ms / 1000 / 60 / 60 / 24;
}
