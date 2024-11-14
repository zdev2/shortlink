import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from "react-router-dom";
// import {jwtDecode} from "jwt-decode";
import { AreaChart, Area } from 'recharts';
import { XAxis,YAxis,CartesianGrid,Tooltip } from 'recharts';
import { notification } from 'antd';
import type { NotificationArgsProps } from 'antd';
import { Dropdown, Button, Menu, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { FaUser, FaHandPointer } from 'react-icons/fa';

type NotificationPlacement = NotificationArgsProps['placement'];

// interface DecodedToken {
//   exp: number;
//   iat: number;
//   // Add other properties of the decoded token as needed
// }

interface BodyData {
  url: string;
  shortlink: string;
  title: string;
  expiredTime?: number; // Optional property
}

interface DataItem {
  name: string;
  uv: number;
  pv: number;
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
  const [totalUv, setTotalUv] = useState(0);
  const [totalPv, setTotalPv] = useState(0);

  const {id=''} = useParams()

  console.log(id)

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

  // useEffect(() => {
  //   const showAllURLs = async () => {
  //     try {
  //       const token = localStorage.getItem("authToken");
  //       if (token) {
  //         try {
  //           const decoded: DecodedToken = jwtDecode(token);
  //           console.log(decoded);
  //           if (decoded.exp < Date.now() / 1000) {
  //             console.error("Token has expired");
  //             // Handle token expiry (e.g., log out user or refresh token)
  //           }
  //         } catch (error) {
  //           console.error("Error decoding token:", error);
  //         }
  //       } else {
  //         console.error("No token found in localStorage");
  //       }

  //       const response = await fetch("http://127.0.0.1:3000/api/v1/urls", {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (!response.ok) {
  //         if (response.status === 401) {
  //           console.error("Unauthorized access - possible invalid or expired token.");
  //           localStorage.removeItem("authToken");
  //           // navigate("/main-menu")
  //         } else {
  //           console.error("Failed to fetch URLs. Status code:", response.status);
  //         }
  //         return;
  //       }

  //       const data = await response.json();
  //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //       const links: ShortLink[] = data.data.urls.map((item: any) => ({
  //         id: item.id,
  //         shortLink: `https://dnd.id/${item.shortlink}`,
  //         originalUrl: item.url || "",
  //         title: item.url_title || "Untitled",
  //         clicks: item.clickcount || 0,
  //         status: item.status || "inactive",
  //         createdAt: item.createdat || "N/A",
  //         lastAccessedAt: item.lastaccesedat || null,
  //         qrCodeUrl: item.qr_code || "",
  //       }));

  //       setShortLinks(links);
  //       console.log(links); // Log the final links array
  //     } catch (error) {
  //       console.error("Error fetching URLs:", error);
  //     }
  //   };

  //   showAllURLs();
  // }, []);

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
      notification.error({
        message: 'Shorten Failed',
        description: 'There was a problem connecting to the server. Please check your connection and try again.',
        placement: 'top',
      });
    }
  };

  const data3Days = useMemo(() => [
    { name: 'Day 1', uv: 2000, pv: 2500 },
    { name: 'Day 2', uv: 1500, pv: 2000 },
    { name: 'Day 3', uv: 2000, pv: 2500 },
  ], []);

  const data7Days = useMemo(() => [
    { name: 'Day 1', uv: 2500, pv: 3000 },
    { name: 'Day 2', uv: 2000, pv: 2500 },
    { name: 'Day 3', uv: 2500, pv: 3000 },
    { name: 'Day 4', uv: 1500, pv: 2000 },
    { name: 'Day 5', uv: 2000, pv: 2500 },
    { name: 'Day 6', uv: 1000, pv: 1500 },
    { name: 'Day 7', uv: 2500, pv: 3000 },
  ], []);

  const data1Month = useMemo(() => [
    { name: 'Week 1', uv: 6300, pv: 7800 },
    { name: 'Week 2', uv: 5000, pv: 6000 },
    { name: 'Week 3', uv: 7500, pv: 8500 },
    { name: 'Week 4', uv: 4000, pv: 5000 },
  ], []);

  const [selectedData, setSelectedData] = useState<DataItem[]>(data3Days);
  type TimeRange = '3days' | '7days' | '1month';
  const [selectedLabel, setSelectedLabel] = useState('3 Hari');

  useEffect(() => {
    const totalUvSum = selectedData.reduce((sum, item) => sum + item.uv, 0);
    const totalPvSum = selectedData.reduce((sum, item) => sum + item.pv, 0);
    setTotalUv(totalUvSum);
    setTotalPv(totalPvSum);
  }, [selectedData]);

  // Fungsi untuk mengubah data berdasarkan pilihan waktu
  const handleTimeRangeChange = (range: TimeRange) => {
    switch (range) {
      case '3days':
        setSelectedData(data3Days);
        setSelectedLabel('3 Hari');
        break;
      case '7days':
        setSelectedData(data7Days);
        setSelectedLabel('7 Hari');
        break;
      case '1month':
        setSelectedData(data1Month);
        setSelectedLabel('1 Bulan');
        break;
      default:
        setSelectedData(data3Days);
        setSelectedLabel('Pilih Rentang Waktu');
    }
  };

  const menu = (
    <Menu onClick={(e) => handleTimeRangeChange(e.key as TimeRange)}>
      <Menu.Item key="3days">3 Hari</Menu.Item>
      <Menu.Item key="7days">7 Hari</Menu.Item>
      <Menu.Item key="1month">1 Bulan</Menu.Item>
    </Menu>
  );

  return (
    <div className='flex justify-center flex-col items-center'>
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
      ) }

      {/* Dropdown pilihan rentang waktu */}
      <div 
      className='flex justify-between w-[1000px]'
      style={{ marginBottom: '20px' }}>
        <div>
          <h4>Analystic</h4>
        </div>
        <Dropdown overlay={menu}>
          <Button>
            <Space>
              {selectedLabel}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </div>

      <div className='z-0' 
        style={{ width: '100%', height: '400px', maxWidth: '1000px', margin: 'auto' }}>
        <AreaChart width={1000} height={300} data={selectedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis strokeOpacity={0} dataKey="name" />
          <YAxis strokeOpacity={0} />
          <CartesianGrid strokeDasharray="1 1" />
          <Tooltip />
          <Area type="monotone" dataKey="uv" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
          <Area type="monotone" dataKey="pv" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" />
        </AreaChart>
      </div>

      <div className='flex gap-24'>
        <div className="mb-5 p-5 border rounded-lg flex items-center justify-evenly shadow-md w-64">
          <div className="bg-purple-100 p-3 rounded-full mb-3">
            <FaHandPointer style={{ color: '#6A0DAD', fontSize: '24px' }} />
          </div>
          <div>
            <div className="text-center">
              <span className="text-2xl font-bold text-purple-800">{totalUv}</span>
              <p className="text-purple-600">Total Click</p>
            </div>
            <Dropdown overlay={menu}>
              <Button>
                <Space>
                  {selectedLabel}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </div>
        <div className="mb-5 p-5 border rounded-lg flex items-center justify-evenly shadow-md w-64">
          <div className="bg-purple-100 p-3 rounded-full mb-3">
            <FaUser style={{ color: '#6A0DAD', fontSize: '24px' }} />
          </div>
          <div>
            <div className="text-center">
              <span className="text-2xl font-bold text-purple-800">{totalPv}</span>
              <p className="text-purple-600">Total Click</p>
            </div>
            <Dropdown overlay={menu}>
              <Button>
                <Space>
                  {selectedLabel}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Analisis;
