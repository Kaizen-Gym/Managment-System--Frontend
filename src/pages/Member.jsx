/* eslint-disable no-unused-vars */

import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import MembersList from '../components/MembersSection/MembersList';
import MemberProfile from '../components/MembersSection/MemberProfile';

const Members = () => {
  const [loading, setLoading] = useState(false);
  const [selectedMemberNumber, setSelectedMemberNumber] = useState(null);

  const handleSelectMember = (number) => {
    setSelectedMemberNumber(number);
  };

  const handleBack = () => {
    setSelectedMemberNumber(null);
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

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        {selectedMemberNumber ? (
          <>
            <button 
              onClick={handleBack}
              className="mb-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              ← Back to Members List
            </button>
            <MemberProfile memberNumber={selectedMemberNumber} /> {/* Changed from memberId to memberNumber */}
          </>
        ) : (
          <MembersList onSelectMember={handleSelectMember} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Members;