import React, { useEffect, useState, useRef } from "react";
import Card from "../components/ui/Card";
import { LogOut, Stethoscope, Syringe } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardAnalytics,
  fetchVisitCounts,
  fetchVisitDetails,
  fetchRecentActivity,
  loadMoreActivity,
  clearDashboardError,
} from "../store/dashboardSlice";
import StatCard from "../components/ui/StatCard";
import AllIcons from "../assets/images/assets";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import RecentActivities from "../components/layout/RecentActivities";
import CustomCalendar from "../components/ui/CustomCalendar";
import PopOutCard from "../components/layout/PopOutCard";
import LoaderDemo from "../components/ui/ProfessionalMedicalLoader ";
import BarChartComponent from "../components/ui/BarChartComponent"; // Import the new component

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
    visit_counts,
    visit_details,
    isLoading,
    error,
    offset,
    limit,
  } = useSelector((state) => state.dashboard);

  const [visibleActivities, setVisibleActivities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const isInitialMount = useRef(true);

  const currentMonth = new Date().getMonth() + 1; // 1-12
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-${currentMonth
    .toString()
    .padStart(2, "0")}-01`;
  const endDate = `${currentYear}-${currentMonth
    .toString()
    .padStart(2, "0")}-${new Date(currentYear, currentMonth, 0).getDate()}`;

  useEffect(() => {
    dispatch(fetchDashboardAnalytics());
    dispatch(fetchRecentActivity());
    dispatch(fetchVisitCounts({ start: startDate, end: endDate }));
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    if (recent_activity.length > 0) {
      const sortedActivities = [...recent_activity].sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      const startIndex = Math.max(
        0,
        sortedActivities.length - (offset + limit)
      );
      const endIndex = sortedActivities.length - offset;
      const slicedActivities = sortedActivities.slice(startIndex, endIndex);
      setVisibleActivities(slicedActivities);
    } else if (!isInitialMount.current) {
      setVisibleActivities([]);
    }
    if (isInitialMount.current) isInitialMount.current = false;
  }, [recent_activity, offset, limit]);

  const handleDateClick = (date) => {
    const day = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    dispatch(fetchVisitDetails({ day }));
    setSelectedDate(day);
    setShowDetails(true);
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

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-10">
        <LoaderDemo />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-10 mt-20 px-4 text-center max-w-xl mx-auto bg-red-50 border border-red-200 rounded-xl shadow-sm">
       <div className="flex text-red-700 gap-3 text-xl font-medium"><Stethoscope color="black" size={35} className="animate-bounce"/> {error}</div>

        <div className="flex flex-wrap justify-center gap-4">
          {/* <Button
          variant="primary"
          size="sm"
          onClick={() => dispatch(clearDashboardError())}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition-all duration-200 flex items-center gap-2 font-medium"
        >
          Dismiss
        </Button> */}

          <Button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2 rounded-lg shadow transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </div>
    );

  // Filter daily_trend to last 7 days
  const last7Days = [...daily_trend]
    .sort((a, b) => new Date(b.day) - new Date(a.day))
    .slice(0, 7)
    .map((item) => ({
      day: new Date(item.day).toISOString().split('T')[0].split('-').slice(1).reverse().join('-'),
      count: item.count,
    }));

  const totalCount = daily_trend.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="min-h-screen">
      <div className="mx-auto ">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left Side - Welcome Message */}
            <div className="text-center lg:text-left space-y-3">
              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center justify-center lg:justify-start gap-2">
                Welcome back, Doctor
                <Syringe className="w-8 h-8 ml-3 text-blue-600 animate-bounce" />
              </h1>
              <p className="text-gray-500 text-lg lg:text-xl">
                Here’s what’s happening with your patients today
              </p>
            </div>

            {/* Right Side - Logout Button */}
            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={totalInquiriesIcon}
            value={totals.total_inquiries.toString()}
            label="Total Inquiries"
            color="#C2CCFF"
            gradient="from-blue-400 to-blue-600"
          />
          <StatCard
            icon={cardProspectsIcon}
            value={totals.prospects.toString()}
            label="Prospects"
            color="#C2FFE3"
            gradient="from-emerald-400 to-emerald-600"
            onClick={() => navigate("/prospects")}
          />
          <StatCard
            icon={PatientsIcon}
            value={totals.patients.toString()}
            label="Patients"
            color="#FFF0C2"
            gradient="from-amber-400 to-amber-600"
            onClick={() => navigate("/patients")}
          />
          <StatCard
            icon={LeadsIcon}
            value={totals.leads.toString()}
            label="Leads"
            color="#E8D1FF"
            gradient="from-purple-400 to-purple-600"
            onClick={() => navigate("/leads")}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Chart Section */}
          <div className="xl:col-span-2 ">
            <Card className="p-6  bg-white backdrop-blur-sm border border-gray-300 ">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Inquiry Trends
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Last 7 days performance overview
                  </p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {new Date().toLocaleString("default", { month: "long" })} -{" "}
                  {new Date().getFullYear()}
                </div>
              </div>
              <BarChartComponent data={last7Days} />
            </Card>
          </div>

          {/* Calendar Section */}
          <div className="xl:col-span-1">
            <Card className="p-6 bg-white backdrop-blur-sm border border-gray-300 ">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Activity Calendar
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Click dates to view visit details
                  </p>
                </div>
              </div>

              <CustomCalendar
                value={new Date()}
                onClickDay={handleDateClick}
                visitCounts={visit_counts}
              />

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-sm"></div>
                  <span className="text-gray-600 font-medium"> Visits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"></div>
                  <span className="text-gray-600 font-medium">Today</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Activities */}
        {/* <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          Recent Activities
          <RecentActivities activities={visibleActivities} />
        </Card> */}

        {/* PopOut Modal */}
        {showDetails && selectedDate && visit_details && (
          <PopOutCard
            date={selectedDate}
            totalVisits={visit_details.count}
            items={visit_details.items}
            onClose={() => setShowDetails(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
