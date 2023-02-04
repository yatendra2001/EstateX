import logo from '../assets/logo.svg';

const Navigation = ({ account, setAccount }) => {
    return (
        <nav>
            <ul className='nav__links'>
                <li><a href="#">Buy</a></li>
                <li><a href="#">Rent</a></li>
                <li><a href="#">Sell</a></li>
            </ul>

            <div className='nav__brand'>
                <img src={logo} alt="Logo" />
                <h1>Millow</h1>
            </div>

            <button
                type='button'
                className='nav__connect'>0x0...</button>
        </nav>
    )

}

export default Navigation;
