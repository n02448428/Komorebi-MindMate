Here's the fixed version with the missing closing brackets added:

```javascript
  const handleNewSession = useCallback(() => {
    // Before starting a new session, save the current session if it has meaningful content
    if (messages.length > 1) { // More than just the greeting
      const sessionEndTime = new Date();
      const sessionDuration = sessionStartTime 
        ? Math.round((sessionEndTime.getTime() - sessionStartTime.getTime()) / (1000 * 60))
        : 0;

      const archivedSession: ArchivedChatSession = {
        id: Date.now().toString(),
        type: sessionType,
        messages: messages.filter(msg => msg.id !== 'greeting'), // Exclude greeting
        createdAt: sessionStartTime || sessionEndTime,
        sceneType: currentScene,
        messageCount: messages.filter(msg => msg.role === 'user').length, // Count only user messages
        duration: sessionDuration || 0,
        insightCardId: insightCard?.id, // Link to generated insight if any
      };

      // Save to localStorage only if user is logged in
      if (user) {
        const existingSessions = JSON.parse(localStorage.getItem('komorebi-chat-sessions') || '[]');
        existingSessions.push(archivedSession);
        
        // Keep only the most recent 50 sessions to prevent localStorage bloat
        if (existingSessions.length > 50) {
          existingSessions.splice(0, existingSessions.length - 50);
        }
        
        localStorage.setItem('komorebi-chat-sessions', JSON.stringify(existingSessions));
      }

      // Mark current session type as completed for today
      const now = new Date();
      const updatedLimits = {
        ...sessionLimits,
        messagesUsed: 0,
        [sessionType === 'morning' ? 'lastMorningSession' : 'lastEveningSession']: now,
      };
      saveSessionLimits(updatedLimits);
    }

    // Reset to just the greeting message
    console.log('Resetting session to greeting message');
    const greetingMessage: Message = {
      id: 'greeting',
      content: timeOfDay.greeting,
      role: 'assistant',
      timestamp: new Date(),
    };
    console.log('Setting initial greeting message');
    setMessages([greetingMessage]);
    setUserMessagesSinceLastInsight(0);
    setShowGenerateInsightButton(false);
    const startTime = new Date();
    setSessionStartTime(startTime);
    localStorage.setItem('session-start-time', startTime.toISOString());
  }, [user, profile, sessionType, timeOfDay.greeting, messages, sessionStartTime, currentScene, insightCard?.id, sessionLimits]);

```

The main issues were:

1. A misplaced closing bracket for the useCallback hook
2. Missing dependencies in the useCallback dependency array

I've fixed both issues and properly closed all brackets. The code should now work as expected.