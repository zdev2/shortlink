import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { notification } from 'antd';
import type { NotificationArgsProps } from 'antd';

type NotificationPlacement = NotificationArgsProps['placement'];

interface DecodedToken {
  exp: number;
  iat: number;
  // Add other properties of the decoded token as needed
}

interface AnalyticsData {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}

interface BodyData {
  url: string;
  shortlink: string;
  title: string;
  expiredTime?: number; // Optional property
}

interface ShortLink {
  id: string;
  shortLink: string;
  originalUrl: string;
  clicks: number;
  status: string;
  createdAt: string;
  lastAccessedAt: string | null;
  title: string;
  qrCodeUrl: string;
}

const Analisis: React.FC = () => {
  const navigate = useNavigate();
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [expiredTime, setExpiredTime] = useState<number | null>(null);
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openNotification = (placement: NotificationPlacement) => {
    notification.info({
      message: `Notification ${placement}`,
      description:
        'Registrasi Berhasil silahkan kembali Login',
      placement,
    });
  };

  const generateRandomSlug = (length: number = 6): string => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let slug = "";
    for (let i = 0; i < length; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return slug;
  };

  const resetInputs = () => {
    setOriginalUrl("");
    setCustomSlug("");
    setCustomTitle("");
    setExpiredTime(null);
  };

  const authToken = localStorage.getItem("Authorization"); // Replace 'authToken' with your actual key

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 401) {
        // Handle unauthorized response (e.g., redirect to login or clear session)
        console.log("Session expired, redirecting to login...");
        navigate("/")
        openNotification("top")
        // Clear any session data or redirect the user
      } else if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
      }

      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const validateUrl = (url: string) => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" +
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" +
        "((\\d{1,3}\\.){3}\\d{1,3}))" +
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
        "(\\?[;&a-z\\d%_.~+=-]*)?" +
        "(\\#[-a-z\\d_]*)?$",
      "i"
    );
    return !!urlPattern.test(url);
  };

  const handleShorten = async () => {
    if (!originalUrl || !validateUrl(originalUrl)) {
      notification.error({
        message: 'Shorten Failed',
        description: 'Please enter a valid URL.',
        placement: 'top',
      });
      return;
    }
    // Generate a random slug and set it as customSlug
    const randomSlug = generateRandomSlug();
    setCustomSlug(randomSlug);
    setIsPopupOpen(true);
  };

  useEffect(() => {
    const showAllURLs = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          try {
            const decoded: DecodedToken = jwtDecode(token);
            console.log(decoded);
            if (decoded.exp < Date.now() / 1000) {
              console.error("Token has expired");
              // Handle token expiry (e.g., log out user or refresh token)
            }
          } catch (error) {
            console.error("Error decoding token:", error);
          }
        } else {
          console.error("No token found in localStorage");
        }

        const response = await fetch("http://127.0.0.1:3000/api/v1/urls", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error("Unauthorized access - possible invalid or expired token.");
            localStorage.removeItem("authToken");
            // navigate("/main-menu")
          } else {
            console.error("Failed to fetch URLs. Status code:", response.status);
          }
          return;
        }

        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const links: ShortLink[] = data.data.urls.map((item: any) => ({
          id: item.id,
          shortLink: `https://dnd.id/${item.shortlink}`,
          originalUrl: item.url || "",
          title: item.url_title || "Untitled",
          clicks: item.clickcount || 0,
          status: item.status || "inactive",
          createdAt: item.createdat || "N/A",
          lastAccessedAt: item.lastaccesedat || null,
          qrCodeUrl: item.qr_code || "",
        }));

        setShortLinks(links);
        console.log(links); // Log the final links array
      } catch (error) {
        console.error("Error fetching URLs:", error);
      }
    };

    showAllURLs();
  }, []);

  const handlePopupSubmit = async () => {
    if (!customSlug || !customTitle) {
      notification.error({
        message: 'Shorten Failed',
        description: 'Please complete all fields including custom slug and custom title.',
        placement: 'top',
      });
      return;
    }

    try {
      const bodyData: BodyData = {
        url: originalUrl,
        shortlink: customSlug,
        title: customTitle,
      };

      if (expiredTime !== null) {
        bodyData.expiredTime = expiredTime;
      }

      const response = await fetch("http://127.0.0.1:3000/api/v1/urls", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorText = await response.json();
        console.error(`Error: ${errorText.message}`);
        alert("Failed to shorten the link. Please try again.");
        return;
      }

      const data = await response.json();
      const newLink: ShortLink = {
        id: data.data.url_details.id,
        shortLink: `https://dnd.id/${data.data.shortlink}`,
        originalUrl: originalUrl,
        title: customTitle,
        clicks: data.data.url_details.clickcount,
        status: data.data.url_details.status,
        createdAt: data.data.url_details.createdat,
        lastAccessedAt: data.data.url_details.lastaccesedat || null,
        qrCodeUrl: data.data.url_details.qr_code,
      };

      setShortLinks([newLink, ...shortLinks]);
      setOriginalUrl("");
      setCustomSlug("");
      setExpiredTime(null);
      setCustomTitle("");
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Error fetching API:", error);
    }
  };

  const data: AnalyticsData[] = [
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
  ];

  const [labelAngle, setLabelAngle] = useState(0);
  const [bottomMargin, setBottomMargin] = useState(10);

  useEffect(() => {
    const updateLabelSettings = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 600) {
        setLabelAngle(-90); // Mobile: Vertical labels
        setBottomMargin(50); // Increased margin for vertical labels
      } else if (screenWidth < 992) {
        setLabelAngle(-45); // Tablet: Angled labels
        setBottomMargin(30); // Moderate margin for angled labels
      } else {
        setLabelAngle(0); // Desktop: Horizontal labels
        setBottomMargin(10); // Minimal margin for horizontal labels
      }
    };

    updateLabelSettings();
    window.addEventListener('resize', updateLabelSettings);
    return () => window.removeEventListener('resize', updateLabelSettings);
  }, []);

  return (
    <>
    {/* Logout Button */}
    <div className="flex justify-between mt-4 ">
      <h1 className="text-2xl md:text-4xl font-bold text-center ">
        URL Shortener
      </h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 text-white text-xs font-semibold"
      >
        Logout
      </button>
    </div>

    {/* Input Original Link */}
    <div className="flex md:flex-row justify-center w-[1075px] py-1 px-2 bg-white rounded-full border-4 border-blue-600 ">
      <input
        type="text"
        value={originalUrl}
        onChange={(e) => setOriginalUrl(e.target.value)}
        placeholder="Enter original URL"
        className="p-3 border-gray-300 text-xs flex-1 rounded-lg"
      />
      <button
        onClick={handleShorten}
        className="bg-blue-600 text-white px-4 py-2 text-xs flex-shrink-0 min-w[100px] w-fit font-semibold rounded-full"
      >
        Shorten now
      </button>
    </div>

    {/* Navigasi */}
    <div className="flex justify-center mt-4">
      <button
        onClick={() => navigate("/main-menu")}
        className="bg-blue-600 text-white px-4 py-2 text-xs w-fit font-semibold rounded-full"
      >
        Shortlink
      </button>
    </div>

    {/* Customize Your Link */}
    {isPopupOpen && (
      <div className="fixed inset-0 z-10 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            Customize Your Link
          </h2>
          <div className="p-2 mb-2 bg-gray-200 rounded-lg w-fit ">
            <p>
              <strong>Shortlink:</strong>{" "}
              {customSlug
                ? `https://dnd.id/${customSlug}`
                : "https://dnd.id/"}
            </p>
          </div>
          <input
            type="text"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            placeholder="Enter custom slug"
            className="p-2 border border-gray-300 rounded-lg w-full mb-4"
          />
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="Enter custom title"
            className="p-2 border border-gray-300 rounded-lg w-full mb-4"
          />
          <input
            type="number"
            value={expiredTime || ""}
            onChange={(e) =>
              setExpiredTime(e.target.value ? parseInt(e.target.value) : null)
            }
            placeholder="Expired time in minutes (optional)"
            className="p-2 border border-gray-300 rounded-lg w-full mb-4"
          />
          <div className="flex justify-end gap-4">
            <button
              onClick={handlePopupSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Submit
            </button>
            <button
              onClick={() => {
                resetInputs(); // Reset inputs saat popup ditutup
                setIsPopupOpen(false);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    <div className='z-0' 
      style={{ width: '100%', height: '400px', maxWidth: '1000px', margin: 'auto' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: bottomMargin,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={labelAngle}
            textAnchor={labelAngle === -90 ? 'end' : 'middle'}
            dy={10} // Adjusted offset for better alignment
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    </>
  );
};

export default Analisis;
