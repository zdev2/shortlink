import './App.css';
import { FaArrowRight } from 'react-icons/fa';
import Icon from './assets/Icon.svg';
import Logo from './assets/logo.svg';
import { useState } from 'react';
import foto from './assets/Group 86.svg';
import feat from './assets/feat-links 1.svg';
import { useNavigate } from 'react-router-dom';

  const LandingPage = () => {
  const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false);
  const [username, setUsername] = useState(''); // State untuk username
  const [password, setPassword] = useState(''); // State untuk password
  const [errorMessage, setErrorMessage] = useState(''); // State untuk pesan error
  const navigate = useNavigate();

  // Fungsi untuk menampilkan popup login
  const handleVisitNowClick = () => {
    setIsLoginPopupVisible(true);
  };

  // Fungsi untuk menutup popup login
  const closeLoginPopup = () => {
    setIsLoginPopupVisible(false);
    setErrorMessage(''); // Reset pesan error saat popup ditutup
    setUsername(''); // Reset username menj i kosong saat popup ditutup
    setPassword(''); // Reset password menjadi kosong saat popup ditutup
  };

  // Fungsi untuk menangani login
  const handleLogin = () => {
    if (username === 'admin' && password === 'admin1234') {
      setErrorMessage('');
      navigate('/main-menu');
    } else {
      setErrorMessage('Username atau password salah');
    }
  };

  return (
    <div className="bg-gradient-to-r from-pink-100 via-white to-purple-100 min-h-screen text-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center px-7 pt-5">
        <div className="flex items-center">
          <img src={Logo} alt="Logo" className=" w-5 h-auto" />
          <div className="text-2xl font-bold text-indigo-600">DnD</div>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" onClick={handleVisitNowClick}>
          Login
        </button>
      </header>
      {/* end header */}

      {/* Hero Section */}
      <section className="flex justify-between mt-[35px]">
        <div className="flex flex-col justify-center">
        <div>
          <img src={Icon} alt="Icon"  className='w-80'/>
        </div>
        
        <div className='flex flex-col items-center'>
          <h1 className="text-4xl font-bold mb-4">Welcome to <span className="text-indigo-600">DnD</span></h1>
          <p className="text-sm font-semibold mb-4 text-center">
            Best and Shortest Names for<br /> 
            <span className="text-indigo-600">Supporting your marketing tools!</span>
          </p>
          <button
            type="button"
            className="flex items-center bg-indigo-600 px-5 w-fit py-3 text-white gap-2 font-semibold rounded-xl"
            onClick={handleVisitNowClick}
          >
            Visit Now <FaArrowRight />
          </button>
          </div>
       
        </div>

      </section>
      {/* end hero section */}

     
      {/* About Us Section */}
      <section className="mt-[69px] p-6">
      <div>
        <div className='flex justify-between bg-white rounded-xl border border-black px-[10px] py-[15px] '>
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4 text-center">About <span className='text-indigo-500'>Us</span></h2>
            <p className="text-base  mb-6 font-semibold text-[#3F458F] text-center">
              S.id is your solution for shortening long URLs, making them easy to share and track with just a few clicks.
              We prioritize simplicity, security, and reliability, helping you streamline your online interactions.
            </p>
            <button className="bg-indigo-600  w-fit gap-2 items-center text-white px-6 py-3 rounded-lg hidden" onClick={handleVisitNowClick}>
              Visit Now <FaArrowRight />
            </button>
          </div>

          <div>
            <img src={Icon} alt="Icon"className='hidden lg:block' />
          </div>
        </div>
        </div>
      </section>
      {/* end about section */}

      {/* Features Section */}
      <section className="py-12 px-4">
        <div className="text-center mb-12 relative">
          <div className='flex flex-col items-center md:flex-rol md:items-center md:justify-center'>
            <div className="w-full md:w-1/2 mb-4 md:mb-0">
              <h2 className="text-base text-indigo-500 font-bold mb-2">Fast, Easy, and Reliable</h2>
              <p className="text-sm md:text-base">
                S.id is a link shortening service that makes it easy for you to turn long URLs into short, shareable links.
                Get click statistics and track your link performance with Shortly.
              </p>
            </div>

            <div className="relative w-full md:w-1/2 flex justify-center items-center">
              {/* Background Image (feat) */}
              <img src={feat} alt="" className='w-[221px] absolute z-10' />
              {/* Foreground Image (foto) */}
              <img src={foto} alt="" className='w-[308px] relative z-0' />
            </div>
          </div>
        </div>

        <div className=" flex flex-col md:flex-row justify-around items-center">
          {/* Feature 1 */}
          <div className="bg-white border border-black text-center mb-8 md:mb-0 p-[10px] rounded-xl w-[247px] h-[247px]">
            <h3 className="text-2xl font-bold mt-6">Short Link</h3>
            <p className="text-base text-[#3F458F] text-center">Experience ultimate convenience with our URL shortening service, designed to encapsulate the essence of simplicity, speed and memorability.</p>
          </div>

          {/* Feature 2 */}
          <div className='bg-white border border-black text-center mb-8 md:mb-0 p-[10px] rounded-xl w-[247px] h-[247px]'>
          <div className="text-center">
            <h3 className="text-2xl mt-7 font-bold">View Analytics</h3>
            <p className="text-base text-[#3F458F] flex items-center">
            feature on a link-shortening website displays the number of visitors to a shortened link, presented in a daily viewer graph.            </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-600 text-white py-8">
        <div className="text-center">
          <p>Team Contribution: me, you, you, you</p>
          <p>Created With love ♥🔥</p>
          <p>
            The link-shortening project is an internship assignment merging frontend design with backend functionality.
          </p>
        </div>
      </footer>

      {/* Komponen Popup Login */}
      {isLoginPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 popup-background show">
          <div className="bg-white rounded-lg p-4 shadow-lg w-[15rem] popup-container show">
            <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Username       
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Enter your username"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password 
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Login
                </button>
                <button
                  onClick={closeLoginPopup}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
