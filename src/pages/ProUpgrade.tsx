import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import { ArrowLeft, Crown, Check, Sparkles, Clock, MessageCircle, Infinity } from 'lucide-react';

const ProUpgrade: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const timeOfDay = getTimeOfDay(profile?.name);
  const currentScene = getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening');

  const handleBack = () => {
    navigate('/session');
  };

  const handleUpgrade = () => {
    // This would integrate with your payment provider
    alert('Payment integration would be implemented here with Stripe or similar service.');
  };

  const features = [
    {
      icon: <Infinity className="w-6 h-6" />,
      title: 'Unlimited Sessions',
      description: 'No daily limits - reflect whenever you need'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Extended Conversations',
      description: '60-minute sessions instead of 15 minutes'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Unlimited Messages',
      description: 'No message limits during your sessions'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Enhanced Insights',
      description: 'More detailed and personalized insight cards'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NatureVideoBackground 
        scene={currentScene} 
        timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'} 
      />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
        <button
          onClick={handleBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
            timeOfDay.period === 'morning'
              ? 'bg-white/20 hover:bg-white/30 text-gray-700'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        
        <div className={`text-2xl font-bold ${
          timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
        }`}>
          Upgrade to Pro
        </div>
        
        <div className="w-16" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-20 pb-16 px-4 md:px-6 h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Crown className={`w-12 h-12 ${
                timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-amber-400'
              }`} />
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
              timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Unlock Your Full Mindful Journey
            </h1>
            <p className={`text-xl ${
              timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
            } max-w-2xl mx-auto`}>
              Experience unlimited mindful conversations and deeper insights with Komorebi Pro
            </p>
          </div>

          {/* Current Status */}
          {user && (
            <div className={`p-6 rounded-3xl backdrop-blur-sm border border-white/20 mb-8 text-center ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <p className={`text-lg ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Current Plan: <span className="font-semibold">
                  {profile?.is_pro ? 'Pro Plan ✨' : 'Free Plan'}
                </span>
              </p>
              {profile?.is_pro && (
                <p className={`text-sm mt-2 ${
                  timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  You're already enjoying all Pro features!
                </p>
              )}
            </div>
          )}

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-3xl backdrop-blur-sm border border-white/20 ${
                  timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                <div className={`flex items-center gap-4 mb-4 ${
                  timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-amber-400'
                }`}>
                  {feature.icon}
                  <h3 className={`text-xl font-semibold ${
                    timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    {feature.title}
                  </h3>
                </div>
                <p className={`${
                  timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Monthly Plan */}
            <div className={`p-8 rounded-3xl backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${
                  timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  Monthly
                </h3>
                <div className={`text-4xl font-bold ${
                  timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  $9.99
                  <span className={`text-lg font-normal ${
                    timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    /month
                  </span>
                </div>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={profile?.is_pro}
                className={`w-full p-4 rounded-2xl font-semibold transition-all duration-200 ${
                  profile?.is_pro
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                }`}
              >
                {profile?.is_pro ? 'Current Plan' : 'Choose Monthly'}
              </button>
            </div>

            {/* Yearly Plan */}
            <div className={`p-8 rounded-3xl backdrop-blur-sm border-2 relative ${
              timeOfDay.period === 'morning' 
                ? 'bg-white/30 border-amber-400/50' 
                : 'bg-white/15 border-amber-400/50'
            }`}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Best Value
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${
                  timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  Yearly
                </h3>
                <div className={`text-4xl font-bold ${
                  timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  $99.99
                  <span className={`text-lg font-normal ${
                    timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    /year
                  </span>
                </div>
                <p className={`text-sm mt-2 ${
                  timeOfDay.period === 'morning' ? 'text-green-600' : 'text-green-400'
                }`}>
                  Save 17% compared to monthly
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={profile?.is_pro}
                className={`w-full p-4 rounded-2xl font-semibold transition-all duration-200 ${
                  profile?.is_pro
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                }`}
              >
                {profile?.is_pro ? 'Current Plan' : 'Choose Yearly'}
              </button>
            </div>
          </div>

          {/* Benefits List */}
          <div className={`p-8 rounded-3xl backdrop-blur-sm border border-white/20 mb-8 ${
            timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            <h3 className={`text-2xl font-bold text-center mb-6 ${
              timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Everything in Pro
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Unlimited daily sessions',
                'Extended 60-minute conversations',
                'Unlimited messages per session',
                'Enhanced AI personality',
                'Priority customer support',
                'Early access to new features',
                'Advanced insight analytics',
                'Export all your data'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className={`w-5 h-5 ${
                    timeOfDay.period === 'morning' ? 'text-green-600' : 'text-green-400'
                  }`} />
                  <span className={`${
                    timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-gray-200'
                  }`}>
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ or additional info */}
          <div className="text-center">
            <p className={`text-sm ${
              timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Cancel anytime • 30-day money-back guarantee • Secure payment
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[5]">
        <p className={`text-[10px] sm:text-xs whitespace-nowrap ${
          timeOfDay.period === 'morning' 
            ? 'text-gray-900' 
            : 'text-white'
        }`}>
          🔒 All data stored locally & privately on your device
        </p>
      </div>
    </div>
  );
};

export default ProUpgrade;