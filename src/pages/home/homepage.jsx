import Navbar from "../../components/Navbar";

const Homepage = () => {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1581578731548-c64695cc6952')",
        backgroundSize: "cover",
        color: "white",
        padding: "120px 20px",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "48px" }}>Professional Dry Cleaning in Bhopal</h1>
        <p>Reliable • Hygienic • Affordable</p>
      </section>

      {/* About */}
      <section style={{ padding: "60px 20px", maxWidth: "1000px", margin: "auto" }}>
        <h2>About UPNA DRYCLEANERS</h2>
        <p>
          UPNA DRYCLEANERS is a locally operated dry cleaning and laundry service
          based in Bhopal, Madhya Pradesh. We provide professional garment care,
          ironing, and premium fabric treatment services.
        </p>
        <p><strong>Proprietor:</strong> Aashish Malviya</p>
        <p><strong>Address:</strong> Shop No. 13, Huzur Salaiya, Bhopal - 462026</p>
        <p><strong>Phone:</strong> 8871327719</p>
      </section>

      {/* WhatsApp CTA */}
      <section style={{
        background: "#22c55e",
        padding: "40px",
        textAlign: "center",
        color: "white"
      }}>
        <h2>Need Laundry Service?</h2>
        <a
          href="https://wa.me/918871327719"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "white",
            color: "#22c55e",
            padding: "12px 20px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Chat on WhatsApp
        </a>
      </section>
    </div>
  );
};

export default Homepage;
