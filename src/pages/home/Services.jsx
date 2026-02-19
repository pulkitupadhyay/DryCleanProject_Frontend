import Navbar from "../../components/Navbar";

const ServicesPage = () => {
  return (
    <div>
      <Navbar />

      <section style={{ padding: "60px 20px", maxWidth: "1000px", margin: "auto" }}>
        <h1>Our Services</h1>

        <h3>Dry Cleaning</h3>
        <p>Professional dry cleaning for all types of garments.</p>

        <h3>Steam Ironing</h3>
        <p>High-quality steam ironing to maintain garment finish.</p>

        <h3>Regular Laundry</h3>
        <p>Daily wear washing and folding services.</p>

        <h3>Bulk Laundry</h3>
        <p>Household and commercial laundry solutions.</p>

        <h3>Premium Garment Care</h3>
        <p>Special handling for delicate fabrics.</p>

        <p style={{ marginTop: "30px" }}>
          Operating Hours: Monday – Sunday | 9:00 AM – 8:00 PM
        </p>
      </section>
    </div>
  );
};

export default ServicesPage;
