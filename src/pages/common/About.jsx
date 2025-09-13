import React from "react";

export default function About() {
  const css = `
  :root{
    --white: #ffffff;
    --blue:  #0ea5e9;   
    --pale:  #e9eef7;  

    --bg: var(--white);
    --bg-soft: var(--pale);
    --card: var(--white);
    --card-border: var(--blue);
    --text: var(--blue);
    --muted: var(--blue);
    --brand: var(--blue);
    --brand-2: var(--pale);
    --accent: var(--blue);
    --shadow: 0 10px 30px rgba(14,165,233,.15);
  }
  @media (prefers-color-scheme: light){
    :root{
      --bg: var(--white);
      --bg-soft: var(--pale);
      --card: var(--white);
      --card-border: var(--blue);
      --text: var(--blue);
      --muted: var(--blue);
      --brand: var(--blue);
      --brand-2: var(--pale);
      --accent: var(--blue);
      --shadow: 0 8px 24px rgba(14,165,233,.18);
    }
  }

  .about{
    background: linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 55%, var(--bg) 100%);
    color: var(--text);
    min-height: 100%;
  }
  .about * { box-sizing: border-box; }

  
  .about-hero{
    position: relative;
    padding: clamp(56px, 8vw, 100px) 16px 32px;
    background: linear-gradient(135deg, #95d9f7, var(--bg-soft));
  }
  .about-hero__inner{
    max-width: 1100px;
    margin: 0 auto;
    text-align: center;
    animation: fadeUp .7s ease both;
  }
  .about-kicker{
    letter-spacing: .18em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--white);
    margin: 0 0 8px;
    font-size: .85rem;
  }
  .about-title{
    font-size: clamp(2rem, 4.5vw, 3.25rem);
    line-height: 1.1;
    margin: 0;
    font-weight: 800;
    color: #252121;              +
    text-shadow: 0 3px 4px rgba(14,165,233,.25);
  }
  .about-lead{
    max-width: 850px;
    margin: 18px auto 0;
    color: var(--white);
    opacity: .95;
    font-size: clamp(1rem, 1.25vw, 1.15rem);
    line-height: 1.7;
  }

  
  .about-wrap{
    max-width: 1100px;
    margin: clamp(24px, 4vw, 48px) auto 80px;
    padding: 0 16px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 18px;
  }
  @media (min-width: 900px){
    .about-wrap{ grid-template-columns: 1fr 1fr; }
    .about-promise{ grid-column: 1 / -1; }
  }

  
  .about-card{
    background: var(--card);
    border: 1px solid var(--card-border);
    box-shadow: var(--shadow);
    border-radius: 18px;
    padding: clamp(18px, 2.4vw, 28px);
    transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
  }
  .about-card:hover{
    transform: translateY(-3px);
    box-shadow: 0 14px 38px rgba(14,165,233,.18);
    border-color: var(--blue);
  }
  .about-h2{
    margin: 0 0 10px;
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: .2px;
    color: var(--blue);
  }
  .about-h3{
    margin: 0 0 10px;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--blue);
  }
  .about p{
    margin: 8px 0 0;
    color:  #0ea5e9; 
    line-height: 1.7;
    font-size: 1rem;
  }
  .about-strong{ color: var(--blue); font-weight: 700; }

  
  .about-list{
    list-style: none;
    padding: 0;
    margin: 6px 0 0;
    display: grid;
    gap: 10px;
  }
  .about-list li{
    position: relative;
    padding-left: 36px;
    color: var(--blue);
  }
  .about-list li::before{
    content: "🐾";
    position: absolute;
    left: 0;
    top: 0.05rem;
    font-size: 1.1rem;
    filter: drop-shadow(0 1px 0 rgba(14,165,233,.25));
  }

  
  .about-promise{
    background: linear-gradient(180deg, var(--bg-soft), var(--card));
    border: 1px solid var(--card-border);
    text-align: center;
  }
  .about-italic{ font-style: italic; color: var(--blue); margin-top: 6px; }
  .about-tagline{
    margin-top: 14px;
    font-weight: 800;
    color: var(--blue);
    font-size: 1.05rem;
  }

  
  @keyframes fadeUp{
    from{ opacity: 0; transform: translateY(8px); }
    to{ opacity: 1; transform: translateY(0); }
  }
  `;

  return (
    <div className="about">
      <style dangerouslySetInnerHTML={{ __html: css }} />


      <header className="about-hero">
        <div className="about-hero__inner">
          <p className="about-kicker">Welcome to</p>
          <h1 className="about-title">FurEver Care</h1>
          <p className="about-lead">
            At <strong>FurEver Care</strong>, we believe pets bring endless joy,
            loyalty, and love—and they deserve the same in return. Our goal is to
            make pet care easier, kinder, and more accessible for every animal lover.
          </p>
        </div>
      </header>


      <main className="about-wrap">
        <section className="about-card">
          <h2 className="about-h2">Our Mission</h2>
          <p>
            Our mission is to create a trusted home for pet parents where compassion
            meets quality. We strive to provide guidance, products, and services that
            help pets live longer, healthier, and happier lives.
          </p>
        </section>

        <section className="about-card">
          <h2 className="about-h2">What We Offer</h2>
          <ul className="about-list paw-list">
            <li>
              <span className="about-strong">Expert Advice:</span> Reliable articles,
              blogs, and tips—from training and nutrition to health and behavior.
            </li>
            <li>
              <span className="about-strong">Quality Products:</span> Essentials that
              are safe, tested, and tailored for your furry friend’s comfort.
            </li>
            <li>
              <span className="about-strong">Pet Adoption Support:</span> Resources
              that connect loving families with pets looking for forever homes.
            </li>
            <li>
              <span className="about-strong">Community & Care:</span> A welcoming
              place for stories, experiences, and support.
            </li>
          </ul>
        </section>

        <section className="about-card">
          <h2 className="about-h2">Why Choose FurEver Care?</h2>
          <p>
            We aren’t just another pet website—we’re a community built on trust and
            love. Every recommendation and product is chosen with your pet’s
            well-being at heart. With us, you’re not just shopping or reading—you’re
            joining a family that truly understands the bond between humans and animals.
          </p>
        </section>

        <section className="about-card about-promise">
          <h3 className="about-h3">
            At FurEver Care, we don’t just care for pets—we celebrate them.
          </h3>
          <p className="about-italic">
            Because to us, pets aren’t just animals; they’re family, best friends,
            and lifelong companions.
          </p>
          <p className="about-tagline">FurEver Care — Where Pets Come First, Always.</p>
        </section>
      </main>
    </div>
  );
}
