import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import {
  FaChartLine,
  FaChartPie,
  FaUsers,
  FaRupeeSign,
  FaPercentage,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Reports() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    membershipTrends: [],
    revenueBreakdown: [],
    membershipStatus: { active: 0, inactive: 0 },
    monthlyRevenue: [],
  });
  const [userRole, setUserRole] = useState(null);

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const fetchReportData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch membership stats
      const membershipStats = await axios.get(
        "http://localhost:5050/api/reports/membership",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch financial stats
      const financialStats = await axios.get(
        "http://localhost:5050/api/reports/financial",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Process the data for charts
      const processedData = processReportData(
        membershipStats.data,
        financialStats.data
      );
      setReportData(processedData);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch report data");
      setLoading(false);
      console.error("Error fetching report data:", err);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, [fetchReportData]);

  const processReportData = (membershipData, financialData) => {
    // Process membership trends
    const membershipTrends =
      membershipData.newMemberSignups?.map((signup) => ({
        date: new Date(signup._id).toLocaleDateString(),
        "New Sign-ups": signup.count,
        Expirations:
          membershipData.expiringMemberships?.filter(
            (exp) =>
              new Date(exp.membership_end_date).toDateString() ===
              new Date(signup._id).toDateString()
          ).length || 0,
      })) || [];

    // Process revenue breakdown
    const revenueBreakdown =
      financialData.paymentMethodsBreakdown?.map((method) => ({
        name: method._id,
        value: method.total,
      })) || [];

    // Process membership status
    const membershipStatus = {
      active: membershipData.totalActiveMembers || 0,
      inactive:
        (membershipData.totalMembers || 0) -
        (membershipData.totalActiveMembers || 0),
    };

    // Process monthly revenue
    const monthlyRevenue =
      financialData.monthlyPayments?.map((month) => ({
        month: `${month._id.year}-${month._id.month}`,
        revenue: month.total || 0,
      })) || [];

    return {
      membershipTrends,
      revenueBreakdown,
      membershipStatus,
      monthlyRevenue,
    };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen text-red-600">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Main Content */}
      <div className="flex-1 overflow-y-hidden overflow-x-hidden">
        {/* Page Content */}
        <main className="p-6 overflow-x-hidden overflow-y-hidden">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Analytics & Reports
          </h1>

          {/* Stats Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Members Card */}
            {userRole === 'admin' || userRole === 'manager' ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Members
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {reportData.membershipStatus.active}
                    </h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaUsers className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {(
                    (reportData.membershipStatus.active /
                      (reportData.membershipStatus.active +
                        reportData.membershipStatus.inactive)) *
                    100
                  ).toFixed(1)}
                  % of total
                </p>
              </div>
            ) : null}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Membership Trends Chart */}
            {userRole === 'admin' || userRole === 'manager' ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  <FaChartLine className="inline mr-2" />
                  Membership Trends
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.membershipTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="New Sign-ups"
                      stroke="#0088FE"
                    />
                    <Line
                      type="monotone"
                      dataKey="Expirations"
                      stroke="#FF8042"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : null}

            {/* Revenue Breakdown Pie Chart */}
            {userRole === 'admin' || userRole === 'manager' ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  <FaChartPie className="inline mr-2" />
                  Revenue Breakdown
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.revenueBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      {reportData.revenueBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : null}

            {/* Monthly Revenue Trend */}
            {userRole === 'admin' || userRole === 'manager' ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  <FaRupeeSign className="inline mr-2" />
                  Monthly Revenue Trend
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : null}

            {/* Membership Status Distribution */}
            {userRole === 'admin' || userRole === 'manager' ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  <FaPercentage className="inline mr-2" />
                  Membership Status
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Active",
                          value: reportData.membershipStatus.active,
                        },
                        {
                          name: "Inactive",
                          value: reportData.membershipStatus.inactive,
                        },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label
                    >
                      <Cell fill="#00C49F" />
                      <Cell fill="#FF8042" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}

export default Reports;
