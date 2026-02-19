import Navbar from "../../components/Navbar";

const PrivacyPolicy = () => {
  return (
    <div>
      <Navbar />

      <section style={{ padding: "60px 20px", maxWidth: "1000px", margin: "auto" }}>
        <h1>Privacy Policy</h1>

        <p>
          UPNA DRYCLEANERS collects customer information such as name and phone number
          strictly for service processing and communication.
        </p>

        <h3>WhatsApp Communication</h3>
        <p>
          We use WhatsApp messaging to send order updates such as order collected,
          ready for pickup, and delivery notifications.
        </p>

        <h3>Data Protection</h3>
        <p>
          We do not sell or share customer data with third parties.
          Data is retained only for operational and accounting purposes.
        </p>

        <h3>Opt-Out</h3>
        <p>
          Customers can opt out of WhatsApp notifications anytime by contacting us at 8871327719.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
