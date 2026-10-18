export default function App(props) {
  const text = "café"; props.value = text;
  return <h1>{props.value}</h1>;
}
