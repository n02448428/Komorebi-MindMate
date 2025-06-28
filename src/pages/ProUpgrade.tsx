import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession } from '../utils/sceneUtils';
import { subscriptionService } from '../lib/supabase';
import NatureVideoBackground from '../components/NatureVideoBackground';
import { Crown, Check, Sparkles, Heart, Brain, ArrowLeft, Infinity } from 'lucide-react';

const ProUpgrade: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const timeOfDay = getTimeOfDay();
  const currentScene = getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening');

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly Pro',
      price: 9.99,
      period: 'month',
      features: [
        'Unlimited daily sessions',
        'Advanced AI intentions & personalized guidance',
        'All nature scenes unlocked',
        'Permanent intention history',
        'Custom session themes',
        'Priority support',
      ],
      isPopular: false,
    },
    {
      id: 'yearly',
      name: 'Yearly Pro',
      price: 79.99,
      period: 'year',
      originalPrice: 119.88,
      features: [
        'Everything in Monthly Pro',
        'Save 33% with annual billing',
        'Exclusive yearly subscriber perks',
        'Voice session recording (coming soon)',
        'Advanced mood tracking & trends',
        'Early access to new features',
      ],
      isPopular: true,
    },
  ];

  const freeFeatures = [
    'Daily intention sessions',
    '4 AI responses per session',
    '7-day intention history',
    'Basic nature scenes',
  ];

  const handleUpgrade = async (planId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Simulate subscription creation (replace with actual RevenueCat integration)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await subscriptionService.createSubscription(user.id, planId);
      
      if (result.success) {
        alert('Welcome to Komorebi Pro! 🎉 Enjoy unlimited sessions and deeper intentions.');
        navigate('/');
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('There was an issue processing your subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

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
          className={`relative z-[999] p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
            timeOfDay.period === 'morning'
              ? 'bg-white/20 hover:bg-white/30 text-gray-700'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className={`text-2xl font-bold ${
          timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
        }`}>
          Upgrade to Pro
        </div>
        
        <div className="w-11" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className={`w-10 h-10 ${
                timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-amber-400'
              }`} />
              <Sparkles className={`w-10 h-10 ${
                timeOfDay.period === 'morning' ? 'text-purple-600' : 'text-purple-400'
              }`} />
            </div>
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${
              timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Unlock Your Full Potential
            </h1>
            <p className={`text-xl ${
              timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              Experience unlimited conversations and deeper intentions with Komorebi Pro
            </p>
          </div>

          {/* Feature Comparison */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Free Plan */}
            <div className={`p-6 rounded-3xl backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <div className="text-center mb-6">
                <h3 className={`text-xl font-semibold ${
                  timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  Free Plan
                </h3>
                <div className={`text-3xl font-bold mt-2 ${
                  timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  $0
                </div>
                <div className={`text-sm ${
                  timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Forever
                </div>
              </div>
              
              <ul className="space-y-3">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 mt-0.5 ${
                      timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm ${
                      timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Plans */}
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-3xl backdrop-blur-sm border ${
                  plan.isPopular
                    ? 'border-amber-400/50 bg-gradient-to-br from-amber-500/20 to-orange-500/20'
                    : 'border-white/20 bg-white/10'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className={`text-xl font-semibold ${
                    timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    {plan.name}
                  </h3>
                  <div className="mt-2">
                    {plan.originalPrice && (
                      <div className={`text-lg line-through ${
                        timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        ${plan.originalPrice}
                      </div>
                    )}
                    <div className={`text-3xl font-bold ${
                      timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                    }`}>
                      ${plan.price}
                    </div>
                    <div className={`text-sm ${
                      timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      per {plan.period}
                    </div>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 mt-0.5 ${
                        timeOfDay.period === 'morning' ? 'text-green-600' : 'text-green-400'
                      }`} />
                      <span className={`text-sm ${
                        timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-gray-200'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isLoading}
                  className={`w-full p-3 rounded-2xl font-medium transition-all duration-200 ${
                    plan.isPopular
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                      : (timeOfDay.period === 'morning'
                          ? 'bg-gray-800 hover:bg-gray-900 text-white'
                          : 'bg-white/20 hover:bg-white/30 text-white')
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Processing...' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className={`p-8 rounded-3xl backdrop-blur-sm border border-white/20 ${
            timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            <h2 className={`text-2xl font-bold text-center mb-8 ${
              timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Why upgrade to Pro?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center backdrop-blur-sm ${
                  timeOfDay.period === 'morning' ? 'bg-blue-500/20' : 'bg-blue-600/20'
                }`}>
                  <Infinity className={`w-8 h-8 ${
                    timeOfDay.period === 'morning' ? 'text-blue-600' : 'text-blue-400'
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  Unlimited Sessions
                </h3>
                <p className={`text-sm ${
                  timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  Set intentions as often as you need without daily limits. Your mental wellness shouldn't have boundaries.
                </p>
              </div>

              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center backdrop-blur-sm ${
                  timeOfDay.period === 'morning' ? 'bg-purple-500/20' : 'bg-purple-600/20'
                }`}>
                  <Brain className={`w-8 h-8 ${
                    timeOfDay.period === 'morning' ? 'text-purple-600' : 'text-purple-400'
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  Deeper Insights
                </h3>
                <p className={`text-sm ${
                  timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  Advanced AI analysis provides more nuanced and personalized intention guidance for your growth journey.
                </p>
              </div>

              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center backdrop-blur-sm ${
                  timeOfDay.period === 'morning' ? 'bg-green-500/20' : 'bg-green-600/20'
                }`}>
                  <Heart className={`w-8 h-8 ${
                    timeOfDay.period === 'morning' ? 'text-green-600' : 'text-green-400'
                  }`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${
                  timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  Premium Experience
                </h3>
                <p className={`text-sm ${
                  timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  Access all nature scenes, custom themes, and upcoming features like voice sessions.
                </p>
              </div>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="text-center mt-8">
            <p className={`text-sm ${
              timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              30-day money-back guarantee • Cancel anytime • Secure payment processing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProUpgrade;