import logo from "/MediLink.svg";

function Header() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        backgroundColor: "#fff",
        padding: "1px 10px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <img src={logo} alt="MediLink Logo" style={{ height: "40px" }} />
      <h1
        style={{
          marginLeft: "10px",
          fontFamily: "Arial",
        }}
      >
        MediLink
      </h1>
    </header>
  );
}

export default Header;
