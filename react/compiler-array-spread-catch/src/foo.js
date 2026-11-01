export function foo() {
  'use memo';
  try {
    return [...1];
  } catch {
    return 'caught';
  }
}
