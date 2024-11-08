import React, { useEffect, useState } from 'react';
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

interface AnalyticsData {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}

const Analisis: React.FC = () => {
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
    <div style={{ width: '100%', height: '400px', maxWidth: '1000px', margin: 'auto' }}>
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
  );
};

export default Analisis;
