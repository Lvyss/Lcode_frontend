// src/pages/user/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { userAPI } from "../../services/api";
import TreeVisualization from "../../components/TreeVisualization";
import BadgeCollection from "./BadgeCollection";
import StatsCard from "../../components/StatsCard";
import Leaderboard from "../../components/Leaderboard";

const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [profileRes, treeRes, leaderboardRes] = await Promise.all([
        userAPI.profile.getStats(),
        userAPI.tree.getProgress(),
        userAPI.leaderboard.get(),
      ]);

      setProfileData(profileRes.data);
      setTreeData(treeRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  if (!profileData || !treeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* HEADER SECTION */}
        <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center space-x-6">
            <img
              src={profileData.user.avatar}
              alt={profileData.user.name}
              className="w-20 h-20 border-4 border-indigo-100 rounded-full"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {profileData.user.name}
              </h1>
              <p className="text-gray-600">{profileData.user.email}</p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="px-3 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full">
                  Level {profileData.stats.level}
                </span>
                <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                  {profileData.stats.total_exp} EXP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="mb-6 bg-white rounded-lg shadow-sm">
          <nav className="flex px-6 space-x-8">
            {["overview", "tree", "badges", "leaderboard"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "overview"
                  ? "Overview"
                  : tab === "tree"
                  ? "Pohon Progress"
                  : tab === "badges"
                  ? "Koleksi Badge"
                  : "Leaderboard"}
              </button>
            ))}
          </nav>
        </div>

        {/* TAB CONTENT */}
        <div className="p-6 bg-white rounded-lg shadow-sm">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total EXP"
                value={profileData.stats.total_exp}
                icon="⚡"
                color="yellow"
              />
              <StatsCard
                title="Exercises Selesai"
                value={profileData.stats.completed_exercises}
                icon="✅"
                color="green"
              />
              <StatsCard
                title="Parts Diselesaikan"
                value={profileData.stats.completed_parts}
                icon="📚"
                color="blue"
              />
              <StatsCard
                title="Badge Dikoleksi"
                value={profileData.stats.total_badges}
                icon="🏆"
                color="purple"
              />
            </div>
          )}

          {activeTab === "tree" && (
            <TreeVisualization
              treeData={treeData}
              userStats={profileData.stats}
            />
          )}

          {activeTab === "badges" && <BadgeCollection />}

          {activeTab === "leaderboard" && <Leaderboard data={leaderboard} />}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
