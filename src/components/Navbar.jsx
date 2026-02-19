import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "15px 30px",
      background: "#111827",
      color: "white",
      alignItems: "center"
    }}>
      <h2>UPNA DRYCLEANERS</h2>
      <div style={{ display: "flex", gap: "20px" }}>
        <Link style={{ color: "white", textDecoration: "none" }} to="/home">Home</Link>
        <Link style={{ color: "white", textDecoration: "none" }} to="/services">Services</Link>
        <Link style={{ color: "white", textDecoration: "none" }} to="/privacy-policy">Privacy</Link>
        <Link style={{ color: "white", textDecoration: "none" }} to="/terms">Terms</Link>
      </div>
    </nav>
  );
};

export default Navbar;
