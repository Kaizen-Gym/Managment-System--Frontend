import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  FaHome,
  FaUsers,
  FaChartBar,
  FaCog,
  FaSearch,
  FaTimes,
  FaCreditCard,
  FaBars,
  FaUserShield,
} from "react-icons/fa";
import axios from "axios";
import usePermissions from "../hooks/usePermissions";
import MemberProfile from "./MembersSection/MemberProfile";
import { UserContext } from "../context/UserContext.jsx";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMemberNumber, setSelectedMemberNumber] = useState(null);

  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { user } = useContext(UserContext);

  useEffect(() => {
    console.debug("DashboardLayout mounted: fetching members");
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      console.debug("fetchMembers: token", token);
      const response = await axios.get("http://localhost:5050/api/member/members", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.debug("fetchMembers: response data", response.data);
      setMembers(response.data.members);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching members:", err);
      setError("Failed to fetch members");
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    console.debug("handleSearch: term", term);
    setSearchTerm(term);
    setIsSearching(!!term);

    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const searchLower = term.toLowerCase();
    const filtered = members.filter((member) => {
      return (
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.number.includes(term)
      );
    });

    console.debug("handleSearch: filtered results", filtered);
    setSearchResults(filtered);
  };

  const handleBack = () => {
    console.debug("handleBack: clearing selected member");
    setSelectedMemberNumber(null);
  };

  const menuItems = [
    {
      icon: <FaHome className="w-5 h-5" />,
      title: "Dashboard",
      path: "/dashboard",
      permission: "view_dashboard",
    },
    {
      icon: <FaUsers className="w-5 h-5" />,
      title: "Members",
      path: "/dashboard/members",
      permission: "view_members",
    },
    {
      icon: <FaChartBar className="w-5 h-5" />,
      title: "Reports",
      path: "/dashboard/reports",
      permission: "view_reports",
    },
    {
      icon: <FaCreditCard className="w-5 h-5" />,
      title: "Membership-Plans",
      path: "/dashboard/membership-plans",
      permission: "view_membership_plans",
    },
    {
      icon: <FaCog className="w-5 h-5" />,
      title: "Settings",
      path: "/dashboard/settings",
      permission: "view_settings",
    },
    {
      icon: <FaUserShield className="w-5 h-5" />,
      title: "User Management",
      path: "/dashboard/user-management",
      permission: "manage_users",
    },
  ];

  // Optionally, if no user is found, prompt the user to log in.
  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 transition duration-200 ease-in-out
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <span className="text-2xl font-bold text-white">Kaizen</span>
          <button
            className="md:hidden text-white"
            onClick={() => {
              console.debug("Sidebar: Closing sidebar");
              setSidebarOpen(false);
            }}
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4">
          {menuItems.map((item, index) => {
            const permissionGranted = hasPermission(item.permission);
            console.debug(
              `Menu item [${item.title}]: permission (${item.permission}) granted?`,
              permissionGranted
            );
            return (
              permissionGranted && (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Link>
              )
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Sidebar Toggle Button (Mobile) */}
            <button
              className="md:hidden"
              onClick={() => {
                console.debug("Sidebar: Opening sidebar");
                setSidebarOpen(true);
              }}
            >
              <FaBars className="w-6 h-6" />
            </button>

            {/* Search Bar */}
            <div className="relative ml-auto w-96">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />

              {/* Search Results Dropdown */}
              {isSearching && searchResults.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white 
                                rounded-lg shadow-lg border border-gray-200 z-50 
                                max-h-64 overflow-y-auto">
                  {searchResults.map((member, index) => (
                    <div
                      key={index}
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        console.debug("Member selected:", member);
                        setSelectedMemberNumber(member.number);
                        setIsSearching(false);
                      }}
                    >
                      {member.name} ({member.email})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Page Content */}
        <main className="p-6 flex-1 overflow-auto">
          {children}

          {selectedMemberNumber && (
            <div className="mt-6 bg-white p-4 rounded shadow">
              <button
                onClick={() => {
                  console.debug("Clearing selected member");
                  handleBack();
                }}
                className="mb-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                ← Back to Members List
              </button>
              <MemberProfile memberNumber={selectedMemberNumber} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
