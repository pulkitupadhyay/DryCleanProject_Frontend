import React from "react";

const Homepage = () => {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6", color: "#333" }}>
      
      {/* Hero Section */}
      <section style={{ background: "#0f172a", color: "white", padding: "60px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>
          UPNA DRYCLEANERS
        </h1>
        <p style={{ fontSize: "18px" }}>
          Professional Dry Cleaning & Laundry Services in Bhopal
        </p>
      </section>

      {/* About Section */}
      <section style={{ padding: "40px 20px", maxWidth: "900px", margin: "auto" }}>
        <h2>About Us</h2>
        <p>
          UPNA DRYCLEANERS is a trusted laundry and dry cleaning service located in Bhopal.
          We provide high-quality fabric care services with attention to detail and customer satisfaction.
        </p>
        <p>
          Proprietor: <strong>Aashish Malviya</strong>
        </p>
      </section>

      {/* Services Section */}
      <section style={{ background: "#f3f4f6", padding: "40px 20px" }}>
        <div style={{ maxWidth: "900px", margin: "auto" }}>
          <h2>Our Services</h2>
          <ul>
            <li>Dry Cleaning</li>
            <li>Steam Ironing</li>
            <li>Regular Laundry</li>
            <li>Premium Garment Care</li>
            <li>Bulk Laundry Services</li>
            <li>Special Fabric Treatment</li>
          </ul>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ padding: "40px 20px", maxWidth: "900px", margin: "auto" }}>
        <h2>Contact Us</h2>
        <p><strong>Phone:</strong> 8871327719</p>
        <p><strong>Address:</strong> Shop No. 13, Huzur Salaiya, Bhopal, 462026</p>
        <p><strong>Email:</strong> support@upnadrycleaners.com</p>
      </section>

      {/* Privacy Policy */}
      <section style={{ background: "#f9fafb", padding: "40px 20px", maxWidth: "900px", margin: "auto" }}>
        <h2>Privacy Policy</h2>
        <p>
          UPNA DRYCLEANERS respects your privacy. We collect customer contact information
          only for order processing, service updates, and communication regarding laundry services.
        </p>
        <p>
          We do not sell or share personal data with third parties. Customer information
          is used strictly for service-related communication including WhatsApp notifications.
        </p>
        <p>
          If you have any privacy concerns, please contact us at 8871327719.
        </p>
      </section>

      {/* Footer */}
      <footer style={{ background: "#111827", color: "white", padding: "20px", textAlign: "center" }}>
        <p>© {new Date().getFullYear()} UPNA DRYCLEANERS. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default Homepage;
