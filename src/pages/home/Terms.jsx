import Navbar from "../../components/Navbar";

const TermsPage = () => {
  return (
    <div>
      <Navbar />

      <section style={{ padding: "60px 20px", maxWidth: "1000px", margin: "auto" }}>
        <h1>Terms & Conditions</h1>

        <p>
          By using our services, customers agree to provide accurate information for order processing.
        </p>

        <h3>Service Liability</h3>
        <p>
          UPNA DRYCLEANERS is not responsible for damage caused due to inherent fabric defects.
        </p>

        <h3>Payment Policy</h3>
        <p>
          Payment is due at the time of delivery unless otherwise agreed.
        </p>

        <h3>Refund Policy</h3>
        <p>
          Customers must report dissatisfaction within 24 hours of service delivery.
          Refunds are handled on a case-by-case basis.
        </p>
      </section>
    </div>
  );
};

export default TermsPage;
