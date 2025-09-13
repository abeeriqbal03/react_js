import React from 'react';

export default function ShelterContact() {
  const address = 'Main Street, Karachi';
  const phone = '+92 300 1234567';
  const email = 'info@shelter.org';
  const mapQ = encodeURIComponent('Karachi');

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); alert('Copied!'); } catch { /* noop */ }
  };

  return (
    <div className="section-enter">
      <style>{`
        .contact-card { border-radius: .75rem; overflow: hidden; }
        .contact-info { font-size: .9rem; }
        .contact-label { font-weight: 600; }
        .contact-actions { display:flex; gap:.5rem; flex-wrap:wrap; }
        .map-wrapper { border-radius:.75rem; overflow:hidden; }
        @media (max-width: 576px) {
          .contact-info { font-size: .95rem; }
        }
      `}</style>

      <h2 className="h4 mb-3">📍 Shelter Contact</h2>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card contact-card p-3 h-100">
            <h6 className="fw-bold mb-2">Get in Touch</h6>
            <address className="contact-info mb-2 mb-sm-3" style={{marginBottom:0}}>
              <div className="mb-1">
                <span className="contact-label">Address:</span>{' '}
                <span>{address}</span>
              </div>
              <div className="mb-1">
                <span className="contact-label">Phone:</span>{' '}
                <a href={`tel:${phone.replace(/\s+/g,'')}`}>{phone}</a>
              </div>
              <div>
                <span className="contact-label">Email:</span>{' '}
                <a href={`mailto:${email}`}>{email}</a>
              </div>
            </address>

            <div className="contact-actions mt-auto">
              <a href={`mailto:${email}`} className="btn btn-primary btn-sm">Send Email</a>
              <a href={`tel:${phone.replace(/\s+/g,'')}`} className="btn btn-outline-secondary btn-sm">Call</a>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => copy(`${address} | ${phone} | ${email}`)}>Copy Info</button>
              <a className="btn btn-outline-primary btn-sm" href={`https://www.google.com/maps/search/?api=1&query=${mapQ}`} target="_blank" rel="noreferrer">Open in Maps</a>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="ratio ratio-16x9 card contact-card map-wrapper">
            <iframe
              src={`https://www.google.com/maps/place/Aptech+Learning,+Shahrah+e+Faisal+Center/@24.8632673,67.0725774,17z/data=!3m1!4b1!4m6!3m5!1s0x3eb33ea3db108f41:0x42acc4507358b160!8m2!3d24.8632639!4d67.0743981!16s%2Fg%2F11dzsvzrnx?entry=ttu&g_ep=EgoyMDI1MDkwOS4wIKXMDSoASAFQAw%3D%3D`}
              title="Shelter location map"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
