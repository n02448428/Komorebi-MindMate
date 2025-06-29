import React from 'react';

interface InsightCardProps {
  insight?: any;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-2">Insight Card</h3>
      <p className="text-gray-600">This is a placeholder for the insight card component.</p>
    </div>
  );
};

export default InsightCard;