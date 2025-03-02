/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useCallback } from 'react';
import { memberService } from '../../services/api';
import PropTypes from 'prop-types';

import {
  FaSync,
  FaCalendarCheck,
  FaEdit,
  FaExchangeAlt,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaClock,
  FaIdCard
} from 'react-icons/fa';

const MemberProfile = ({ memberNumber }) => {
  const [memberData, setMemberData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // Then fetch payments and attendance
      const [memberPayments, memberAttendance] = await Promise.all([
        memberService.getMemberPayments(memberNumber),
        memberService.getMemberAttendance(memberNumber)
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
  
  const handleRenewMembership = async (member) => {
    try {
      const response = await memberService.renewMembership(member.number);
      // Handle success
      console.log('Membership renewed:', response);
      fetchMemberData(); // Refresh data
    } catch (error) {
      console.error('Error renewing membership:', error);
    }
  };
  
  const handleRecordAttendance = async (memberNumber) => {
    try {
      const response = await memberService.recordAttendance(memberNumber);
      console.log('Attendance recorded:', response);
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  };
  
  const handleEditMember = (member) => {
    // Implement edit functionality or navigation
    console.log('Edit member:', member);
  };
  
  const handleTransferDays = async (member) => {
    try {
      // Implement transfer days functionality
      console.log('Transfer days for member:', member);
    } catch (error) {
      console.error('Error transferring days:', error);
    }
  };
  
  const handleCheckOut = async (memberNumber) => {
    try {
      const response = await memberService.checkOutMember(memberNumber);
      console.log('Member checked out:', response);
    } catch (error) {
      console.error('Error checking out member:', error);
    }
  };
  
  const handleCheckPaymentStatus = (member) => {
    // Implement payment status check
    console.log('Check payment status for:', member);
  };
  
  const handleViewSchedule = (member) => {
    // Implement schedule view
    console.log('View schedule for:', member);
  };
  
  const handlePrintMemberCard = (member) => {
    // Implement card printing functionality
    console.log('Print card for:', member);
  };

  useEffect(() => {
    fetchMemberData();
  }, [fetchMemberData]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!memberData) return <div>No member data found</div>;

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
              <p className="font-medium">{new Date(memberData.createdAt).toLocaleDateString()}</p>
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
              <p className={`font-medium ${
                memberData.membership_status.toLowerCase() === 'active' ? 'text-green-600' : 
                memberData.membership_status.toLowerCase() === 'expired' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {memberData.membership_status}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Expiry Date</p>
              <p className="font-medium">{new Date(memberData.membership_end_date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Member Actions</h3>
          <div className="grid grid-cols-4 md:grid-cols-14  gap-4">
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
        
            {/* Record Attendance */}
            <button
              onClick={() => handleRecordAttendance(memberData.number)}
              className="relative group flex items-center justify-center p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              title="Record Attendance"
            >
              <FaCalendarCheck className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Record Attendance
              </span>
            </button>
        
            {/* Edit Member */}
            <button
              onClick={() => handleEditMember(memberData)}
              className="relative group flex items-center justify-center p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
              title="Edit Details"
            >
              <FaEdit className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Edit Details
              </span>
            </button>
        
            {/* Transfer Days */}
            <button
              onClick={() => handleTransferDays(memberData)}
              className="relative group flex items-center justify-center p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              title="Transfer Days"
            >
              <FaExchangeAlt className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Transfer Days
              </span>
            </button>
        
            {/* Check Out */}
            <button
              onClick={() => handleCheckOut(memberData.number)}
              className="relative group flex items-center justify-center p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              title="Check Out"
            >
              <FaSignOutAlt className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Check Out
              </span>
            </button>
        
            {/* Check Payment Status */}
            <button
              onClick={() => handleCheckPaymentStatus(memberData)}
              className="relative group flex items-center justify-center p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              title="Payment Status"
            >
              <FaMoneyBillWave className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Payment Status
              </span>
            </button>
        
            {/* View Schedule */}
            <button
              onClick={() => handleViewSchedule(memberData)}
              className="relative group flex items-center justify-center p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
              title="View Schedule"
            >
              <FaClock className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                View Schedule
              </span>
            </button>
        
            {/* Print Member Card */}
            <button
              onClick={() => handlePrintMemberCard(memberData)}
              className="relative group flex items-center justify-center p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              title="Print Card"
            >
              <FaIdCard className="text-xl" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                Print Card
              </span>
            </button>
          </div>
        </div>

        {/* Payment History */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4">
                      {new Date(payment.membership_payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">${payment.membership_amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${payment.membership_payment_status.toLowerCase() === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {payment.membership_payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Attendance Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4">{new Date(record.checkIn).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{new Date(record.checkIn).toLocaleTimeString()}</td>
                    <td className="px-6 py-4">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

MemberProfile.propTypes = {
  memberNumber: PropTypes.string.isRequired,
};

export default MemberProfile;