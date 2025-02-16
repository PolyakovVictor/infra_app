import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store.ts";
import { increment, decrement, incrementByAmount } from "./store/counterSlice";

function App() {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Redux Toolkit Counter</h1>
      <h2>{count}</h2>
      <button onClick={() => dispatch(increment())}>Increment</button>
      <button onClick={() => dispatch(decrement())}>Decrement</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>
        Increment by 5
      </button>
    </div>
  );
}

export default App;
