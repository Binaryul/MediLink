import LoginBox from "./assets/Login/LoginBox"
import Header from "./components/Header"

function App() {
  return (
    <div className="App" style={{ display: "flex", flexDirection: "column" }}>
      <Header />
      <div style={{ flex: 1, display: "flex", flexWrap: "wrap" }}>
        <LoginBox />
      </div>
    </div>
  );
}

export default App;
