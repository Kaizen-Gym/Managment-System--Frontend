import { useState, useEffect } from 'react';
import {
  FaUsers,
  FaUser,
  FaPhone,
  FaVenusMars,
  FaBirthdayCake,
  FaEnvelope,
  FaIdCard,
  FaRupeeSign,
  FaCheckCircle,
  FaCreditCard,
  FaCalendar,
  FaUserPlus,
  FaExclamationTriangle,
  FaExclamationCircle,
} from 'react-icons/fa';
import { Dialog, DialogPanel } from '@headlessui/react';
import PropTypes from 'prop-types';
import { dashboardService } from '../services/dashboardService';
import { handleError } from '../utils/errorHandler';

//Components
import DashboardLayout from '../components/DashboardLayout';
import SuccessfullPayment from '../components/Animations/SuccessfulPayment';
import ErrorAnimation from '../components/Animations/ErrorAnimation';

//hooks
import usePermissionCheck from '../hooks/usePermissionCheck';

function Dashboard() {
  usePermissionCheck('view_dashboard');
  const [membersdata, setmembersdata] = useState({});
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    number: '',
    gender: '',
    age: '',
    email: '',
    membership_type: '',
    membership_amount: '',
    membership_due_amount: '0', // Add this line
    membership_payment_status: 'Paid',
    membership_payment_mode: 'Cash',
    membership_payment_date: new Date().toISOString().split('T')[0],
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalMembers: 0,
    newMembers: 0,
    expiringMemberships: 0,
    totalRevenue: 0,
    totalDue: 0,
    membershipRenewalRate: 0,
    paymentSummary: {},
    paymentMethodsBreakdown: [],
  });
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isPayDueModalOpen, setIsPayDueModalOpen] = useState(false);
  const [duePayment, setDuePayment] = useState({
    amount: '',
    payment_mode: 'Cash',
  });

  const [newRenewal, setNewRenewal] = useState({
    number: '',
    membership_type: '',
    membership_due_amount: '',
    membership_payment_status: '',
    membership_payment_mode: '',
    membership_payment_date: new Date().toISOString().split('T')[0],
  });
  const [showSuccessfullPayment, setShowSuccessfullPayment] = useState(false);
  const [errorAnimation, setErrorAnimation] = useState({
    show: false,
    message: '',
  });
  const [upcomingRenewals, setUpcomingRenewals] = useState({
    renewals: [],
    totalCount: 0,
    totalExpectedRevenue: 0,
  });
  const [showUpcomingRenewalsModal, setShowUpcomingRenewalsModal] =
    useState(false);
  const [showDueDetailsModal, setShowDueDetailsModal] = useState(false);
  const [dueDetails, setDueDetails] = useState({
    members: [],
    totalDue: 0,
    statistics: {
      averageDueAmount: 0,
      highestDueAmount: 0,
      lowestDueAmount: 0,
    },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchMembers(currentPage, itemsPerPage);
    fetchDashboardStats();
    fetchMembershipPlans();
    fetchUpcomingRenewals();
    fetchDueDetails();
  }, [currentPage, itemsPerPage]);

  const fetchUpcomingRenewals = async () => {
    try {
      const response = await dashboardService.getUpcomingRenewals();

      setUpcomingRenewals({
        renewals: response.renewals || [],
        totalCount: response.totalCount || 0,
        totalExpectedRevenue: response.totalExpectedRevenue || 0,
      });
    } catch (err) {
      console.error('Error fetching upcoming renewals:', {
        message: err.message,
        response: err.response,
      });
    }
  };

  const fetchMembers = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await dashboardService.getMembers(page, limit);
      setMembers(response.members);
      setmembersdata(response);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch members');
      setLoading(false);
      console.error('Error fetching members:', err);
    }
  };

  const handleAddMember = () => {
    setIsAddMemberOpen(true);
  };
  const handleRenewMembership = async (member) => {
    setSelectedMember({
      ...member,
      membership_due_amount: member.membership_due_amount || 0,
      membership_payment_mode: member.membership_payment_mode || 'Cash',
      membership_payment_status: 'Paid',
    });
    setIsRenewModalOpen(true);

    setNewRenewal({
      number: member.number,
      membership_type: member.membership_type,
      membership_payment_status: member.membership_payment_status,
      membership_payment_mode: member.membership_payment_mode,
      membership_payment_date: new Date().toISOString().split('T')[0],
    });
    setIsRenewModalOpen(true);

    try {
      await dashboardService.renewMembership(newRenewal);
      fetchMembers(); // Refresh the list
    } catch (err) {
      console.error('Error renewing membership:', err);
    }
  };

  const handlePayDue = (member) => {
    setSelectedMember(member);
    setDuePayment({
      amount: '',
      payment_mode: 'Cash',
    });
    setIsPayDueModalOpen(true);
  };

  const handleDueAmountChange = (e) => {
    const dueAmount = parseFloat(e.target.value) || 0;
    setNewMember({
      ...newMember,
      membership_due_amount: e.target.value,
      membership_payment_status: dueAmount > 0 ? 'Pending' : 'Paid',
    });
  };

  const handleRenewalDueAmountChange = (e) => {
    const dueAmount = parseFloat(e.target.value) || 0;
    setSelectedMember({
      ...selectedMember,
      membership_due_amount: e.target.value,
      membership_payment_status: dueAmount > 0 ? 'Pending' : 'Paid',
    });
  };

  const handlePayDueSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await dashboardService.payDue({
        number: selectedMember.number,
        amount_paid: parseFloat(duePayment.amount),
        payment_mode: duePayment.payment_mode,
      });

      if (response) {
        await fetchDueDetails();
        setShowSuccessfullPayment(true);
        // Update the member list and stats
        await Promise.all([fetchMembers(), fetchDashboardStats()]);

        setIsPayDueModalOpen(false);
        // Close modal after successful payment
        setTimeout(() => {
          setShowSuccessfullPayment(false);
        }, 1500);
      }
    } catch (error) {
      setShowSuccessfullPayment(false);
      console.error('Error processing due payment:', error);
      alert(error.response?.message || 'Error processing payment');
    }
  };

  const fetchDueDetails = async () => {
    try {
      const response = await dashboardService.getDueDetails();
      setDueDetails(response);
    } catch (err) {
      console.error('Error fetching due details:', err);
    }
  };

  const handleEditMember = async (member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);

    try {
      await dashboardService.updateMember(member.id, member);
      fetchMembers(); // Refresh the list
    } catch (err) {
      console.error('Error editing member:', err);
    }
  };

  const handleDeleteMember = async (number) => {
    try {
      await dashboardService.deleteMember(number);
      fetchMembers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting member:', err);
    }
  };

  const handleSubmitNewMember = async (e) => {
    e.preventDefault();
    try {
      if (!newMember.membership_due_amount) {
        newMember.membership_due_amount = 0;
      }
      newMember.membership_due_amount = parseFloat(
        newMember.membership_due_amount
      );

      const response = await dashboardService.addMember(newMember);
      setIsAddMemberOpen(false);
      fetchMembers();
      fetchDashboardStats();
      setNewMember({
        name: '',
        number: '',
        gender: '',
        age: '',
        email: '',
        membership_type: '',
        membership_amount: '',
        membership_payment_status: 'Paid',
        membership_payment_mode: 'Cash',
        membership_payment_date: new Date().toISOString().split('T')[0],
      });

      if (response) {
        setShowSuccessfullPayment(true);
        setTimeout(() => {
          setShowSuccessfullPayment(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Error adding new member:', err);
      setErrorAnimation({
        show: true,
        message: 'An error occurred while adding the member. Contact Support!',
      });
      setTimeout(() => setErrorAnimation({ show: false, message: '' }), 3000);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Fetch membership stats
      const membershipStats = await dashboardService.getMembershipAnalytics({
        endDate: new Date(),
        interval: 30,
      });

      // Fetch financial stats
      const financialStats = await dashboardService.getFinancialAnalytics({
        endDate: new Date(),
        interval: 30,
      });

      setDashboardStats({
        // Total Members - Get from trends[0].activeMembers
        totalMembers: membershipStats.trends[0]?.activeMembers || 0,

        // New Members - Get from currentMonthGrowth
        newMembers: membershipStats.growth?.currentMonthGrowth?.newMembers || 0,

        // Expiring Memberships - Get from churn data
        expiringMemberships: membershipStats.churn?.lostMembersCount || 0,

        // Total Revenue - Get from profitabilityMetrics
        totalRevenue: financialStats.profitabilityMetrics?.totalRevenue || 0,

        // Total Due - Get from profitabilityMetrics
        totalDue: financialStats.profitabilityMetrics?.totalDues || 0,

        // Members with Due
        membersWithDue: financialStats.duePaymentsTrend?.[0]?.count || 0,

        // Membership Renewal Rate
        membershipRenewalRate:
          membershipStats.retention?.currentRetentionRate || 0,

        // Payment Summary
        paymentSummary: {
          totalPayments:
            financialStats.paymentAnalysis?.paymentMethods?.reduce(
              (acc, method) => acc + (method.count || 0),
              0
            ) || 0,
        },

        // Payment Methods Breakdown
        paymentMethodsBreakdown:
          financialStats.paymentAnalysis?.paymentMethods || [],
      });

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to fetch dashboard statistics');
    }
  };

  const fetchMembershipPlans = async () => {
    try {
      const response = await dashboardService.getMembershipPlans();
      setAvailablePlans(response);
    } catch (err) {
      console.error('Error fetching membership plans:', err);
    }
  };

  const PaymentStatusBadge = ({ status }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'Paid':
          return 'bg-green-100 text-green-800';
        case 'Pending':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}
      >
        {status}
      </span>
    );
  };

  PaymentStatusBadge.propTypes = {
    status: PropTypes.oneOf(['Paid', 'Pending']).isRequired,
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure amounts are valid numbers
      const membershipAmount =
        parseFloat(selectedMember.membership_amount) || 0;
      const dueAmount = parseFloat(selectedMember.membership_due_amount) || 0;

      // Validate amounts
      if (isNaN(membershipAmount) || isNaN(dueAmount)) {
        alert(
          'Invalid amount values. Please check the membership and due amounts.'
        );
        return;
      }

      // Create renewal payload with all required fields
      const renewalData = {
        number: selectedMember.number,
        name: selectedMember.name, // Add name if required by your API
        membership_type: selectedMember.membership_type,
        membership_amount: membershipAmount,
        membership_due_amount: dueAmount,
        membership_payment_status: dueAmount > 0 ? 'Pending' : 'Paid',
        membership_payment_mode:
          selectedMember.membership_payment_mode || 'Cash',
        membership_payment_date: new Date().toISOString().split('T')[0],
      };


      const response = await dashboardService.renewMembership(renewalData);

      if (response) {
        await Promise.all([
          fetchMembers(),
          fetchDashboardStats(),
          fetchUpcomingRenewals(),
        ]);
        setIsRenewModalOpen(false);
        setShowSuccessfullPayment(true);

        setTimeout(() => {
          setShowSuccessfullPayment(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Error renewing membership:', err.response || err);
      alert(
        err.response?.message || 'Failed to renew membership. Please try again.'
      );
    } finally {
      fetchMembers();
      fetchDashboardStats();
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await dashboardService.updateMember(
        selectedMember.number,
        selectedMember
      );
      fetchMembers();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating member:', err);
    }
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
  if (error) return <div>{error}</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1">
        {/* Page Content */}
        <DashboardLayout>
          <main className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">
                Dashboard
              </h1>
              <button
                onClick={handleAddMember}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                + Add New Member
              </button>
            </div>

            {/* Dashboard Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Total Members Widget */}
              <div className="bg-white rounded-lg shadow p-6 transition-transform duration-200 hover:transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Members
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {membersdata.total}
                    </h3>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaUsers className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {dashboardStats.membershipRenewalRate.toFixed(1)}% renewal
                  rate
                </p>
              </div>

              {/* New Members Widget */}
              <div className="bg-white rounded-lg shadow p-6 transition-transform duration-200 hover:transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      New Members
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {dashboardStats.newMembers}
                    </h3>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaUserPlus className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">This month</p>
              </div>

              {/* Expiring Memberships Widget */}
              <div className="bg-white rounded-lg shadow p-6 transition-transform duration-200 hover:transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Expiring Soon
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {dashboardStats.expiringMemberships}
                    </h3>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <FaExclamationTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Next 30 days</p>
              </div>

              {/* Revenue Widget */}
              <div className="bg-white rounded-lg shadow p-6 transition-transform duration-200 hover:transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Revenue
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      ₹{dashboardStats.totalRevenue.toLocaleString()}
                    </h3>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <FaRupeeSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {dashboardStats.paymentSummary?.totalPayments || 0} payments
                </p>
              </div>

              {/* Due Amount Widget */}
              <div
                onClick={() => setShowDueDetailsModal(true)}
                className="bg-white rounded-lg shadow p-6 transition-transform duration-200 hover:transform hover:scale-105"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Due Amount
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      ₹{dashboardStats.totalDue?.toLocaleString() || '0'}
                    </h3>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <FaExclamationCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {dueDetails.members.length || 0} members with dues
                </p>
              </div>

              {/* Upcoming Renewals Widget */}
              <div
                className="bg-white rounded-lg shadow p-6 transition-transform duration-200 hover:transform hover:scale-105 cursor-pointer"
                onClick={() => setShowUpcomingRenewalsModal(true)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Upcoming Renewals
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">
                      {upcomingRenewals.totalCount}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                      ₹{upcomingRenewals.totalExpectedRevenue.toLocaleString()}{' '}
                      expected revenue
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full mt-1">
                    <FaCalendar className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
            {/* Payment Methods Breakdown */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Methods
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {dashboardStats.paymentMethodsBreakdown?.map((method) => (
                  <div
                    key={method._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{method._id}</p>
                      <p className="text-sm text-gray-500">
                        {method.count} payments
                      </p>
                    </div>
                    <p className="font-bold">
                      ₹{method.total.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Member List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Member Details
                </h2>
              </div>

              <div className="border-t border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Membership Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {member.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              member.membership_status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {member.membership_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            member.membership_end_date
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {member.member_total_due_amount > 0 && (
                            <button
                              onClick={() => handlePayDue(member)}
                              className="text-red-600 hover:text-red-900 mr-3"
                            >
                              Pay Due (₹{member.member_total_due_amount})
                            </button>
                          )}
                          <button
                            onClick={() => handleRenewMembership(member)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Renew
                          </button>
                          <button
                            onClick={() => handleEditMember(member)}
                            className="text-gray-600 hover:text-gray-900 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.number)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Entries per page selector and info */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="itemsPerPage"
                          className="text-sm text-gray-600 whitespace-nowrap"
                        >
                          Show:
                        </label>
                        <select
                          id="itemsPerPage"
                          value={itemsPerPage}
                          onChange={(e) => {
                            const newLimit = Math.min(
                              Math.max(parseInt(e.target.value), 1),
                              50
                            );
                            setItemsPerPage(newLimit);
                            setCurrentPage(1);
                            fetchMembers(1, newLimit);
                          }}
                          className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                        </select>
                        <span className="text-sm text-gray-600">entries</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Total: {membersdata.total} members
                      </div>
                    </div>

                    {/* Pagination controls */}
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-700 whitespace-nowrap">
                        Page {currentPage} of {totalPages}
                      </p>

                      {/* Navigation buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setCurrentPage(1);
                            fetchMembers(1, itemsPerPage);
                          }}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 text-sm font-medium rounded-lg ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          First
                        </button>

                        <button
                          onClick={() => {
                            const newPage = Math.max(currentPage - 1, 1);
                            setCurrentPage(newPage);
                            fetchMembers(newPage, itemsPerPage);
                          }}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 text-sm font-medium rounded-lg ${
                            currentPage === 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          Previous
                        </button>

                        <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-300">
                          {currentPage}
                        </span>

                        <button
                          onClick={() => {
                            const newPage = Math.min(
                              currentPage + 1,
                              totalPages
                            );
                            setCurrentPage(newPage);
                            fetchMembers(newPage, itemsPerPage);
                          }}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 text-sm font-medium rounded-lg ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          Next
                        </button>

                        <button
                          onClick={() => {
                            setCurrentPage(totalPages);
                            fetchMembers(totalPages, itemsPerPage);
                          }}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 text-sm font-medium rounded-lg ${
                            currentPage === totalPages
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Last
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </DashboardLayout>
      </div>
      {isAddMemberOpen && (
        <Dialog
          open={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          className="relative z-50"
        >
          {/* The backdrop, rendered as a fixed sibling to the panel container */}
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          {/* Full-screen container to center the panel */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white bg-gradient-to-b from-gray-50 to-white p-8 text-left align-middle shadow-xl transition-all duration-300 ease-out motion-safe:animate-[fadeIn_0.3s_ease-in-out]">
              <Dialog.Title className="text-2xl font-bold text-gray-900 pb-4 border-b border-gray-200 mb-6">
                Add New Member
              </Dialog.Title>

              <form onSubmit={handleSubmitNewMember}>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Personal Information
                    </h3>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaUser className="mr-2 text-gray-400" />
                          Name
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                        value={newMember.name}
                        onChange={(e) =>
                          setNewMember({ ...newMember, name: e.target.value })
                        }
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaPhone className="mr-2 text-gray-400" />
                          Phone Number
                        </span>
                      </label>
                      <input
                        type="tel"
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                        value={newMember.number}
                        onChange={(e) =>
                          setNewMember({ ...newMember, number: e.target.value })
                        }
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaVenusMars className="mr-2 text-gray-400" />
                          Gender
                        </span>
                      </label>
                      <select
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                        value={newMember.gender}
                        onChange={(e) =>
                          setNewMember({ ...newMember, gender: e.target.value })
                        }
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaBirthdayCake className="mr-2 text-gray-400" />
                          Age
                        </span>
                      </label>
                      <input
                        type="number"
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                        value={newMember.age}
                        onChange={(e) =>
                          setNewMember({ ...newMember, age: e.target.value })
                        }
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          Email
                        </span>
                      </label>
                      <input
                        type="email"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                        value={newMember.email}
                        onChange={(e) =>
                          setNewMember({ ...newMember, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Membership Details
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaIdCard className="mr-2 text-gray-400" />
                          Membership Type
                        </span>
                      </label>
                      <select
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                        value={newMember.membership_type}
                        onChange={(e) => {
                          const selectedPlan = availablePlans.find(
                            (plan) => plan.name === e.target.value
                          );
                          setNewMember({
                            ...newMember,
                            membership_type: e.target.value,
                            membership_amount: selectedPlan
                              ? selectedPlan.price
                              : '',
                            membership_duration: selectedPlan
                              ? selectedPlan.duration
                              : '',
                          });
                        }}
                      >
                        <option value="">Select Membership Type</option>
                        {availablePlans.map((plan) => (
                          <option key={plan._id} value={plan.name}>
                            {plan.name} - ₹{plan.price} ({plan.duration} months)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Membership Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaRupeeSign className="mr-2 text-gray-400" />
                          Membership Amount
                        </span>
                      </label>
                      <input
                        type="number"
                        required
                        disabled // Make this read-only since it's set by the plan
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200 bg-gray-50"
                        value={newMember.membership_amount}
                      />
                    </div>

                    {/* Due Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaRupeeSign className="mr-2 text-gray-400" />
                          Due Amount
                        </span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                        value={newMember.membership_due_amount}
                        onChange={handleDueAmountChange}
                      />
                    </div>

                    {/* Payment Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaCheckCircle className="mr-2 text-gray-400" />
                          Payment Status
                        </span>
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <PaymentStatusBadge
                          status={newMember.membership_payment_status}
                        />
                        <span className="text-sm text-gray-500">
                          {newMember.membership_due_amount > 0}
                        </span>
                      </div>
                    </div>

                    {/* Payment Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaCreditCard className="mr-2 text-gray-400" />
                          Payment Mode
                        </span>
                      </label>
                      <select
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                        value={newMember.membership_payment_mode}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            membership_payment_mode: e.target.value,
                          })
                        }
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>

                    {/* Payment Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaCalendar className="mr-2 text-gray-400" />
                          Payment Date
                        </span>
                      </label>
                      <input
                        type="date"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                        value={newMember.membership_payment_date}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
                            membership_payment_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex justify-end space-x-4 border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsAddMemberOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-sm"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {isRenewModalOpen && (
        <Dialog
          open={isRenewModalOpen}
          onClose={() => setIsRenewModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6">
              <Dialog.Title className="text-xl font-semibold mb-4">
                Renew Membership
              </Dialog.Title>
              <form onSubmit={handleRenewSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Membership Type
                    </label>
                    <select
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      value={selectedMember?.membership_type}
                      onChange={(e) => {
                        const selectedPlan = availablePlans.find(
                          (plan) => plan.name === e.target.value
                        );
                        setSelectedMember({
                          ...selectedMember,
                          membership_type: e.target.value,
                          membership_amount: selectedPlan?.price,
                        });
                      }}
                    >
                      {availablePlans.map((plan) => (
                        <option key={plan._id} value={plan.name}>
                          {plan.name} - ₹{plan.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Due Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Due Amount
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      value={selectedMember?.membership_due_amount || 0}
                      onChange={handleRenewalDueAmountChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Status
                    </label>
                    <div className="flex items-center space-x-2 mt-1">
                      <PaymentStatusBadge
                        status={selectedMember?.membership_payment_status}
                      />
                      <span className="text-sm text-gray-500">
                        {selectedMember?.membership_due_amount > 0}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Mode
                    </label>
                    <select
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      value={selectedMember?.membership_payment_mode}
                      onChange={(e) =>
                        setSelectedMember({
                          ...selectedMember,
                          membership_payment_mode: e.target.value,
                        })
                      }
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
                    onClick={() => setIsRenewModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                  >
                    Renew Membership
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Dialog
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
              <Dialog.Title className="text-2xl font-bold text-gray-900 pb-4 border-b border-gray-200 mb-6">
                Edit Member
              </Dialog.Title>

              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Personal Information
                    </h3>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaUser className="mr-2 text-gray-400" />
                          Name
                        </span>
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={selectedMember?.name || ''}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaPhone className="mr-2 text-gray-400" />
                          Phone Number
                        </span>
                      </label>
                      <input
                        type="tel"
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={selectedMember?.number || ''}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            number: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaVenusMars className="mr-2 text-gray-400" />
                          Gender
                        </span>
                      </label>
                      <select
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={selectedMember?.gender || ''}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            gender: e.target.value,
                          })
                        }
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaBirthdayCake className="mr-2 text-gray-400" />
                          Age
                        </span>
                      </label>
                      <input
                        type="number"
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={selectedMember?.age || ''}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            age: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaEnvelope className="mr-2 text-gray-400" />
                          Email
                        </span>
                      </label>
                      <input
                        type="email"
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={selectedMember?.email || ''}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Membership Details
                    </h3>

                    {/* Membership Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaIdCard className="mr-2 text-gray-400" />
                          Membership Type
                        </span>
                      </label>
                      <select
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={selectedMember?.membership_type || ''}
                        onChange={(e) => {
                          const selectedPlan = availablePlans.find(
                            (plan) => plan.name === e.target.value
                          );
                          setSelectedMember({
                            ...selectedMember,
                            membership_type: e.target.value,
                            membership_amount: selectedPlan?.price,
                            membership_duration: selectedPlan?.duration,
                          });
                        }}
                      >
                        {availablePlans.map((plan) => (
                          <option key={plan._id} value={plan.name}>
                            {plan.name} - ₹{plan.price} ({plan.duration} months)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Membership Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaCheckCircle className="mr-2 text-gray-400" />
                          Membership Status
                        </span>
                      </label>
                      <select
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={selectedMember?.membership_status || ''}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            membership_status: e.target.value,
                          })
                        }
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Expired">Expired</option>
                      </select>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaCheckCircle className="mr-2 text-gray-400" />
                          Payment Status
                        </span>
                      </label>
                      <select
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={selectedMember?.membership_payment_status || ''}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            membership_payment_status: e.target.value,
                          })
                        }
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>

                    {/* Payment Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="flex items-center">
                          <FaCreditCard className="mr-2 text-gray-400" />
                          Payment Mode
                        </span>
                      </label>
                      <select
                        required
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={selectedMember?.membership_payment_mode || ''}
                        onChange={(e) =>
                          setSelectedMember({
                            ...selectedMember,
                            membership_payment_mode: e.target.value,
                          })
                        }
                      >
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex justify-end space-x-4 border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {isPayDueModalOpen && (
        <Dialog
          open={isPayDueModalOpen}
          onClose={() => setIsPayDueModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6">
              <Dialog.Title className="text-xl font-semibold mb-4">
                Pay Due Amount
              </Dialog.Title>
              <form onSubmit={handlePayDueSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Due Amount
                    </label>
                    <p className="text-lg font-semibold text-red-600">
                      ₹{selectedMember?.member_total_due_amount}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount to Pay
                    </label>
                    <input
                      type="number"
                      max={selectedMember?.member_total_due_amount}
                      required
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      value={duePayment.amount}
                      onChange={(e) =>
                        setDuePayment({
                          ...duePayment,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Mode
                    </label>
                    <select
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      value={duePayment.payment_mode}
                      onChange={(e) =>
                        setDuePayment({
                          ...duePayment,
                          payment_mode: e.target.value,
                        })
                      }
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
                    onClick={() => setIsPayDueModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                  >
                    Process Payment
                  </button>
                </div>
              </form>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {showUpcomingRenewalsModal && (
        <Dialog
          open={showUpcomingRenewalsModal}
          onClose={() => setShowUpcomingRenewalsModal(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-2xl rounded-2xl bg-white p-6">
              <Dialog.Title className="text-xl font-semibold mb-4">
                Upcoming Renewals (Next 7 Days)
              </Dialog.Title>
              <div className="mt-4">
                {upcomingRenewals.renewals.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Member Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Plan
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Expiry Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {upcomingRenewals.renewals.map((renewal) => (
                            <tr key={renewal._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {renewal.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {renewal.membership_type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(
                                  renewal.membership_end_date
                                ).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₹{renewal.membership_amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Total Expected Revenue:
                        </span>
                        <span className="text-lg font-semibold text-green-600">
                          ₹
                          {upcomingRenewals.totalExpectedRevenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FaCalendar className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-lg text-gray-600 font-medium">
                      No upcoming renewals
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      There are no memberships due for renewal in the next 7
                      days
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  onClick={() => setShowUpcomingRenewalsModal(false)}
                >
                  Close
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      {/* Due Details Modal */}
      {showDueDetailsModal && (
        <Dialog
          open={showDueDetailsModal}
          onClose={() => setShowDueDetailsModal(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-4xl rounded-2xl bg-white p-6">
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-xl font-semibold">
                  Due Amount Details
                </Dialog.Title>
                <button
                  onClick={() => setShowDueDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>×
                </button>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Average Due</p>
                  <p className="text-xl font-semibold">
                    ₹{dueDetails.statistics.averageDueAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Highest Due</p>
                  <p className="text-xl font-semibold text-red-600">
                    ₹{dueDetails.statistics.highestDueAmount.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Total Members with Due
                  </p>
                  <p className="text-xl font-semibold">
                    {dueDetails.members.length}
                  </p>
                </div>
              </div>

              {/* Members Table */}
              <div className="mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Member Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Due Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Last Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dueDetails.members.map((member) => (
                      <tr key={member._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {member.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.number}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-red-600 font-semibold">
                            ₹{member.member_total_due_amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(
                              member.last_payment_date
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => {
                              setShowDueDetailsModal(false);
                              handlePayDue(member);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Pay Due
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}

      <SuccessfullPayment show={showSuccessfullPayment} />

      {/* Place the ErrorAnimation component at the root level so it's always rendered */}
      <ErrorAnimation
        show={errorAnimation.show}
        message={errorAnimation.message}
      />
    </div> /* This is the closing div of your main flex container */
  );
}

export default Dashboard;
