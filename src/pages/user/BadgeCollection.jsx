// src/pages/user/BadgeCollection.jsx
import React, { useState, useEffect } from "react";
import { userAPI } from "../../services/api";
import BadgeComponent from "../../components/BadgeComponent";

const BadgeCollection = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, earned, unearned

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await userAPI.badges.getUserBadges();
      setBadges(response.data);
    } catch (error) {
      console.error("Failed to fetch badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = badges.filter((badge) => {
    if (filter === "earned") return badge.earned;
    if (filter === "unearned") return !badge.earned;
    return true;
  });

  const earnedCount = badges.filter((b) => b.earned).length;
  const totalCount = badges.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Your Badges</h1>
          <p className="mt-2 text-gray-600">
            Collect badges by completing parts in each section!
          </p>

          {/* Stats */}
          <div className="flex justify-center mt-4 space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {earnedCount}
              </div>
              <div className="text-sm text-gray-500">Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {totalCount}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {totalCount > 0
                  ? Math.round((earnedCount / totalCount) * 100)
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-500">Completion</div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex justify-center mb-6">
          <div className="flex p-1 space-x-2 bg-white rounded-lg shadow-sm">
            {["all", "earned", "unearned"].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                  filter === filterType
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {filterType} (
                {filterType === "all"
                  ? totalCount
                  : filterType === "earned"
                  ? earnedCount
                  : totalCount - earnedCount}
                )
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
          {filteredBadges.map((badge) => (
            <div key={badge.id} className="text-center group">
              <div className="flex justify-center mb-2">
                <BadgeComponent
                  badge={badge}
                  showProgress={true}
                  size="medium"
                />
              </div>
              <div className="text-sm font-medium text-gray-900">
                {badge.name}
              </div>
              {badge.section_name && (
                <div className="text-xs text-gray-500">
                  {badge.section_name}
                </div>
              )}
              {badge.earned_at && (
                <div className="text-xs text-green-600">
                  Earned {new Date(badge.earned_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredBadges.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-lg text-gray-500">
              {filter === "earned"
                ? "You haven't earned any badges yet!"
                : "No badges found"}
            </div>
            <div className="mt-2 text-sm text-gray-400">
              Complete parts in sections to earn badges!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeCollection;
