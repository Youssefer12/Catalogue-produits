import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="text-center" style={{ padding: '50px' }}>
      <h1>Bienvenue sur TechStore Maroc</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Découvrez nos smartphones, PC portables, tablettes et accessoires électroniques aux meilleurs prix en MAD.
      </p>
      <Link to="/produits" className="btn">
        Voir le catalogue
      </Link>
    </div>
  );
}
