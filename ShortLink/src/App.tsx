import './App.css';
import { FaArrowRight } from 'react-icons/fa';
import Icon from './assets/Icon.svg';
import Logo from './assets/logo.svg';
import { useState } from 'react';
import foto from './assets/Group 86.svg';
import feat from './assets/feat-links 1.svg'

const LandingPage = () => {
  const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false);
  const [username, setUsername] = useState(''); // State untuk username
  const [password, setPassword] = useState(''); // State untuk password
  const [errorMessage, setErrorMessage] = useState(''); // State untuk pesan error

  // Fungsi untuk menampilkan popup login
  const handleVisitNowClick = () => {
    setIsLoginPopupVisible(true);
  };

  // Fungsi untuk menutup popup login
  const closeLoginPopup = () => {
    setIsLoginPopupVisible(false);
    setErrorMessage(''); // Reset pesan error saat popup ditutup
  };

  // Fungsi untuk menangani login
  const handleLogin = () => {
    if (username === 'Admin' && password === 'admin1234') {
      alert('Login berhasil!'); // Ganti dengan navigasi ke halaman lain jika diperlukan
    } else {
      alert('Username atau password salah'); // Tampilkan pesan error sebagai aler
    }
  };

  return (
    <div className="bg-gradient-to-r from-pink-100 via-white to-purple-100 min-h-screen text-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center py-4 px-20">
        <div className="flex items-center">
          <img src={Logo} alt="Logo" className="mr-2" />
          <div className="text-3xl font-bold text-indigo-600">DnD</div>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg" onClick={handleVisitNowClick}>
          Login
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex justify-between p-20">
        <div className="flex flex-col justify-center">
          <h1 className="text-6xl font-bold mb-4">Welcome to <span className="text-indigo-600">DnD</span></h1>
          <p className="text-2xl font-semibold mb-4">
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

        <div>
          <img src={Icon} alt="Icon" />
        </div>
      </section>

      {/* About Us Section */}
      <section className="p-20 bg-gradient-to-r from-orange-50 via-white to-pink-50">
        <div className='flex justify-between'>
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">About Us</h2>
            <p className="text-lg w-60 mb-6">
              S.id is your solution for shortening long URLs, making them easy to share and track with just a few clicks.
              We prioritize simplicity, security, and reliability, helping you streamline your online interactions.
            </p>
            <button className="bg-indigo-600 flex w-fit gap-2 items-center text-white px-6 py-3 rounded-lg" onClick={handleVisitNowClick}>
              Visit Now <FaArrowRight />
            </button>
          </div>

          <div>
            <img src={Icon} alt="Icon" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Fast, Easy, and Reliable</h2>
          <p className="text-lg">
            S.id is a link shortening service that makes it easy for you to turn long URLs into short, shareable links.
            Get click statistics and track your link performance with Shortly.
          </p>
          <div className='flex justify-center align-middle'>
            <img src={foto} alt="" className='w-3/5 absolute'/>
            <img src={feat} alt="" className='z-10'/>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-around items-center">
          {/* Feature 1 */}
          <div className="text-center mb-8 md:mb-0">
            <h3 className="text-xl font-bold">Short Link</h3>
            <p className="text-lg">Experience ultimate convenience with our URL shortening service.</p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <h3 className="text-xl font-bold">View Analytics</h3>
            <p className="text-lg">
              See the number of visitors to a shortened link, presented in a daily viewer graph.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-600 text-white py-8">
        <div className="text-center">
          <p>Team Contribution: me, you, you, you</p>
          <p>Created With Love ♥🔥</p>
          <p>
            The link-shortening project is an internship assignment merging frontend design with backend functionality.
          </p>
        </div>
      </footer>

      {/* Komponen Popup Login */}
      {isLoginPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
            <h2 className="text-2xl font-semibold mb-4">Login</h2>
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
