import React, { useEffect } from "react";
import Card from "../components/ui/Card";
import { Briefcase, LogOut, Search, User, UserCheck } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardAnalytics } from "../store/dashboardSlice";
import { motion } from "framer-motion";
import StatCard from "../components/ui/StatCard";
import ActivityItem from "../components/layout/ActivityItem";
import AllIcons from "../assets/images/assets";
import Calendar from "react-calendar";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

const { totalInquiriesIcon, cardProspectsIcon, PatientsIcon, LeadsIcon } =
  AllIcons;

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { totals, daily_trend, monthly_trend, isLoading, error } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardAnalytics());
  }, [dispatch]);

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-600">{error}</div>;

  // Mock recent activity (replace with API call if needed)
  const recentActivity = [
    { icon: User, text: "New user registered", time: "2h ago" },
    { icon: Briefcase, text: "Lead converted to prospect", time: "4h ago" },
    { icon: UserCheck, text: "Patient follow-up scheduled", time: "6h ago" },
  ];

  // Prepare bar chart data
  const barChartData = daily_trend.map((item) => ({
    day: item.day.split("-")[2], // Show only day (e.g., "04")
    count: item.count,
  }));

  // Customize calendar tile content based on daily_trend
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];
      const trend = daily_trend.find((item) => item.day === dateStr);
      if (trend && trend.count > 0) {
        return (
          <div className="text-center text-xs bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-blue-800">
            {trend.count}
          </div>
        );
      }
    }
    return null;
  };
  const handleLogout = () => {
    alert("Logged out!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-text-primary">
          Dashboard Overview
        </h1>
        <Button
          onClick={handleLogout} // your logout function
          className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white  "
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out{" "}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={totalInquiriesIcon}
          value={totals.total_inquiries.toString()}
          label="Total Inquiry"
          color="#C2CCFF"
        />
        <StatCard
          icon={cardProspectsIcon}
          value={totals.prospects.toString()}
          label="Prospect"
          color="#C2FFE3"
          onClick={() => {
            navigate("/prospects");
          }}
        />

        <StatCard
          icon={PatientsIcon}
          value={totals.patients.toString()}
          label="Patient"
          color="#FFF0C2"
          onClick={() => {
            navigate("/patients");
          }}
        />
        <StatCard
          icon={LeadsIcon}
          value={totals.leads.toString()}
          label="Lead"
          color="#E8D1FF"
          onClick={() => {
            navigate("/leads");
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-4 text-text-primary">
            Inquiry Trend of{" "}
            {new Date().toLocaleString("default", { month: "long" })}{" "}
            {new Date().getFullYear()}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={daily_trend}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value} // Show only day (e.g., "04")
              />
              <Tooltip
                formatter={(value) => value.toString()}
                labelFormatter={(label) => `Day: ${label}`}
              />

              <Bar dataKey="count" fill="#4338ca" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold mb-4 text-text-primary">
            Analytics
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <Card>
              <h2 className="text-lg font-semibold mb-4 text-text-primary">
                Activity Calendar
              </h2>
              <div className="p-4">
                <Calendar
                  value={new Date()} // Default to current date
                  tileContent={tileContent}
                  className="w-full border-none shadow-md rounded-lg"
                  tileClassName={({ date, view }) =>
                    view === "month" &&
                    daily_trend.some(
                      (item) => item.day === date.toISOString().split("T")[0]
                    )
                      ? "bg-blue-50 hover:bg-blue-100"
                      : ""
                  }
                />
              </div>
            </Card>{" "}
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-lg font-semibold text-text-primary mb-2">
          Recent Activity
        </h2>
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ActivityItem {...activity} />
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;


