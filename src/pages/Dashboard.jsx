import { useState, useEffect } from "react";
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
} from "react-icons/fa";
import axios from "axios";
import { Dialog, DialogPanel } from "@headlessui/react";

//Components
import DashboardLayout from "../components/DashboardLayout";

function Dashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    number: "",
    gender: "",
    age: "",
    email: "",
    membership_type: "Monthly",
    membership_amount: "",
    membership_payment_status: "Paid",
    membership_payment_mode: "Cash",
    membership_payment_date: new Date().toISOString().split("T")[0],
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalMembers: 0,
    newMembers: 0,
    expiringMemberships: 0,
    totalRevenue: 0,
    membershipRenewalRate: 0,
    paymentSummary: {},
    paymentMethodsBreakdown: [],
  });
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [newRenewal, setNewRenewal] = useState({
    number: "",
    membership_type: "",
    membership_payment_status: "",
    membership_payment_mode: "",
    membership_payment_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchMembers();
    fetchDashboardStats();
    fetchMembershipPlans();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5050/api/member/members",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setMembers(response.data.members);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch members");
      setLoading(false);
      console.error("Error fetching members:", err);
    }
  };

  const handleAddMember = () => {
    setIsAddMemberOpen(true);
  };
  const handleRenewMembership = async (member) => {
    setSelectedMember(member);
    setIsRenewModalOpen(true);

    setNewRenewal({
      number: member.number,
      membership_type: member.membership_type,
      membership_payment_status: member.membership_payment_status,
      membership_payment_mode: member.membership_payment_mode,
      membership_payment_date: new Date().toISOString().split("T")[0],
    });
    setIsRenewModalOpen(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5050/api/memberships/renew`,
        newRenewal,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      fetchMembers(); // Refresh the list
    } catch (err) {
      console.error("Error renewing membership:", err);
    }
  };

  const handleEditMember = async (member) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5050/api/member/members/${member.id}`,
        member,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      fetchMembers(); // Refresh the list
    } catch (err) {
      console.error("Error editing member:", err);
    }
  };

  const handleDeleteMember = async (number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5050/api/member/members/${number}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchMembers(); // Refresh the list
    } catch (err) {
      console.error("Error deleting member:", err);
    }
  };

  const handleSubmitNewMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      console.log(
        `New member ${newMember.name} addedthis details are ${newMember.name}, ${newMember.number}, ${newMember.gender}, ${newMember.age}, ${newMember.email}, ${newMember.membership_type}, ${newMember.membership_amount}, ${newMember.membership_payment_status}, ${newMember.membership_payment_mode}, ${newMember.membership_payment_date}`,
      );
      await axios.post("http://localhost:5050/api/member/signup", newMember, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsAddMemberOpen(false);
      fetchMembers(); // Refresh the list
      setNewMember({
        // Reset form
        name: "",
        number: "",
        gender: "",
        age: "",
        email: "",
        membership_type: "",
        membership_amount: "",
        membership_payment_status: "Paid",
        membership_payment_mode: "Cash",
        membership_payment_date: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      console.error("Error adding new member:", err);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch membership stats
      const membershipStats = await axios.get(
        "http://localhost:5050/api/reports/membership",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Fetch financial stats
      const financialStats = await axios.get(
        "http://localhost:5050/api/reports/financial",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDashboardStats({
        totalMembers: membershipStats.data.totalActiveMembers || 0,
        newMembers: membershipStats.data.newMemberSignups?.length || 0,
        expiringMemberships:
          membershipStats.data.expiringMemberships?.length || 0,
        totalRevenue: financialStats.data.totalRevenue || 0,
        membershipRenewalRate: membershipStats.data.membershipRenewalRate || 0,
        paymentSummary: financialStats.data.paymentSummary || {},
        paymentMethodsBreakdown:
          financialStats.data.paymentMethodsBreakdown || [],
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError("Failed to fetch dashboard statistics");
    }
  };

  const fetchMembershipPlans = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/memberships/plans`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setAvailablePlans(response.data);
    } catch (err) {
      console.error("Error fetching membership plans:", err);
    }
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/memberships/renew`,
        {
          number: selectedMember.number,
          membership_type: selectedMember.membership_type,
          membership_amount: selectedMember.membership_amount,
          membership_payment_status: "Paid",
          membership_payment_mode: selectedMember.membership_payment_mode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      fetchMembers();
      setIsRenewModalOpen(false);
    } catch (err) {
      console.error("Error renewing membership:", err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/member/members/${selectedMember.number}`,
        selectedMember,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      fetchMembers();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error updating member:", err);
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
                      {dashboardStats.totalMembers}
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
            </div>

            {/* Payment Methods Breakdown */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Methods
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                              member.membership_status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {member.membership_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            member.membership_end_date,
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                            (plan) => plan.name === e.target.value,
                          );
                          setNewMember({
                            ...newMember,
                            membership_type: e.target.value,
                            membership_amount: selectedPlan
                              ? selectedPlan.price
                              : "",
                            membership_duration: selectedPlan
                              ? selectedPlan.duration
                              : "",
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
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                        value={newMember.membership_payment_status}
                        onChange={(e) =>
                          setNewMember({
                            ...newMember,
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
                          (plan) => plan.name === e.target.value,
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
                        value={selectedMember?.name || ""}
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
                        value={selectedMember?.number || ""}
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
                        value={selectedMember?.gender || ""}
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
                        value={selectedMember?.age || ""}
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
                        value={selectedMember?.email || ""}
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
                        value={selectedMember?.membership_type || ""}
                        onChange={(e) => {
                          const selectedPlan = availablePlans.find(
                            (plan) => plan.name === e.target.value,
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
                        value={selectedMember?.membership_status || ""}
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
                        value={selectedMember?.membership_payment_status || ""}
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
                        value={selectedMember?.membership_payment_mode || ""}
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
    </div>
  );
}

export default Dashboard;
