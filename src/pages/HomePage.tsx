import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
    return (
        <div>
            <h1>Asztalitenisz Tornament</h1>
            <p>Üdvözöljük az asztalitenisz tornament menedzsment alkalmazásban!</p>
            <div>
                <h2>Navigáció</h2>
                <ul>
                    <li>
                        <Link to="/settings">Beállítások</Link>
                    </li>
                    <li>
                        <Link to="/tournament">Tornament</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default HomePage;