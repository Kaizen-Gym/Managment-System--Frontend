/* eslint-disable no-unused-vars */

import React, { useState, useEffect, useCallback } from 'react';
import { memberService } from '../../services/api';
import PropTypes from 'prop-types';

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