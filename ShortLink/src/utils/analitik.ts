// Define types for the raw data
interface VisitorData {
  id: string;
  userid: string;
  url_id: string;
  useragent: string;
  referrer: string;
  location: string;
  accessedat: string;
}

// Define types for processed chart data
export interface ChartData {
  date: string;
  visitors: number;
}

// Helper function to process the raw data
export const processData = (data: VisitorData[]): ChartData[] => {
  const groupedData: Record<string, number> = {};

  // Group by date
  data.forEach((item) => {
    const date = new Date(item.accessedat).toISOString().split("T")[0]; // Extract the date (YYYY-MM-DD)
    if (groupedData[date]) {
      groupedData[date] += 1;
    } else {
      groupedData[date] = 1;
    }
  });

  // Convert grouped data to Recharts-compatible format
  return Object.keys(groupedData).map((date) => ({
    date,
    visitors: groupedData[date],
  }));
};
