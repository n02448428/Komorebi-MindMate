import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Application Settings</h2>
          <p className="text-gray-600">Configure your application preferences here.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;