import React from "react";

export default function Contact() {
  return (
    <div className="section-enter">
      <h2 className="h4">Contact</h2>
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card card-body">
            <div><strong>Email:</strong> hello@furever.example</div>
            <div><strong>Phone:</strong> +92-300-0000000</div>
            <div><strong>Address:</strong> Karachi, Pakistan</div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="ratio ratio-16x9">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=67.0600,24.8550,67.0850,24.8720&layer=mapnik&marker=24.86327,67.07258"
              title="Aptech Learning Shahrah-e-Faisal Center"
              style={{ border: 0 }}
              loading="lazy"
              width="100%"
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
