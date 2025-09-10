import React from "react";

export default function HalalCertification() {
  return (
    <main className="page page--halal">
      <section className="container">
        <h1 className="page-title">Halal Certification</h1>
        <p className="page-note">
          Chez Beyrouth is fully Halal. Our meat and ingredients are sourced from
          certified suppliers and handled to avoid cross-contamination.
        </p>

        <ul className="page-list">
          <li>Certified suppliers with valid documentation</li>
          <li>Dedicated prep tools & surfaces</li>
          <li>Ingredient verification and traceability</li>
        </ul>

        {/* If you have a certificate image/PDF, link it here */}
        {/* <a className="pill" href="/certificates/halal.pdf" target="_blank" rel="noreferrer">View Certificate (PDF)</a> */}
      </section>
    </main>
  );
}