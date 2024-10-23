import "./App.css";
import { FaArrowRight } from "react-icons/fa";
import Icon from "./assets/Icon.svg";
import Logo from "./assets/logo.svg";
import { useState } from "react";
import foto from "./assets/Group 86.svg";
import feat from "./assets/feat-links 1.svg";
import facebook from "./assets/Icon_11_.png";
import twiter from "./assets/Twitter.png";
import linkedin from "./assets/Linkedin.png";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false); // State untuk popup login
  const [isRegisterPopupVisible, setIsRegisterPopupVisible] = useState(false); // State untuk popup Register
  const [username, setUsername] = useState(""); // State untuk username
  const [password, setPassword] = useState(""); // State untuk password
  const [errorMessage, setErrorMessage] = useState(""); // State untuk pesan error
  const navigate = useNavigate(); // State untuk navigate 
  const [email, setEmail] = useState(""); // State untuk email

  // Fungsi untuk menampilkan popup login
  const handleVisitNowClick = () => {
    setIsLoginPopupVisible(true);
  };

  // Fungsi untuk popup login
  const openLoginPopup = () => {
    setIsRegisterPopupVisible(false);
    setIsLoginPopupVisible(true);
    setErrorMessage("");
    setUsername("");
    setPassword("");
    setEmail("");
  };
  // Fungsi untuk popup login
  const closeLoginPopup = () => {
    setIsLoginPopupVisible(false);
    setErrorMessage(""); 
    setUsername(""); 
    setPassword(""); 
    setEmail("");
  };
  // Fungsi untuk popup Register
  const openResgisterPopup = () => {
    setIsRegisterPopupVisible(true);
    setIsLoginPopupVisible(false);
    setErrorMessage("");
    setUsername("");
    setPassword("");
    setEmail("");
  };
  // Fungsi untuk popup Register
  const closeRegisterPopup = () => {
    setIsRegisterPopupVisible(false);
    setErrorMessage("");
    setUsername("");
    setPassword("");
    setEmail("");
  };


  // Fungsi untuk menangani login
  const handleLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setErrorMessage("");
        navigate("/main-menu");
      } else {
        setErrorMessage("Username atau Password Salah");
      }
    } catch (error) {
      console.error("Error Fetching API", error);
      setErrorMessage("Api Gagal dimuat");
      alert('👻👻👻👻👻')
    }
  };
  // Fungsi untuk menangani register
  const handleRegister = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:3000/api/v1/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username, password }),
        }
      );

      if (response.ok) {
        setErrorMessage("");
        alert("💕💕💕Registrasi berhasil tolong login ulang💕💕💕");
        closeRegisterPopup(); // Menutup popup setelah registrasi berhasil
        openLoginPopup();
      } else {
        setErrorMessage("Registrasi gagal coba lagi");
      }
    } catch (error) {
      console.error("Error Fetching API", error);
      setErrorMessage("Terjadi kesalahan");
    }
  };

  return (
    <div className="bg-gradient-to-r from-pink-100 via-white to-purple-100 min-h-screen text-gray-900  md:pt-5">
      {/* Header */}
      <header className="md:px-[50px]">
        <section className="pt-4 md:px-10 border-none md:border-black md:rounded-xl md:border md:border-solid">
          <div className="flex justify-between items-center px-7">
            <div className="flex items-center">
              <img src={Logo} alt="Logo" className=" w-5 h-auto" />
              <div className="text-2xl font-bold text-indigo-600">DnD</div>
            </div>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg md:w-[153px]"
              onClick={handleVisitNowClick}
            >
              Login
            </button>
          </div>

          <div className="flex mt-[35px] flex-col md:flex-row-reverse md:pb-6 ">
            <div className="flex justify-center">
              <img src={Icon} alt="Icon" className="w-80 md:w-[450px]" />
            </div>

            <div className="flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold mb-4 md:text-5xl">
                Welcome to <span className="text-indigo-600">DnD</span>
              </h1>
              <p className="text-sm font-semibold mb-4 text-center md:text-xl">
                Best and Shortest Names for
                <br />
                <span className="text-indigo-600">
                  Supporting your marketing tools!
                </span>
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
      <section className="mt-[50px] p-6 md:px-10">
        <div className="from-pink-100 via-white to-purple-100">
          <div className="flex justify-between bg-white rounded-xl border border-black px-[10px] py-[15px] md:border-none  md:gap-10 md:bg-gradient-to-r md:from-pink-100 md:via-white md:to-purple-100">
            <div className="flex flex-col justify-center items-center">
              <h2 className="text-2xl font-bold mb-4 text-center md:text-4xl">
                About <span className="text-indigo-500">Us</span>
              </h2>
              <p className="text-base  mb-6 font-semibold text-[#3F458F] text-start justify-center md:w-[25rem] md:text-lg">
                DnD is your solution for shortening long URLs, making them easy
                to share and track with just a few clicks. We prioritize
                simplicity, security, and reliability, helping you streamline
                your online interactions.
              </p>
              <button
                className=" bg-indigo-600 items-center px-5 w-36 py-3 text-white gap-2 font-semibold rounded-xl hidden md:flex"
                onClick={handleVisitNowClick}
              >
                Visit Now <FaArrowRight />
              </button>
            </div>

            <div>
              <img
                src={Icon}
                alt="Icon"
                className="hidden md:block md:w-[400px]"
              />
            </div>
          </div>
        </div>
      </section>
      {/* end about section */}

      {/* Features Section */}
      <section className="py-12 px-4">
        <div className="text-center mb-12 relative">
          <div className="flex flex-col items-center md:flex-rol md:items-center md:justify-center">
            <div className="w-full mb-4 md:mb-0">
              <h2 className="text-base text-indigo-500 font-bold mb-2 md:text-5xl">
                Fast, Easy, and Reliable
              </h2>
              <p className="text-sm md:text-base md:w-72 md:text-center mx-auto">
                DnD is a link shortening service that makes it easy for you to
                turn long URLs into short, shareable links. Get click statistics
                and track your link performance with Shortly.
              </p>
            </div>

            <div className="relative w-full md:w-1/2 flex justify-center items-center">
              {/* Background Image (feat) */}
              <img
                src={feat}
                alt=""
                className="w-[221px] absolute z-10 md:w-[450px]"
              />
              {/* Foreground Image (foto) */}
              <img
                src={foto}
                alt=""
                className="w-[308px] relative z-0 md:w-[600px]"
              />
            </div>
          </div>
        </div>

        <div className=" flex flex-col md:flex-row justify-around items-center md:px-20">
          {/* Feature 1 */}
          <div className="bg-white border border-black text-center mb-8 md:mb-0 p-[10px] rounded-xl w-[247px] h-[247px]">
            <h3 className="text-2xl font-bold mt-6">Short Link</h3>
            <p className="text-base text-[#3F458F] text-center">
              Experience ultimate convenience with our URL shortening service,
              designed to encapsulate the essence of simplicity, speed and
              memorability.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-black text-center mb-8 md:mb-0 p-[10px] rounded-xl w-[247px] h-[247px]">
            <div className="text-center">
              <h3 className="text-2xl mt-7 font-bold">View Analytics</h3>
              <p className="text-base text-[#3F458F] flex items-center">
                feature on a link-shortening website displays the number of
                visitors to a shortened link, presented in a daily viewer graph.{" "}
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* end Features Section */}

      {/* Footer */}
      <footer className="bg-indigo-600 text-white pb-8 px-5 md:px-20">
        <div className="mb-12 md:grid md:grid-cols-3">
          <div className="flex flex-col items-center mt-11">
            <div className="flex justify-center items-center">
              <img src={Logo} alt="" />
              <h2 className="text-4xl font-bold">DnD</h2>
            </div>
            <p className="text-base w-56 text-center mt-2">
              DnD is your solution for shortening long URLs
            </p>
          </div>

          <div className="flex flex-col items-center mt-14 text-center">
            <h2 className="text-xl font-bold">Quick Links</h2>
            <p className="text-base  mt-4">Company</p>
            <p className="text-base  mt-3">Information</p>
            <p className="text-base  mt-3">Service</p>
            <p className="text-base  mt-3">Features</p>
          </div>

          <div className="mt-14 flex flex-col items-center">
            <div className="flex flex-col text-center items-center">
              <h2 className="text-xl font-bold">Vist Now</h2>
              <p className="text-base w-44 mt-6">
                Get started for free. Simplify the use of your links
              </p>
            </div>
            <button
              type="button"
              className="flex items-center bg-sky-500 px-5 w-fit py-3 text-white gap-2 font-semibold rounded-xl mt-4"
              onClick={handleVisitNowClick}
            >
              Visit Now <FaArrowRight />
            </button>
          </div>
        </div>

        <hr />
        <div className="flex flex-col items-center md:grid md:grid-cols-3 md:justify-items-center">
          <div className="flex mt-6">
            <p className="text-xl">A product of </p>
            <img src={Logo} alt="" className="w-5" />
          </div>
          <div className="mt-6">
            <p className="text-base">© 2024 DnD. Copyright not protected</p>
          </div>
          <div className="flex items-center mt-6">
            <a href="">
              <img src={facebook} alt="" />
            </a>
            <a href="">
              <img src={twiter} alt="" />
            </a>
            <a href="">
              <img src={linkedin} alt="" />
            </a>
          </div>
        </div>
      </footer>
      {/* end Footer */}

      {/* Komponen Popup Login dan Popup Register*/}
      {isLoginPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 popup-background show">
          <div className="bg-white rounded-lg p-4 shadow-lg w-[22rem] popup-container show">
            <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
            {errorMessage && (
              <p className="text-red-500 mb-4">{errorMessage}</p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
            >
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
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Login
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold"
                    onClick={openResgisterPopup}
                  >
                    Register
                  </button>
                </div>
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

      {/* Komponen Popup Login dan Popup Register*/}
      {isRegisterPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 popup-background show">
          <div className="bg-white rounded-lg p-4 shadow-lg w-[22rem] popup-container show">
            <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
            {errorMessage && (
              <p className="text-red-500 mb-4">{errorMessage}</p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
            >
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
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Enter your email"
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
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Register
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold"
                    onClick={openLoginPopup}
                  >
                    Login
                  </button>
                </div>
                <button
                  onClick={closeRegisterPopup}
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
