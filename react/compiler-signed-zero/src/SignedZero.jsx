export function SignedZero({ condition }) {
  let value;
  if (condition) {
    value = 0;
  } else {
    value = -0;
  }
  return <output>{1 / value}</output>;
}
