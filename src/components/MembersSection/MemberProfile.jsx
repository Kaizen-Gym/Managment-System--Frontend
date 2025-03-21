/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { memberService } from '../../services/api';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  FaSync,
  FaCalendarCheck,
  FaEdit,
  FaExchangeAlt,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaClock,
  FaIdCard,
  FaUserEdit, // For Edit Member
  FaUserTimes, // For Delete Member
  FaCalendarPlus, // For Complimentary Days
  FaArrowCircleUp, // For Membership Upgrade
  FaFileImage, // For Membership Form
  FaChevronDown, // For collapse/expand icon
  FaChevronUp, // For collapse/expand icon
} from 'react-icons/fa';
import { Dialog } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';

//components
import SuccessfullPayment from '../Animations/SuccessfulPayment';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const MemberProfile = ({ memberNumber }) => {
  const [memberData, setMemberData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [IsRenewalOpen, setIsRenewalOpen] = useState(false);
  const [ShowSuccessfullPayment, setShowSuccessfullPayment] = useState(false);
  const [isPayDueModalOpen, setIsPayDueModalOpen] = useState(false);
  const [duePayment, setDuePayment] = useState({
    amount: '',
    payment_mode: 'Cash',
  });

  // New States for Modals
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] = useState(false);
  const [isTransferDaysModalOpen, setIsTransferDaysModalOpen] = useState(false);
  const [isComplimentaryDaysModalOpen, setIsComplimentaryDaysModalOpen] = useState(false);
  const [isMembershipUpgradeModalOpen, setIsMembershipUpgradeModalOpen] = useState(false);
  const [isMembershipFormModalOpen, setIsMembershipFormModalOpen] = useState(false);

  // State for Transfer Days Modal
  const [transferDaysData, setTransferDaysData] = useState({
    targetMemberNumber: '',
  });

  // State for Complimentary Days Modal
  const [complimentaryDaysData, setComplimentaryDaysData] = useState({
    days: '',
  });

  // State for Upgrade Membership Modal
  const [upgradeMembershipData, setUpgradeMembershipData] = useState({
    membership_type: '',
  });

  // State for Edit Member Modal
  const [editMemberData, setEditMemberData] = useState({});

  // State for Collapsible sections
  const [isPaymentHistoryCollapsed, setIsPaymentHistoryCollapsed] = useState(true);
  const [isAttendanceRecordsCollapsed, setIsAttendanceRecordsCollapsed] = useState(true);

  // navigate
  const navigate = useNavigate();

  const fetchMemberData = useCallback(async () => {
    if (!memberNumber) {
      setError('Member number is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch member details first
      const memberDetails = await memberService.getMemberById(memberNumber);
      setMemberData(memberDetails);
      setEditMemberData(memberDetails); // Initialize edit form data

      // Then fetch payments and attendance
      const [memberPayments, memberAttendance] = await Promise.all([
        memberService.getMemberPayments(memberNumber),
        memberService.getMemberAttendance(memberNumber),
      ]);

      setPayments(memberPayments);
      setAttendance(memberAttendance);
      setError(null);
    } catch (err) {
      console.error('Error fetching member data:', err);
      setError('Failed to fetch member data');
      setMemberData(null);
    } finally {
      setLoading(false);
    }
  }, [memberNumber]);

  const fetchMembershipPlans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(
        `/api/memberships/plans`,
        
      );
      setAvailablePlans(response.data);
    } catch (err) {
      console.error('Error fetching membership plans:', err);
    }
  };

  // Updated: Added validations and ensure numeric conversion.
  const handleRenewalDueAmountChange = (e) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;
    if (value < 0) {
      alert('Due amount cannot be negative');
      return;
    }
    if (value > memberData.membership_amount) {
      alert('Due amount cannot exceed total membership payment');
      return;
    }
    setMemberData({
      ...memberData,
      membership_due_amount: value,
    });
  };

  // This function handles the due payment submission from the modal
  const handlePayDueSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const token = localStorage.getItem('token');
      const response = await API.post(
        `/api/memberships/pay-due`, // Ensure correct URL
        {
          number: memberData.number,
          amount_paid: parseFloat(duePayment.amount),
          payment_mode: duePayment.payment_mode,
        },
        
      );

      if (response.data) {
        setShowSuccessfullPayment(true);
        setIsPayDueModalOpen(false);
        await fetchMemberData(); // Refetch member data to update profile

        setTimeout(() => {
          setShowSuccessfullPayment(false);
        }, 1500);
      }
    } catch (error) {
      setShowSuccessfullPayment(false);
      console.error('Error processing due payment:', error);
      alert(error.response?.data?.message || 'Error processing payment');
    }
  };

  // Opens the renewal modal and resets due amount to 0 so the user must explicitly set it
  const handleRenewMembership = async (member) => {
    setMemberData({ ...member, membership_due_amount: 0 }); // reset due amount
    setIsRenewalOpen(true);
  };

  // Handles form submission in the renewal modal with added validations and calculation
  const handleRenewMember = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const dueAmount = parseFloat(memberData.membership_due_amount); //No need to use ||0 because of the validation
    // Validation: cannot be negative or exceed total membership_amount
    if (dueAmount < 0) {
      alert('Due amount cannot be negative');
      return;
    }
    if (dueAmount > memberData.membership_amount) {
      alert('Due amount cannot exceed total membership payment');
      return;
    }
    // Calculate actual amount paid this renewal
    const actualPaid = memberData.membership_amount - dueAmount;
    const paymentStatus = dueAmount > 0 ? 'Pending' : 'Paid';

    try {
      const token = localStorage.getItem('token');
      await API.post(
        `/api/memberships/renew`, // Ensure correct URL
        {
          number: memberData.number,
          membership_type: memberData.membership_type,
          membership_amount: memberData.membership_amount,
          // Send the updated payment status and due amount
          membership_payment_status: paymentStatus,
          membership_due_amount: dueAmount,
          membership_payment_mode: memberData.membership_payment_mode,
          // Include actual amount paid (if needed by backend)
          actual_amount_paid: actualPaid,
        },
        
      );
      await fetchMemberData(); // Refetch member data to update profile
      setIsRenewalOpen(false);
      setShowSuccessfullPayment(true);
      setTimeout(() => {
        setShowSuccessfullPayment(false);
      }, 1500);
    } catch (err) {
      console.error('Error renewing membership:', err);
      alert(err.response?.data?.message || 'Error renewing membership');
    }
  };

  const handleRecordAttendance = async (memberNumber) => {
    try {
      const response = await memberService.recordAttendance(memberNumber);
      console.log('Attendance recorded:', response);
      await fetchMemberData(); // Optionally refresh data to update attendance history
    } catch (error) {
      console.error('Error recording attendance:', error);
      alert(error.response?.data?.message || 'Error recording attendance');
    }
  };

  const handleCheckOut = async (memberNumber) => {
    try {
      const response = await memberService.checkOutMember(memberNumber);
      console.log('Check-out recorded:', response);
      await fetchMemberData(); // Refresh data to update attendance history
    } catch (error) {
      console.error('Error recording check-out:', error);
      alert(error.response?.data?.message || 'Error recording check-out');
    }
  };


  // --- New Action Handlers ---
  const handleEditMemberModal = () => {
    setIsEditMemberModalOpen(true);
  };

  const handleDeleteMemberModal = () => {
    setIsDeleteMemberModalOpen(true);
  };

  const handleTransferDaysModal = () => {
    setIsTransferDaysModalOpen(true);
  };

  const handleComplimentaryDaysModal = () => {
    setIsComplimentaryDaysModalOpen(true);
  };

  const handleMembershipUpgradeModal = () => {
    setIsMembershipUpgradeModalOpen(true);
  };

  const handleMembershipFormModal = () => {
    setIsMembershipFormModalOpen(true);
    // In real implementation, you might fetch or generate the form here
    alert('Membership form functionality to be implemented.'); // Placeholder
  };

  // --- Implement API calls for new actions ---

  const handleEditMember = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const token = localStorage.getItem('token');
      await API.put(
        `/api/member/members/${memberData.number}`, // Ensure correct URL
        editMemberData,
        
      );
      await fetchMemberData(); // Refresh member data
      setIsEditMemberModalOpen(false);
      setShowSuccessfullPayment(true);
      setTimeout(() => {
        setShowSuccessfullPayment(false);
      }, 1500);
    } catch (error) {
      console.error('Error editing member:', error);
      alert(error.response?.data?.message || 'Error editing member');
    }
  };


  const handleDeleteMember = async () => {
    try {
      const token = localStorage.getItem('token');
      await API.delete(
        `/api/member/members/${memberData.number}`, // Ensure correct URL
        
      );
      alert('Member deleted successfully.');
      // After successful deletion, you might want to navigate back to the members list or update the UI as needed.
      // For now, we will just close the modal and not refetch member data as it's deleted.
      setIsDeleteMemberModalOpen(false);
      // Consider: You might want to trigger an event to notify the parent component that a member was deleted,
      // so it can update the member list. For now, we are just alerting and closing the modal.
      // navigate to members list
      navigate('/dashboard/members');
    } catch (error) {
      console.error('Error deleting member:', error);
      alert(error.response?.data?.message || 'Error deleting member');
    }
  };

  const handleTransferDays = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const token = localStorage.getItem('token');
      await API.post(
        `/api/member/transfer`, // Ensure correct URL
        {
          source_number: memberData.number,
          target_number: transferDaysData.targetMemberNumber,
        },
        
      );
      await fetchMemberData(); // Refresh member data
      setIsTransferDaysModalOpen(false);
      setShowSuccessfullPayment(true);
      setTimeout(() => {
        setShowSuccessfullPayment(false);
      }, 1500);
    } catch (error) {
      console.error('Error transferring days:', error);
      alert(error.response?.data?.message || 'Error transferring days');
    }
  };

  const handleComplimentaryDays = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const token = localStorage.getItem('token');
      await API.post(
        `/api/member/complimentary-days`, // Ensure correct URL
        {
          number: memberData.number,
          days: parseInt(complimentaryDaysData.days, 10),
        },
        
      );
      await fetchMemberData(); // Refresh member data
      setIsComplimentaryDaysModalOpen(false);
      setShowSuccessfullPayment(true);
      setTimeout(() => {
        setShowSuccessfullPayment(false);
      }, 1500);
    } catch (error) {
      console.error('Error adding complimentary days:', error);
      alert(error.response?.data?.message || 'Error adding complimentary days');
    }
  };

  const handleMembershipUpgrade = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const token = localStorage.getItem('token');
      await API.put(
        `/api/member/members/${memberData.number}`, // Ensure correct URL, using existing update endpoint
        {
          membership_type: upgradeMembershipData.membership_type,
        },
        
      );
      await fetchMemberData(); // Refresh member data
      setIsMembershipUpgradeModalOpen(false);
      setShowSuccessfullPayment(true);
      setTimeout(() => {
        setShowSuccessfullPayment(false);
      }, 1500);
    } catch (error) {
      console.error('Error upgrading membership:', error);
      alert(error.response?.data?.message || 'Error upgrading membership');
    }
  };


  const handleCheckPaymentStatus = (member) => {
    console.log('Check payment status for:', member);
    // No need to fetchMemberData here unless payment status is displayed and needs immediate update.
  };

  const handleViewSchedule = (member) => {
    console.log('View schedule for:', member);
    // No need to fetchMemberData here unless schedule info is part of memberData and needs update.
  };

  const handlePrintMemberCard = (member) => {
    console.log('Print card for:', member);
    // No need to fetchMemberData as printing card is likely a client-side action.
  };

  // Collapse/Expand Handlers
  const togglePaymentHistoryCollapse = () => {
    setIsPaymentHistoryCollapsed(!isPaymentHistoryCollapsed);
  };

  const toggleAttendanceRecordsCollapse = () => {
    setIsAttendanceRecordsCollapsed(!isAttendanceRecordsCollapsed);
  };


  useEffect(() => {
    fetchMemberData();
    fetchMembershipPlans();
  }, [fetchMemberData]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!memberData) return <div>No member data found</div>;

  // AGGREGATE: Calculate totals from all payment records
  const aggregateTotalAmount = payments.reduce(
    (sum, payment) => sum + (payment.membership_amount || 0),
    0
  );
  const aggregateTotalDue = memberData.member_total_due_amount;
  const aggregateTotalPaid = aggregateTotalAmount - aggregateTotalDue;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Member Profile</h2>

        {/* Personal Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{memberData.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{memberData.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{memberData.number}</p>
            </div>
            <div>
              <p className="text-gray-600">Join Date</p>
              <p className="font-medium">
                {new Date(memberData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Membership Details */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Membership Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Type</p>
              <p className="font-medium">{memberData.membership_type}</p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <p
                className={`font-medium ${
                  memberData.membership_status.toLowerCase() === 'active'
                    ? 'text-green-600'
                    : memberData.membership_status.toLowerCase() === 'expired'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }`}
              >
                {memberData.membership_status}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Expiry Date</p>
              <p className="font-medium">
                {new Date(memberData.membership_end_date).toLocaleDateString()}
              </p>
            </div>
            {/* AGGREGATE: Show overall payment summary from all renewals */}
            <div>
              <p className="text-gray-600">Overall Payment Status</p>
              <p className="font-medium">
                {aggregateTotalDue > 0 ? 'Partially Paid' : 'Fully Paid'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Member Actions</h3>
          <div className="grid grid-cols-6 gap-2">

             {/* Edit Member */}
             <button
              onClick={handleEditMemberModal}
              className="relative group flex items-center justify-center p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
              title="Edit Member"
            >
              <FaUserEdit className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Edit Member
              </span>
            </button>

            {/* Delete Member */}
            <button
              onClick={handleDeleteMemberModal}
              className="relative group flex items-center justify-center p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              title="Delete Member"
            >
              <FaUserTimes className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Delete Member
              </span>
            </button>

            {/* Transfer Days */}
            <button
              onClick={handleTransferDaysModal}
              className="relative group flex items-center justify-center p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              title="Transfer Days"
            >
              <FaExchangeAlt className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Transfer Days
              </span>
            </button>

            {/* Complimentary Days */}
            <button
              onClick={handleComplimentaryDaysModal}
              className="relative group flex items-center justify-center p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              title="Complimentary Days"
            >
              <FaCalendarPlus className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Complimentary Days
              </span>
            </button>

             {/* Renew Membership */}
             <button
              onClick={() => handleRenewMembership(memberData)}
              className="relative group flex items-center justify-center p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              title="Renew Membership"
            >
              <FaSync className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Renew Membership
              </span>
            </button>

             {/* Membership Upgrade */}
             <button
              onClick={handleMembershipUpgradeModal}
              className="relative group flex items-center justify-center p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
              title="Membership Upgrade"
            >
              <FaArrowCircleUp className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Membership Upgrade
              </span>
            </button>


            {/* Record Attendance */}
            {/* <button
              onClick={() => handleRecordAttendance(memberData.number)}
              className="relative group flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              title="Record Attendance"
            >
              <FaCalendarCheck className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Record Attendance
              </span>
            </button> */}


            {/* Check Out */}
            {/* <button
              onClick={() => handleCheckOut(memberData.number)}
              className="relative group flex items-center justify-center p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              title="Check Out"
            >
              <FaSignOutAlt className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Check Out
              </span>
            </button> */}

            {/* AGGREGATE: Use aggregated due amount for the Pay Due button */}
            {aggregateTotalDue > 0 && (
              <button
                onClick={() => setIsPayDueModalOpen(true)}
                className="relative group flex items-center justify-center p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                title="Pay Due"
              >
                <FaMoneyBillWave className="text-xl" />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                  Pay Due (₹{aggregateTotalDue})
                </span>
              </button>
            )}

            {/* View Schedule */}
            {/* <button
              onClick={() => handleViewSchedule(memberData)}
              className="relative group flex items-center justify-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              title="View Schedule"
            >
              <FaClock className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                View Schedule
              </span>
            </button> */}

            {/* Print Member Card */}
            <button
              onClick={() => handlePrintMemberCard(memberData)}
              className="relative group flex items-center justify-center p-3 bg-stone-600 text-white rounded-lg hover:bg-stone-700 transition-colors duration-200"
              title="Print Card"
            >
              <FaIdCard className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Print Card
              </span>
            </button>

            {/* Membership Form */}
            <button
              onClick={handleMembershipFormModal}
              className="relative group flex items-center justify-center p-3 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors duration-200"
              title="Membership Form"
            >
              <FaFileImage className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Membership Form
              </span>
            </button>
          </div>
        </div>

        {/* Payment History */}
        <div className="mb-8">
          <h3
            className="text-lg font-semibold mb-4 cursor-pointer flex justify-between items-center"
            onClick={togglePaymentHistoryCollapse}
          >
            <span>Payment History</span>
            {isPaymentHistoryCollapsed ? <FaChevronDown /> : <FaChevronUp />}
          </h3>
          {!isPaymentHistoryCollapsed && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td className="px-6 py-4">
                        {new Date(
                          payment.membership_payment_date
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        ₹{payment.membership_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.membership_payment_status.toLowerCase() ===
                            'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {payment.membership_payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Attendance Records */}
        <div className="mb-8">
          <h3
            className="text-lg font-semibold mb-4 cursor-pointer flex justify-between items-center"
            onClick={toggleAttendanceRecordsCollapse}
          >
            <span>Attendance Records</span>
            {isAttendanceRecordsCollapsed ? <FaChevronDown /> : <FaChevronUp />}
          </h3>
          {!isAttendanceRecordsCollapsed && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Check Out
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4">
                        {new Date(record.checkIn).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(record.checkIn).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4">
                        {record.checkOut
                          ? new Date(record.checkOut).toLocaleTimeString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Membership Renewal Modal */}
      {IsRenewalOpen && (
        <Dialog
          open={IsRenewalOpen}
          onClose={() => setIsRenewalOpen(false)}
          className="relative z-50"
        >
          {/* ... Renewal Modal Content - No changes here*/}
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg p-6 w-96">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Renew Membership
              </Dialog.Title>
              <form onSubmit={(e) => handleRenewMember(e)}> {/* Added e.preventDefault() here */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Membership Type
                    </label>
                    <select
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      value={memberData?.membership_type}
                      onChange={(e) => {
                        const selectedPlan = availablePlans.find(
                          (plan) => plan.name === e.target.value
                        );
                        setMemberData({
                          ...memberData,
                          membership_type: e.target.value,
                          membership_amount: selectedPlan?.price,
                          // Reset due amount when plan changes
                          membership_due_amount: 0,
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
                      min="0"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      value={memberData?.membership_due_amount || 0}
                      onChange={handleRenewalDueAmountChange}
                    />
                  </div>

                  {/* Added Actual Amount Paid section here */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Actual Amount Paid
                    </label>
                    <p className="text-lg font-semibold text-green-600">
                      ₹
                      {memberData.membership_amount -
                        memberData.membership_due_amount}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Mode
                    </label>
                    <select
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      value={memberData?.membership_payment_mode}
                      onChange={(e) =>
                        setMemberData({
                          ...memberData,
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
                    onClick={() => setIsRenewalOpen(false)}
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
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      {/* Pay Due Modal */}
      {isPayDueModalOpen && (
        <Dialog
          open={isPayDueModalOpen}
          onClose={() => setIsPayDueModalOpen(false)}
          className="relative z-50"
        >
          {/* ... Pay Due Modal Content - No changes here*/}
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6">
              <Dialog.Title className="text-xl font-semibold mb-4">
                Pay Due Amount
              </Dialog.Title>
              <form onSubmit={(e) => handlePayDueSubmit(e)}> {/* Added e.preventDefault() here */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Due Amount
                    </label>
                    <p className="text-lg font-semibold text-red-600">
                      ₹{aggregateTotalDue}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount to Pay
                    </label>
                    <input
                      type="number"
                      max={aggregateTotalDue}
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
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      {/* Edit Member Modal */}
      {isEditMemberModalOpen && (
        <Dialog
          open={isEditMemberModalOpen}
          onClose={() => setIsEditMemberModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Edit Member Details
              </Dialog.Title>
              <form onSubmit={(e) => handleEditMember(e)}> {/* Added e.preventDefault() here */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      value={editMemberData.name || ''}
                      onChange={(e) => setEditMemberData({ ...editMemberData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      value={editMemberData.email || ''}
                      onChange={(e) => setEditMemberData({ ...editMemberData, email: e.target.value })}
                    />
                  </div>
                  {/* Add other fields you want to edit similarly */}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
                    onClick={() => setIsEditMemberModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      {/* Delete Member Confirmation Modal */}
      {isDeleteMemberModalOpen && (
        <Dialog
          open={isDeleteMemberModalOpen}
          onClose={() => setIsDeleteMemberModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Confirm Delete Member
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete member "{memberData.name}"? This action cannot be undone.
              </Dialog.Description>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
                  onClick={() => setIsDeleteMemberModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMember}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg"
                >
                  Delete Member
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      {/* Transfer Days Modal */}
      {isTransferDaysModalOpen && (
        <Dialog
          open={isTransferDaysModalOpen}
          onClose={() => setIsTransferDaysModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Transfer Membership Days
              </Dialog.Title>
              <form onSubmit={(e) => handleTransferDays(e)}> {/* Added e.preventDefault() here */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Member Number</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      value={transferDaysData.targetMemberNumber}
                      onChange={(e) => setTransferDaysData({ ...transferDaysData, targetMemberNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
                    onClick={() => setIsTransferDaysModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                  >
                    Transfer Days
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      {/* Complimentary Days Modal */}
      {isComplimentaryDaysModalOpen && (
        <Dialog
          open={isComplimentaryDaysModalOpen}
          onClose={() => setIsComplimentaryDaysModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Add Complimentary Days
              </Dialog.Title>
              <form onSubmit={(e) => handleComplimentaryDays(e)}> {/* Added e.preventDefault() here */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Days</label>
                    <input
                      type="number"
                      min="1"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      value={complimentaryDaysData.days}
                      onChange={(e) => setComplimentaryDaysData({ ...complimentaryDaysData, days: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
                    onClick={() => setIsComplimentaryDaysModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                  >
                    Add Days
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}

      {/* Membership Upgrade Modal */}
      {isMembershipUpgradeModalOpen && (
        <Dialog
          open={isMembershipUpgradeModalOpen}
          onClose={() => setIsMembershipUpgradeModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Upgrade Membership
              </Dialog.Title>
              <form onSubmit={(e) => handleMembershipUpgrade(e)}> {/* Added e.preventDefault() here */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Membership Type</label>
                    <select
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                      value={upgradeMembershipData.membership_type}
                      onChange={(e) => setUpgradeMembershipData({ ...upgradeMembershipData, membership_type: e.target.value })}
                    >
                      <option value="">Select Plan</option> {/* Default option */}
                      {availablePlans.map((plan) => (
                        <option key={plan._id} value={plan.name}>
                          {plan.name} - ₹{plan.price}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
                    onClick={() => setIsMembershipUpgradeModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg"
                  >
                    Upgrade Membership
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}


      {/* Membership Form Modal - Placeholder */}
      {isMembershipFormModalOpen && (
        <Dialog
          open={isMembershipFormModalOpen}
          onClose={() => setIsMembershipFormModalOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-lg">
              <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                Membership Form - {memberData.name}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-500 mb-4">
                {/* Placeholder for Membership Form - Replace with actual form display */}
                <p>Membership Form Image/Content will be displayed here.</p>
                <p>Currently, this is a placeholder.</p>
              </Dialog.Description>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
                  onClick={() => setIsMembershipFormModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}


      <SuccessfullPayment show={ShowSuccessfullPayment} />
    </div>
  );
};

MemberProfile.propTypes = {
  memberNumber: PropTypes.string.isRequired,
};

export default MemberProfile;