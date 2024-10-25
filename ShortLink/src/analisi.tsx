// src/AnalyticsPage.tsx
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

interface AnalyticsData {
  label: string; // Ganti dengan label sesuai data yang Anda terima
  value: number; // Ganti dengan value sesuai data yang Anda terima
}

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("http://127.0.0.1:3000/api/v1/analytics");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setAnalyticsData(data); // Sesuaikan dengan struktur data dari API Anda
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const chartData = {
    labels: analyticsData.map((item) => item.label), // Sesuaikan sesuai dengan label yang Anda terima
    datasets: [
      {
        label: "Analytics Data", // Ganti dengan nama dataset Anda
        data: analyticsData.map((item) => item.value), // Sesuaikan dengan value yang Anda terima
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <div>
      <h2>Analytics</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Bar data={chartData} options={{ responsive: true }} />
      )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
