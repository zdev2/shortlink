import './App.css'
import { FaArrowRight } from 'react-icons/fa';
import Icon from  './assets/Icon.svg';
import Logo from  './assets/logo.svg';
import { useState } from 'react';


const LandingPage = () => {

  const[showLogin, setShowLogin] = useState(false);

  const handleButtonClick = () => {
    setShowLogin(true);
  }

  const handleClosePopup = () => {
    setShowLogin(false);
  }

  return (
    <div className="bg-gradient-to-r from-pink-100 via-white to-purple-100 min-h-screen text-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center py-4 px-20">
        <div className='flex justify-center'>
          <img src={Logo}  />
          <div className="text-3xl font-bold flex flex-wrap items-center text-indigo-600">Dnd</div>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg">Login</button>
      </header>

      {/* Hero Section */}
      <section className='flex justify-between p-20'>
      <div className='flex flex-row justify-center'>
        <div className='flex flex-col justify-center'>
          <h1 className='text-6xl font-bold mb-5'>
            Welcome to <span className='text-indigo-600'>DnD</span>
          </h1>
          <p className='text-2xl font-semibold mb-5'>
            Best and Shortest Names for<br />
            <span className='text-indigo-600'>Supporting your marketing tools!</span>
          </p>
          <div>
            <button
            type="button"
            onClick={handleButtonClick}
            className='flex items-center bg-indigo-600 px-5 py-3 text-white gap-2 font-semibold rounded-xl'
          >
            Visit Now <FaArrowRight />
            </button>
          </div>
        </div>

        <div>
        <img src={Icon} className=''  />
      </div>  
      </div>

      {/* Popup Halaman Login */}
      {showLogin && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-75 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 relative transition-transform transform duration-300 scale-100">
            <h2 className="text-3xl font-bold mb-4 text-center">Login</h2>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700">Username</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter username"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-500 transition-colors"
              >
                Login
              </button>
            </form>
            {/* Close button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </section>

      {/* About Us Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-orange-50 via-white to-pink-50">
        <div className="text-center">

          <h2 className="text-3xl font-bold mb-4 text-blue-800">About Us</h2>
          <p className="text-lg mb-6">S.id is your solution for shortening long URLs, making them easy to share and track with just a few clicks. We prioritize simplicity, security, and reliability, helping you streamline your online interactions.</p>
          <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg">Visit now</button>
        </div>
        <div>
          <img src={Icon} alt="" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Fast, easy, and reliable</h2>
          <p className="text-lg">S.id is a link shortening service that makes it easy for you to turn long URLs into short, shareable links. Get click statistics and track your link performance with Shortly.</p>
        </div>

        <div className="flex flex-col md:flex-row justify-around items-center">
          {/* Feature 1 */}
          <div className="text-center mb-8 md:mb-0">
            <h3 className="text-xl font-bold">Short link</h3>
            <p className="text-lg">Experience ultimate convenience with our URL shortening service.</p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <h3 className="text-xl font-bold">View analyst</h3>
            <p className="text-lg">See the number of visitors to a shortened link, presented in a daily viewer graph.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-600 text-white py-8">
        <div className="text-center">
          <p>Team Contribution: me, you, you, you</p>
          <p>Created With Love ♥🔥</p>
          <p>The link-shortening project is an internship assignment merging frontend design with backend functionality.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
