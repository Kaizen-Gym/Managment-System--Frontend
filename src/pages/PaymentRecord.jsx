import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import moment from 'moment';

const PaymentRecord = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all renewal records from the API route
  useEffect(() => {
    const fetchRenewRecords = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          'http://localhost:5050/api/memberships/renew',
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setRecords(res.data);
        setFilteredRecords(res.data);
      } catch (err) {
        setError('Error fetching renewal records' + err.message);
        console.error(err);
      }
      setLoading(false);
    };

    fetchRenewRecords();
  }, []);

  // Filter records based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredRecords(records);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = records.filter((record) => {
        const recordDate = moment(record.membership_payment_date, 'DD-MM-YYYY'); //Parse record date

        //String checks (unchanged)
        const stringMatch =
          (record.name && record.name.toLowerCase().includes(query)) ||
          (record.number && record.number.toString().includes(query)) ||
          (record.membership_type &&
            record.membership_type.toLowerCase().includes(query)) ||
          (record.membership_payment_status &&
            record.membership_payment_status.toLowerCase().includes(query)) ||
          (record.membership_payment_mode &&
            record.membership_payment_mode.toLowerCase().includes(query)) ||
          (record.membership_amount &&
            record.membership_amount.toString().includes(query)) ||
          (record.membership_due_amount &&
            record.membership_due_amount.toString().includes(query));

        //Date check
        let dateMatch = false;
        try {
          const parsedDate = moment(query, 'DD-MM-YYYY'); // Parse query date in DD-MM-YYYY
          if (parsedDate.isValid()) {
            dateMatch = recordDate.isSame(parsedDate, 'day'); //Compare only the date part.
          }
        } catch (dateParseError) {
          console.error('Error parsing date:', dateParseError);
          //Handle invalid date input from user (optional)
        }
        return stringMatch || dateMatch;
      });
      setFilteredRecords(filtered);
    }
  }, [searchQuery, records]);

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Payment Records</h1>
        <div className="mb-4 relative">
          {' '}
          {/* Added relative for absolute positioning */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="w-5 h-5 text-gray-500  box-sizing-border-box" />
          </div>
          <input
            type="text"
            placeholder="Search payment records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 "
            //Added pl-8 to make space for icon.
          />
        </div>
        {loading ? (
          <p>Loading records...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membership Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Amount (₹)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.membership_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₹{Number(record.membership_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₹{Number(record.membership_due_amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            record.membership_payment_status.toLowerCase() ===
                            'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.membership_payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.membership_payment_mode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(
                          record.membership_payment_date
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PaymentRecord;
