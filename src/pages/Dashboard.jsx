import React, { useEffect, useState, useRef } from "react";
import Card from "../components/ui/Card";
import { Briefcase, LogOut, Search, User, UserCheck } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardAnalytics,
  fetchRecentActivity,
  loadMoreActivity,
  clearDashboardError,
} from "../store/dashboardSlice";
import { motion } from "framer-motion";
import StatCard from "../components/ui/StatCard";
import AllIcons from "../assets/images/assets";
import Calendar from "react-calendar";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import RecentActivities from "../components/layout/RecentActivities";
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";

const { totalInquiriesIcon, cardProspectsIcon, PatientsIcon, LeadsIcon } =
  AllIcons;

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    totals,
    daily_trend,
    monthly_trend,
    recent_activity,
    isLoading,
    error,
    offset,
    limit,
  } = useSelector((state) => state.dashboard);
  const [visibleActivities, setVisibleActivities] = useState([]);
  const isInitialMount = useRef(true);

  useEffect(() => {
    dispatch(fetchDashboardAnalytics());
    dispatch(fetchRecentActivity());
  }, [dispatch]);

  useEffect(() => {
    if (recent_activity.length > 0) {
      const sortedActivities = [...recent_activity].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      const startIndex = Math.max(0, sortedActivities.length - (offset + limit));
      const endIndex = sortedActivities.length - offset;
      const slicedActivities = sortedActivities.slice(startIndex, endIndex);
      setVisibleActivities(slicedActivities);
    } else if (!isInitialMount.current) {
      setVisibleActivities([]);
    }
    if (isInitialMount.current) isInitialMount.current = false;
  }, [recent_activity, offset, limit]);

  if (isLoading) return <div className="text-center py-10"><LoaderDemo   /></div>;
  if (error)
    return (
      <div className="text-center py-10 text-red-600">
        {error}
        <Button
          variant="primary"
          size="sm"
          onClick={() => dispatch(clearDashboardError())}
          className="mt-4 px-4 py-2"
        >
          Dismiss
        </Button>
      </div>
    );

  // Filter daily_trend to last 7 days
  const last7Days = [...daily_trend]
    .sort((a, b) => new Date(b.day) - new Date(a.day))
    .slice(0, 7)
    .map((item) => ({
      day: new Date(item.day).getDate(), // Only day number (e.g., 5, 11)
      count: item.count,
    }));

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateStr = date.toISOString().split("T")[0];
      const trend = last7Days.find((item) => {
        const trendDate = new Date(daily_trend.find((d) => d.count === item.count)?.day || "").getDate();
        return trendDate === date.getDate();
      });
      if (trend && trend.count > 0) {
        return (
          <div className="text-center text-xs bg-blue-200 rounded-full w-6 h-6 flex items-center justify-center text-blue-800 font-medium shadow-sm">
            {trend.count}
          </div>
        );
      }
    }
    return null;
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/signin");
    }
  };

  const handleShowMore = () => {
    dispatch(loadMoreActivity());
  };

  // Calculate total count for calendar summary
  const totalCount = daily_trend.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-blue-700">
          Good to have you back, Doctor. Review your insights here.
        </h1>
        <Button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white flex items-center px-4 py-2 rounded-lg"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>
      {/* <LoaderDemo text="Loading patient records..." />
<LoaderDemo text="Scheduling appointment..." />
<LoaderDemo text="Processing insurance..." /> */}

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
          onClick={() => navigate("/prospects")}
        />
        <StatCard
          icon={PatientsIcon}
          value={totals.patients.toString()}
          label="Patient"
          color="#FFF0C2"
          onClick={() => navigate("/patients")}
        />
        <StatCard
          icon={LeadsIcon}
          value={totals.leads.toString()}
          label="Lead"
          color="#E8D1FF"
          onClick={() => navigate("/leads")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Inquiry Trend September 2025 (Last 7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last7Days}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value}
                interval={0} // Show all labels
              />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => value.toString()}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="count" fill="#4338ca" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Activity Calendar</h2>
            <span className="text-sm text-gray-600 font-medium">
              Total: {totalCount} inquiries
            </span>
          </div>
          <div className="p-2 bg-white rounded-lg shadow-lg">
            <Calendar
              value={new Date()}
              tileContent={tileContent}
              className="w-full text-sm"
              navigationLabel={({ date, label }) =>
                `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`
              }
              prev2Label={null}
              next2Label={null}
              tileClassName={({ date, view }) =>
                view === "month" &&
                last7Days.some((item) => {
                  const trendDate = new Date(daily_trend.find((d) => d.count === item.count)?.day || "").getDate();
                  return trendDate === date.getDate();
                })
                  ? "bg-blue-50 hover:bg-blue-100 transition-colors duration-200 rounded-full"
                  : "hover:bg-gray-100 transition-colors duration-200 rounded-full"
              }
            />
          </div>
        </Card>
      </div>

      <Card key={visibleActivities.length} className="p-4">
        <RecentActivities activities={visibleActivities} />
      </Card>
    </div>
  );
};

export default Dashboard;