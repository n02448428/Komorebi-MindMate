import { useState } from 'react';
import { Message, InsightCard as InsightCardType, NatureScene } from '../types';
import { aiChatService } from '../lib/supabase';
import { NatureVideoBackgroundRef } from '../components/NatureVideoBackground';

interface UseInsightGenerationProps {
  sessionType: 'morning' | 'evening';
  currentScene: NatureScene;
  videoEnabled: boolean;
  user: any;
  isGuest: boolean;
  storage: {
    get: <T>(key: string, defaultValue: T) => T;
    set: <T>(key: string, value: T) => void;
  };
}

export const useInsightGeneration = ({
  sessionType,
  currentScene,
  videoEnabled,
  user,
  isGuest,
  storage
}: UseInsightGenerationProps) => {
  const [insightCard, setInsightCard] = useState<InsightCardType | null>(null);
  const [showGenerateInsightButton, setShowGenerateInsightButton] = useState(false);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  const simulateInsightGeneration = async (sessionMessages: Message[], sessionType: 'morning' | 'evening') => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const conversationText = sessionMessages.filter(m => m.role === 'user').map(m => m.content).join(' ').toLowerCase();
    
    let quote = "";
    
    if (conversationText.includes('stress') || conversationText.includes('anxious') || conversationText.includes('overwhelmed')) {
      const stressInsights = sessionType === 'morning' 
        ? [
            "Your awareness of stress is the first step toward managing it with grace.",
            "Even in challenging moments, you have the strength to find your center.",
            "Today's difficulties are tomorrow's wisdom in disguise."
          ]
        : [
            "You've carried today's challenges with more resilience than you realize.",
            "Stress reveals our capacity for growth and adaptation.",
            "Every difficult day teaches us something valuable about our inner strength."
          ];
      quote = stressInsights[Math.floor(Math.random() * stressInsights.length)];
    } else if (conversationText.includes('grateful') || conversationText.includes('happy') || conversationText.includes('excited')) {
      const positiveInsights = sessionType === 'morning'
        ? [
            "Gratitude is the foundation upon which beautiful days are built.",
            "Your positive energy is a gift you give to yourself and the world.",
            "Joy shared in the morning multiplies throughout the day."
          ]
        : [
            "Today's joy is a reminder of life's endless capacity for beauty.",
            "Gratitude transforms ordinary moments into extraordinary memories.",
            "Your appreciation for life's gifts illuminates the path forward."
          ];
      quote = positiveInsights[Math.floor(Math.random() * positiveInsights.length)];
    } else if (conversationText.includes('work') || conversationText.includes('career') || conversationText.includes('job')) {
      const workInsights = sessionType === 'morning'
        ? [
            "Your work is an expression of your values and talents.",
            "Purpose-driven action creates meaning in even the smallest tasks.",
            "Today's efforts are building tomorrow's opportunities."
          ]
        : [
            "Your professional journey reflects your commitment to growth and contribution.",
            "Work challenges are invitations to discover new aspects of your capabilities.",
            "Balance between effort and rest creates sustainable success."
          ];
      quote = workInsights[Math.floor(Math.random() * workInsights.length)];
    } else {
      const generalInsights = sessionType === 'morning'
        ? [
            "Today is a canvas waiting for your unique brushstrokes of intention.",
            "Your awareness of this moment is the first step toward meaningful change.",
            "Small, intentional actions create the foundation for extraordinary days.",
            "You have everything within you to make today beautiful.",
            "Clarity comes not from having all the answers, but from asking the right questions."
          ]
        : [
            "Growth happens in the space between challenge and reflection.",
            "Every experience today was a teacher, even the difficult ones.",
            "You showed up today, and that itself is worthy of celebration.",
            "Tomorrow's possibilities are born from today's insights.",
            "Your journey is uniquely yours, and every step has value."
          ];
      quote = generalInsights[Math.floor(Math.random() * generalInsights.length)];
    }
    
    return { quote };
  };

  const generateInsightCard = async (sessionMessages: Message[], videoBackgroundRef?: React.RefObject<NatureVideoBackgroundRef>) => {
    try {
      let response;
      
      try {
        // Try Supabase AI service first
        response = await aiChatService.generateInsightCard(sessionMessages, sessionType);
      } catch (error) {
        console.warn('Supabase AI service failed, using local fallback:', error);
        // Fallback to local insight generation
        response = await simulateInsightGeneration(sessionMessages, sessionType);
      }
      
      // Capture current video frame if video is enabled
      let videoStillUrl = null;
      if (videoEnabled && videoBackgroundRef?.current) {
        // Wait a moment to ensure video is playing
        await new Promise(resolve => setTimeout(resolve, 500));
        videoStillUrl = videoBackgroundRef.current.captureFrame();
        console.log('Video frame capture result:', videoStillUrl ? 'Success' : 'Failed');
      }
      
      // Create a unique ID for this insight
      const insightId = Date.now().toString();
      const sessionId = Date.now().toString();
      
      const insight: InsightCardType = {
        id: insightId,
        quote: response.quote,
        type: sessionType,
        sessionId: sessionId,
        createdAt: new Date(),
        sceneType: currentScene,
        videoStillUrl: videoStillUrl || undefined,
      };
      
      setInsightCard(insight);
      
      // Only save to localStorage if user is logged in
      if (user || isGuest) {
        const existingInsights = storage.get('insight-cards', []);
        const updatedInsights = [...existingInsights, insight];
        storage.set('insight-cards', updatedInsights);
      }
      
      return { sessionId, insightId };
    } catch (error) {
      console.error('Error generating insight:', error);
      // Create a fallback insight with video capture
      try {
        let videoStillUrl = null;
        if (videoEnabled && videoBackgroundRef?.current) {
          await new Promise(resolve => setTimeout(resolve, 500));
          videoStillUrl = videoBackgroundRef.current.captureFrame();
        }
        
        // Create unique IDs
        const insightId = Date.now().toString();
        const sessionId = Date.now().toString();
        
        const fallbackInsight: InsightCardType = {
          id: insightId,
          quote: sessionType === 'morning' 
            ? "Every moment is a fresh beginning, and today holds infinite possibilities for growth and joy."
            : "Today's experiences have shaped you in beautiful ways. Rest knowing you've grown through every challenge and triumph.",
          type: sessionType,
          sessionId: sessionId,
          createdAt: new Date(),
          sceneType: currentScene,
          videoStillUrl: videoStillUrl || undefined,
        };
        
        setInsightCard(fallbackInsight);
        
        if (user || isGuest) {
          const existingInsights = storage.get('insight-cards', []);
          const updatedInsights = [...existingInsights, fallbackInsight];
          storage.set('insight-cards', updatedInsights);
        }
        
        return { sessionId, insightId };
      } catch (fallbackError) {
        console.error('Fallback insight generation failed:', fallbackError);
        throw error;
      }
    }
  };

  const handleGenerateInsightClick = async (sessionMessages: Message[], videoBackgroundRef?: React.RefObject<NatureVideoBackgroundRef>) => {
    setIsGeneratingInsight(true);
    setShowGenerateInsightButton(false);
    
    try {
      // Filter out the greeting message for insight generation
      const filteredMessages = sessionMessages.filter(msg => msg.id !== 'greeting');
      await generateInsightCard(filteredMessages, videoBackgroundRef);
    } catch (error) {
      console.error('Error generating insight:', error);
      // Re-show the button if there was an error
      setShowGenerateInsightButton(true);
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  return {
    insightCard,
    showGenerateInsightButton,
    isGeneratingInsight,
    setInsightCard,
    setShowGenerateInsightButton,
    handleGenerateInsightClick,
    generateInsightCard
  };
};