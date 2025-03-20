/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { memberService } from '../../services/api';
import PropTypes from 'prop-types';

const MembersList = ({ onSelectMember }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await memberService.getMembers(
          currentPage,
          itemsPerPage,
          filterStatus
        );
        setMembers(response.members);
        setTotalPages(response.totalPages);
        setCurrentPage(response.page);
        setTotalCount(response.total);
      } catch (error) {
        console.error('Error fetching members:', error);
        setError('Failed to fetch members');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [currentPage, itemsPerPage, filterStatus]);

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error)
    return <div className="text-center py-4 text-red-600">{error}</div>;
  if (!members || members.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-4">
          <p className="text-gray-500">No members found</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-500 hover:text-blue-600"
          >
            Refresh page
          </button>
        </div>
      </div>
    );
  }

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      member.membership_status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });
  
  const displayedMembers = members.filter((member) => 
    searchTerm
      ? member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <div className="bg-white rounded-lg shadow ">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold mb-4 md:mb-0">Members</h2>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="border rounded-lg px-4 py-2"
              value={filterStatus}
              onChange={handleFilterChange}
            >
              <option value="all">All Members</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membership
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedMembers.map((member) => (
                <tr key={member._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {member.membership_type}
                    </div>
                    <div className="text-sm text-gray-500">
                      Expires:{' '}
                      {new Date(
                        member.membership_end_date
                      ).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        member.membership_status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : member.membership_status === 'Expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {member.membership_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => onSelectMember(member.number)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
              Total: {totalCount} members
            </div>
          </div>

          {/* Pagination controls - Both Mobile and Desktop */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-700 whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex gap-1">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm font-medium rounded-lg ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                First
              </button>

              {/* Previous */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm font-medium rounded-lg ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Previous
              </button>

              {/* Current Page */}
              <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-300">
                {currentPage}
              </span>

              {/* Next */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm font-medium rounded-lg ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
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
  );
};

//prop validation
MembersList.propTypes = {
  onSelectMember: PropTypes.func.isRequired,
};

export default MembersList;
