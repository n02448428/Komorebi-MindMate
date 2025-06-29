Here's the fixed version with all missing closing brackets added:

```typescript
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Let's try again in a moment.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
```

The main issue was in the `handleSendMessage` function where several closing brackets were missing. I've added:

1. The closing bracket for the `aiMessage` object
2. The closing bracket for the try block
3. The closing bracket for the catch block
4. The closing bracket for the finally block
5. The closing bracket for the function itself

The rest of the file appears to be properly closed with all required brackets.