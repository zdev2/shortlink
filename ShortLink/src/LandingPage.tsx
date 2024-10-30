import './App.css';
import { FaArrowRight } from 'react-icons/fa';
import Icon from './assets/Icon.svg';
import Logo from './assets/logo.svg';
import { useState } from 'react';
import foto from './assets/Group 86.svg';
import feat from './assets/feat-links 1.svg';
import facebook from './assets/Icon_11_.png';
import twiter from './assets/Twitter.png'
import linkedin from './assets/Linkedin.png'
import close from './assets/close.svg'
import { useNavigate } from 'react-router-dom';

  const LandingPage = () => {
  const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false); // State untuk popup Login
  const [isRegisterPopupVisible, setIsRegisterPopupVisible] = useState(false); // State untuk popup Register
  const [email, setEmail] = useState(''); // State untuk email 
  const [username, setUsername] = useState(''); // State untuk username
  const [password, setPassword] = useState(''); // State untuk password
  const [errorMessage, setErrorMessage] = useState(''); // State untuk pesan error
  const navigate = useNavigate(); // State untuk navigate

  // Fungsi untuk menampilkan popup login
  const handleVisitNowClick = () => {
    setIsLoginPopupVisible(false);
    setIsRegisterPopupVisible(true);
  };

  // Fungsi untuk menutup popup login
  const closeLoginPopup = () => {
    setIsLoginPopupVisible(false);
    setErrorMessage(''); // Reset pesan error saat popup ditutup  
    setUsername(''); // Reset username menj i kosong saat popup ditutup
    setPassword(''); // Reset password menjadi kosong saat popup ditutup
    setEmail('');
  };

  // Fungsi untuk menutup popup Register
  const closeRegisterPopup = () => {
    setIsRegisterPopupVisible(false);
    setErrorMessage('');
    setUsername('');
    setPassword('');
    setEmail('');
  };

  // Fungsi untuk membuka popup  Register
  const openResgisterPopup = () => {
    setIsRegisterPopupVisible(true);
    setIsLoginPopupVisible(false);
    setErrorMessage('');
    setUsername('');
    setPassword('');
    setEmail('');
  }

  // Fungsi untuk membuka popup  Login
  const openLoginPopup = () => {
    setIsRegisterPopupVisible(false);
    setIsLoginPopupVisible(true);
    setErrorMessage('');
    setUsername('');
    setPassword('');
    setEmail('');
  };

  // Fungsi untuk menangani login
  const handleLogin = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/users/login', {
        method : 'POST',
        headers : {
          'Content-Type' : 'application/json',
        },
        body : JSON.stringify ({username, password}),
      });
      // const data = await response.json();

      if (response.ok) {
        setErrorMessage('');
        navigate('/main-menu');
      } else {
        setErrorMessage('Username atau Password Salah');
      }
    }catch (error){
      console.error('Error Fetchin API', error)
      setErrorMessage('terjadi kesalahan')
    }
  }
  // Fungsi untuk menangani Register
  const handleRegister = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      if (response.ok) {
        setErrorMessage('');
        alert ('💕💕💕Registrasi berhasil tolong login ulang💕💕💕')
        closeRegisterPopup(); // Menutup popup setelah registrasi berhasil
        openLoginPopup();
      } else {
        setErrorMessage('Registrasi gagal ');
      }
    } catch (error) {
      console.error('Error Fetching API', error);
      setErrorMessage('Terjadi kesalahan');
    }
  };

  return (
  <div className="bg-gradient-to-r from-pink-100 via-white to-purple-100 min-h-screen text-gray-900  md:pt-5">
    
      {/* Header */}
    <header className="md:px-[50px] px-6">
      <section className='pt-4 md:px-14 border-none md:border-black md:rounded-xl md:border md:border-solid xl:py-14'>
        <div className='flex justify-between items-center'>
        <div className="flex items-center">
          <img src={Logo} alt="Logo" className=" w-5 h-auto md:w-11 xl:w-14" />
          <div className="text-2xl font-bold text-indigo-600 lg:text-4xl">DnD</div>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg md:w-[100px] xl:text-3xl xl:w-44 xl:p-3" onClick={handleVisitNowClick}>
          Login
        </button> 
        </div>

      <div className="flex mt-[35px] flex-col md:flex-row-reverse md:pb-10 justify-between ">
        <div className='flex justify-center'>
          <img src={Icon} alt="Icon"  className='w-80 md:w-[450px] xl:w-[700px]'/>
        </div>
        
        <div className='flex flex-col items-center justify-center text-center md:items-start md:text-left'>
          <h1 className="text-4xl font-bold mb-4 md:text-5xl xl:text-7xl">Welcome to <span className="text-indigo-600">DnD</span></h1>
          <p className="text-sm font-semibold mb-4 text-center md:text-left md:text-xl xl:text-2xl">
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
    </header>
       {/* end header */}

      {/* About Us Section */}
      <section className="mt-[50px] p-6 md:px-10 xl:px-40">
      <div className='from-pink-100 via-white to-purple-100'>
     
      <div className='flex justify-between bg-white rounded-xl border border-black px-[10px] py-[15px] md:items-start md:border-none  md:gap-10 md:bg-gradient-to-r md:from-pink-100 md:via-white md:to-purple-100'>
      
      <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4 text-center md:text-left md:text-4xl xl:text-7xl">About <span className='text-indigo-500'>Us</span></h2>
            <p className="text-base  mb-6 font-semibold text-[#3F458F] text-start justify-center md:w-[25rem] md:text-lg">
              DnD is your solution for shortening long URLs, making them easy to share and track with just a few clicks.
              We prioritize simplicity, security, and reliability, helping you streamline your online interactions.
            </p>
            <button className=" bg-indigo-600 items-center px-5 w-36 py-3 text-white gap-2 font-semibold rounded-xl hidden md:flex" onClick={handleVisitNowClick}>
                Visit Now <FaArrowRight />
            </button>

          </div>

          <div>
            <img src={Icon} alt="Icon"className='hidden md:block md:w-[450px] xl:w-[700px]' />
          </div>
        </div>
        </div>
      </section>
      {/* end about section */}

      {/* Features Section */}
      <section className="py-12 px-4">    
        <div className="text-center mb-12 relative">
          <div className='flex flex-col items-center md:flex-rol md:items-center md:justify-center'>
            <div className="w-full mb-4 md:mb-0">
              <h2 className="text-base text-indigo-500 font-bold mb-2 md:text-5xl">Fast, Easy, and Reliable</h2>
              <p className="text-sm md:text-base md:w-72 md:text-center mx-auto">
                  DnD is a link shortening service that makes it easy for you to turn long URLs into short, shareable links.
                  Get click statistics and track your link performance with Shortly.
              </p>
        </div>

            <div className="relative w-full md:w-1/2 flex justify-center items-center">
              {/* Background Image (feat) */}
              <img src={feat} alt="" className='w-[221px] absolute z-10 md:w-[450px]' />
              {/* Foreground Image (foto) */}
              <img src={foto} alt="" className='w-[308px] relative z-0 md:w-[600px]' />
            </div>
          </div>
        </div>

        <div className=" flex flex-col md:flex-row justify-around items-center md:px-20">
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
      {/* End Features Section */}

      {/* Footer */}  
      <footer className="bg-indigo-600 text-white py-8 px-5 md:px-20">
        <div className='mb-12 md:grid md:grid-cols-3'>
          <div className='flex flex-col items-center mt-11'>
            <div className='flex justify-center items-center'>
              <img src={Logo} alt="" />
                <h2 className='text-4xl font-bold'>DnD</h2>
            </div> 
              <p className='text-base w-56 text-center mt-2'>DnD is your solution for shortening long URLs</p>
          </div>

          <div className='flex flex-col items-center mt-14 `text-center'>
            <h2 className='text-xl font-bold'>Quick Links</h2>
              <p className='text-base  mt-4'>Company</p>
              <p className='text-base  mt-3'>Information</p>
              <p className='text-base  mt-3'>Service</p>
              <p className='text-base  mt-3'>Features</p>
          </div>

          <div className='mt-14 flex flex-col items-center'>
            <div className='flex flex-col text-center items-center'>
                <h2 className='text-xl font-bold'>Vist Now</h2>
                <p className='text-base w-44 mt-6'>Get started for free.Simplify the use of your links</p>            
            </div>
            <button
              type="button"
              className="flex items-center bg-sky-500 px-5 w-fit py-3 text-white gap-2 font-semibold rounded-xl mt-4"
              onClick={handleVisitNowClick}
            >
              Visit Now <FaArrowRight/>
            </button>
          </div>
        </div>
        <hr/>
        <div className='flex flex-col items-center md:grid md:grid-cols-3 md:justify-items-center'>
          <div className='flex mt-6'>
            <p className='text-xl'>A product of </p>
            <img src={Logo} alt="" className='w-5'/>
          </div>
          <div className='mt-6'>
            <p className='text-base'>© 2024 DnD. Copyright not protected</p>
          </div>
          <div className='flex items-center mt-6'>
            <a href=""><img src={facebook} alt="" /></a>
            <a href="" className='mx-4'><img src={twiter} alt="" /></a>
            <a href=""><img src={linkedin} alt="" /></a>
          </div>
        </div>
      </footer>

      {/* Komponen Popup Login dan Popup Register*/}
      {isLoginPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 popup-background show">
          <div className="bg-white rounded-lg p-4 shadow-lg w-[250px] popup-container show md:w-[350px] md:px-10 lg:py-10 ">
          <button
                  onClick={closeLoginPopup}
                  className="font-bold text-2xl"
                >
                  <img src={close} alt="" className='w-5' />
                </button>
            <h2 className="text-2xl font-bold mb-4 text-center lg:text-4xl">Welcome Back</h2>
          
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <div className="mb-4">
              
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 lg:text-xl"
                  placeholder="Enter your username"
                />
              </div>
              
              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 lg:text-xl "
                  placeholder="Enter your password"
                />
              </div>

              <div className='flex gap-1'>
                <p className='text-sm cursor-default lg:text-lg'>Didn't have account?</p>
                  <a
                    type="submit"
                    className="text-sm cursor-pointer text-blue-600 mb-3 font-bold lg:text-xl"
                    onClick={openResgisterPopup}
                  >
                    Register
                  </a>
                  </div>
              <div className="f">
                <div className='flex gap-4'>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold w-full lg:text-2xl"
                  >
                    Login
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}
      
      {isRegisterPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 popup-background show">
          <div className="bg-white rounded-lg p-4 shadow-lg w-[250px] popup-container show  md:w-[350px] md:px-10 lg:py-10 ">
          <button
                  onClick={closeRegisterPopup}
                  className=""
                >
                  <img src={close} alt="" className='w-5'/>
                </button>
            <h2 className="text-2xl font-bold mb-4 text-center lg:text-4xl">Get's Started</h2>
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
            <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
              <div className="mb-4">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 lg:text-xl"
                  placeholder="Enter your username"
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 lg:text-xl"
                  placeholder="Enter your email"
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 lg:text-xl"
                  placeholder="Enter your password"
                />
              </div>
            <div className='flex gap-1'>
              <p className='text-sm cursor-default lg:text-lg'>Already have account?</p>
              <a
                    type="submit"
                    className="font-bold cursor-pointer text-blue-600 mb-3 text-sm lg:text-lg"
                    onClick={openLoginPopup}
                  >
                    Login
                  </a>
              </div>

                <div className='flex gap-4'>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold w-full lg:text-2xl"
                  >
                    Register
                  </button>
                </div>
  
            </form>
          </div>
        </div>
        // register end
       
        // login and register popup end
      )}
  </div>
  );
};

export default LandingPage;