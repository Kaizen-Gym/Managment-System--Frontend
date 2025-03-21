import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../services/reportService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  FaChartLine,
  FaChartPie,
  FaUsers,
  FaRupeeSign,
  FaClock,
  FaMoneyBillWave,
  FaUserMinus,
} from 'react-icons/fa';
import {
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
  BarChart,
  Bar,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';

//components
import DashboardLayout from '../components/DashboardLayout';

//hooks
import usePermissionCheck from '../hooks/usePermissionCheck';

function Reports() {
  usePermissionCheck('view_reports');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [interval, setInterval] = useState('30'); // Default to 30 days

  const [analytics, setAnalytics] = useState({
    membership: null,
    attendance: null,
    financial: null,
  });

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  {/* eslint-disable-next-line */}
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Helper function to calculate the date range based on selected date and interval
  const calculateDateRange = (date, intervalDays) => {
    if (intervalDays === 'all') {
      return {
        startDate: 'Beginning',
        endDate: new Date()
      };
    }
    if (intervalDays === 'all') {
      return {
        startDate: 'Beginning',
        endDate: new Date()
      };
    }
    const endDate = new Date(date);
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - parseInt(intervalDays));
    return { startDate, endDate };
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchAnalytics({
      endDate: date,
      interval: interval,
      interval: interval,
    });
  };

  // Add this function to handle interval changes
  const handleIntervalChange = (e) => {
    const newInterval = e.target.value;
    setInterval(newInterval);
    fetchAnalytics({
      endDate: selectedDate,
      interval: newInterval,
      interval: newInterval,
    });
  };

  const getActiveMembers = (membershipData) => {
    if (!membershipData) return 0;

    // First try to get from trends (most recent)
    if (membershipData.trends && membershipData.trends.length > 0) {
      return membershipData.trends[0].activeMembers;
    }

    // Fallback to retention activeMembers if trends are not available
    if (membershipData.retention) {
      return membershipData.retention.activeMembers;
    }

    return 0;
  };

  const fetchAnalytics = useCallback(
    async (params = null) => {
      try {
        setLoading(true);
        const queryParams = {
          endDate: params?.endDate || selectedDate,
          interval: params?.interval || interval,
        };

        const [membershipData, attendanceData, financialData] =
          await Promise.all([
            reportService.getMembershipAnalytics(queryParams),
            reportService.getAttendanceAnalytics(queryParams),
            reportService.getFinancialAnalytics(queryParams),
          ]);

        setAnalytics({
          membership: membershipData,
          attendance: attendanceData,
          financial: financialData,
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch analytics data');
        setLoading(false);
        console.error('Error fetching analytics:', err);
      }
    },
    [selectedDate, interval]
  );
  const fetchAnalytics = useCallback(
    async (params = null) => {
      try {
        setLoading(true);
        const queryParams = {
          endDate: params?.endDate || selectedDate,
          interval: params?.interval || interval,
        };

        const [membershipData, attendanceData, financialData] =
          await Promise.all([
            reportService.getMembershipAnalytics(queryParams),
            reportService.getAttendanceAnalytics(queryParams),
            reportService.getFinancialAnalytics(queryParams),
          ]);

        setAnalytics({
          membership: membershipData,
          attendance: attendanceData,
          financial: financialData,
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch analytics data');
        setLoading(false);
        console.error('Error fetching analytics:', err);
      }
    },
    [selectedDate, interval]
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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

  // Stats Card Component
  const StatsCard = ({ title, value, icon: Icon, subtext, color }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            {value || 'No data'}
          </h3>
          {subtext && <p className="text-sm text-gray-500 mt-2">{subtext}</p>}
        </div>
        <div className={`bg-${color}-100 p-3 rounded-full`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );
  return (
    <DashboardLayout>
      <div className="flex-1 overflow-y-auto">
        <main className="p-6">
          {/* Header with Date Range Selector */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">
              Analytics & Reports
            </h1>

            <div className="flex flex-col sm:flex-row items-end gap-4 bg-white p-4 rounded-lg shadow">
              <div className="w-full sm:w-72">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  dateFormat="MMM dd, yyyy"
                  maxDate={new Date()} // Prevent future dates
                  placeholderText="Select end date"
                />
              </div>

              <div className="w-full sm:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Period
                </label>
                <select
                  value={interval}
                  onChange={handleIntervalChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                >
                  <option value="15">Previous 15 Days</option>
                  <option value="30">Previous 30 Days</option>
                  <option value="90">Previous 90 Days</option>
                  <option value="all">All Time</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <div className="text-sm text-gray-500">
                  {calculateDateRange(
                    selectedDate,
                    interval
                  ).startDate.toLocaleDateString()}{' '}
                  - {selectedDate.toLocaleDateString()}
                </div>
                <button
                  onClick={() => fetchAnalytics()}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Reports
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Active Members"
              value={getActiveMembers(analytics.membership)}
              icon={FaUsers}
              subtext={`₹${analytics.membership?.trends?.[0]?.totalRevenue ?? 0} total revenue | ${(analytics.membership?.trends?.[0]?.averageDuration ?? 0).toFixed(1)} months avg duration`}
              color="green"
            />
            <StatsCard
              title="Monthly Revenue"
              value={`₹${(analytics.financial?.profitabilityMetrics?.totalRevenue ?? 0).toLocaleString()}`}
              icon={FaRupeeSign}
              subtext={`${(analytics.financial?.profitabilityMetrics?.profitMargin ?? 0).toFixed(1)}% profit margin`}
              color="blue"
            />
            <StatsCard
              title="Average Daily Visits"
              value={
                analytics.attendance?.peakHours?.totalVisits
                  ? (analytics.attendance.peakHours.totalVisits / 30).toFixed(0)
                  : '0'
              }
              icon={FaClock}
              subtext={`${((analytics.attendance?.peakHours?.averageVisitDuration ?? 0) / 60).toFixed(1)} hrs avg duration`}
              color="purple"
            />
            <StatsCard
              title="Churn Rate"
              value={`${(analytics.membership?.churn?.currentChurnRate ?? 0).toFixed(1)}%`}
              icon={FaUserMinus}
              subtext={`${analytics.membership?.churn?.lostMembersCount ?? 0} members lost`}
              color="red"
            />
          </div>

          {/* Detailed Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Membership Growth Trend */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                <FaChartLine className="inline mr-2" />
                Membership Growth Trend
              </h2>
              {analytics.membership?.growth?.monthlyGrowth?.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={analytics.membership.growth.monthlyGrowth}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorMembers"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8884d8"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8884d8"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#82ca9d"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#82ca9d"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="_id.month"
                        tickFormatter={(value) => {
                          const months = [
                            'Jan',
                            'Feb',
                            'Mar',
                            'Apr',
                            'May',
                            'Jun',
                            'Jul',
                            'Aug',
                            'Sep',
                            'Oct',
                            'Nov',
                            'Dec',
                          ];
                          return months[value - 1] || value;
                        }}
                      />
                      <YAxis
                        yAxisId="left"
                        label={{
                          value: 'New Members',
                          angle: -90,
                          position: 'insideLeft',
                          style: { textAnchor: 'middle' },
                        }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{
                          value: 'Revenue (₹)',
                          angle: 90,
                          position: 'insideRight',
                          style: { textAnchor: 'middle' },
                        }}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === 'New Members')
                            return [value, 'New Members'];
                          if (name === 'Revenue')
                            return [`₹${value.toLocaleString()}`, 'Revenue'];
                          return [value, name];
                        }}
                        labelFormatter={(label) => {
                          const months = [
                            'January',
                            'February',
                            'March',
                            'April',
                            'May',
                            'June',
                            'July',
                            'August',
                            'September',
                            'October',
                            'November',
                            'December',
                          ];
                          return months[label - 1] || label;
                        }}
                      />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="newMembers"
                        name="New Members"
                        stroke="#8884d8"
                        fill="url(#colorMembers)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="totalRevenue"
                        name="Revenue"
                        stroke="#82ca9d"
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>

                  {/* Summary Cards */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600">
                        Total New Members
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">
                        {analytics.membership.growth.monthlyGrowth.reduce(
                          (acc, curr) => acc + curr.newMembers,
                          0
                        )}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Growth Rate:{' '}
                        {analytics.membership.growth.monthlyGrowth[0]?.growthRate.toFixed(
                          1
                        )}
                        %
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600">
                        Total Revenue
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">
                        ₹
                        {analytics.membership.growth.monthlyGrowth
                          .reduce((acc, curr) => acc + curr.totalRevenue, 0)
                          .toLocaleString()}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Average per Member: ₹
                        {(
                          analytics.membership.growth.monthlyGrowth.reduce(
                            (acc, curr) => acc + curr.totalRevenue,
                            0
                          ) /
                          analytics.membership.growth.monthlyGrowth.reduce(
                            (acc, curr) => acc + curr.newMembers,
                            0
                          )
                        ).toFixed(0)}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600">
                        Monthly Average
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">
                        {(
                          analytics.membership.growth.monthlyGrowth.reduce(
                            (acc, curr) => acc + curr.newMembers,
                            0
                          ) / analytics.membership.growth.monthlyGrowth.length
                        ).toFixed(1)}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Members per Month
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No growth data available
                </div>
              )}
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                <FaChartPie className="inline mr-2" />
                Payment Methods Distribution
              </h2>
              {analytics.financial?.paymentAnalysis?.paymentMethods?.length >
              0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={
                          analytics.financial.paymentAnalysis.paymentMethods
                        }
                        dataKey="total"
                        nameKey="_id"
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        fill="#8884d8"
                      >
                        {analytics.financial.paymentAnalysis.paymentMethods.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [
                          `₹${value.toLocaleString()}`,
                          'Total Amount',
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Summary Grid */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {analytics.financial.paymentAnalysis.paymentMethods.map(
                      (method, index) => (
                        <div
                          key={method._id}
                          className="flex items-center p-3 rounded-lg bg-gray-50"
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-3"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {method._id}
                              </span>
                              <span className="text-xs text-gray-500">
                                {(
                                  (method.count /
                                    analytics.financial.paymentAnalysis.paymentMethods.reduce(
                                      (acc, curr) => acc + curr.count,
                                      0
                                    )) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-gray-500">
                                {method.count} transactions
                              </span>
                              <span className="text-xs font-medium text-gray-900">
                                ₹{method.total.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* Total Summary */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Total Revenue
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ₹
                        {analytics.financial.paymentAnalysis.paymentMethods
                          .reduce((acc, curr) => acc + curr.total, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        Total Transactions
                      </span>
                      <span className="text-xs font-medium">
                        {analytics.financial.paymentAnalysis.paymentMethods
                          .reduce((acc, curr) => acc + curr.count, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No payment methods data available
                </div>
              )}
            </div>

            {/* Attendance Patterns */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                <FaClock className="inline mr-2" />
                Weekly Attendance Pattern
              </h2>
              {analytics.attendance?.weeklyPatterns?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analytics.attendance.weeklyPatterns}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="_id.dayOfWeek"
                      tickFormatter={(value) => {
                        const days = [
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ];
                        return days[value] || value;
                      }}
                    />
                    <YAxis
                      label={{
                        value: 'Number of Visits',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' },
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} visits`, 'Attendance']}
                      labelFormatter={(label) => {
                        const days = [
                          'Sunday',
                          'Monday',
                          'Tuesday',
                          'Wednesday',
                          'Thursday',
                          'Friday',
                          'Saturday',
                        ];
                        return days[label] || label;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#8884d8"
                      name="Visits"
                      barSize={40}
                      radius={[4, 4, 0, 0]} // Rounded top corners
                    >
                      {/* Add different colors for different days */}
                      {analytics.attendance.weeklyPatterns.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Bar>
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No attendance data available
                </div>
              )}

              {/* Add summary below the chart */}
              {analytics.attendance?.weeklyPatterns?.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {analytics.attendance.weeklyPatterns.map((day, index) => (
                    <div
                      key={day._id.dayOfWeek}
                      className="flex items-center p-2 rounded-lg bg-gray-50"
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium">
                          {
                            [
                              'Sunday',
                              'Monday',
                              'Tuesday',
                              'Wednesday',
                              'Thursday',
                              'Friday',
                              'Saturday',
                            ][day._id.dayOfWeek]
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          {day.count} visits
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Revenue Projections */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                <FaMoneyBillWave className="inline mr-2" />
                Revenue Projections
              </h2>
              {analytics.financial?.projections?.historicalRevenue?.length >
                0 ||
              analytics.financial?.projections?.projectedRevenue?.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="_id.month"
                        tickFormatter={(value) => {
                          const months = [
                            'Jan',
                            'Feb',
                            'Mar',
                            'Apr',
                            'May',
                            'Jun',
                            'Jul',
                            'Aug',
                            'Sep',
                            'Oct',
                            'Nov',
                            'Dec',
                          ];
                          return months[value - 1] || value;
                        }}
                      />
                      <YAxis
                        label={{
                          value: 'Revenue (₹)',
                          angle: -90,
                          position: 'insideLeft',
                          style: { textAnchor: 'middle' },
                        }}
                      />
                      <Tooltip
                        formatter={(value) => [
                          `₹${value.toLocaleString()}`,
                          'Revenue',
                        ]}
                        labelFormatter={(label) => {
                          const months = [
                            'January',
                            'February',
                            'March',
                            'April',
                            'May',
                            'June',
                            'July',
                            'August',
                            'September',
                            'October',
                            'November',
                            'December',
                          ];
                          return months[label - 1] || label;
                        }}
                      />
                      <Legend />

                      {/* Historical Revenue */}
                      <Area
                        type="monotone"
                        data={analytics.financial.projections.historicalRevenue}
                        dataKey="revenue"
                        name="Historical Revenue"
                        fill="url(#colorHistorical)"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />

                      {/* Projected Revenue */}
                      <Line
                        type="monotone"
                        data={analytics.financial.projections.projectedRevenue}
                        dataKey="revenue"
                        name="Projected Revenue"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                        activeDot={{ r: 6 }}
                      />

                      <defs>
                        <linearGradient
                          id="colorHistorical"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8884d8"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8884d8"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                    </ComposedChart>
                  </ResponsiveContainer>

                  {/* Summary Cards */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Historical Revenue Card */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600">
                        Average Historical Revenue
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">
                        ₹
                        {(
                          analytics.financial.projections.historicalRevenue.reduce(
                            (acc, curr) => acc + curr.revenue,
                            0
                          ) /
                          analytics.financial.projections.historicalRevenue
                            .length
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        per month
                      </div>
                    </div>

                    {/* Growth Rate Card */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600">
                        Projected Growth Rate
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">
                        {analytics.financial.projections.growthRate?.toFixed(1)}
                        %
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        month over month
                      </div>
                    </div>

                    {/* Upcoming Renewals Card */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-medium text-gray-600">
                        Upcoming Renewals
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">
                        ₹
                        {analytics.financial.projections.upcomingRenewals
                          .reduce((acc, curr) => acc + curr.amount, 0)
                          .toLocaleString()}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        next{' '}
                        {
                          analytics.financial.projections.upcomingRenewals
                            .length
                        }{' '}
                        renewals
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Renewals List */}
                  {analytics.financial.projections.upcomingRenewals.length >
                    0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">
                        Upcoming Renewal Details
                      </h3>
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="max-h-40 overflow-y-auto">
                          {analytics.financial.projections.upcomingRenewals
                            .sort(
                              (a, b) =>
                                new Date(a.dueDate) - new Date(b.dueDate)
                            )
                            .map((renewal, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0"
                              >
                                <div className="text-sm text-gray-600">
                                  {new Date(renewal.dueDate).toLocaleDateString(
                                    'en-IN',
                                    {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    }
                                  )}
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  ₹{renewal.amount.toLocaleString()}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No revenue projection data available
                </div>
              )}
            </div>
          </div>

          {/* Demographics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Age Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                <FaUsers className="inline mr-2" />
                Age Distribution
              </h2>
              {analytics.membership?.demographics?.ageDistribution?.length >
              0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.membership.demographics.ageDistribution}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      fill="#8884d8"
                    >
                      {analytics.membership.demographics.ageDistribution.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} members`, name]}
                    />
                    {/* <Legend
                      verticalAlign="bottom"
                      align="center"
                      layout="vertical"
                      iconType="circle"
                      wrapperStyle={{
                        paddingTop: '20px',
                      }}
                    /> */}
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No age distribution data available
                </div>
              )}

              {/* Add summary below the chart */}
              {analytics.membership?.demographics?.ageDistribution?.length >
                0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {analytics.membership.demographics.ageDistribution.map(
                    (group, index) => (
                      <div
                        key={group._id}
                        className="flex items-center p-2 rounded-lg bg-gray-50"
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium">{group._id}</div>
                          <div className="text-xs text-gray-500">
                            {group.count} members (
                            {(
                              (group.count /
                                analytics.membership.demographics.ageDistribution.reduce(
                                  (acc, curr) => acc + curr.count,
                                  0
                                )) *
                              100
                            ).toFixed(1)}
                            %)
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}

export default Reports;
