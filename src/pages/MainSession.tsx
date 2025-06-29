Here's the fixed version with all missing closing brackets added:

```typescript
// Add missing closing bracket for useEffect
useEffect(() => {
  // Auto-start session if conditions are met
  // Store session start time
}, [timeOfDay.shouldAutoStart, sessionStartTime, hasCompletedBothToday, isSessionExpired]);

// Add missing closing bracket for MainSession component
};

// Add missing closing bracket for export default
export default MainSession;
```

The main issues were:

1. Missing closing bracket for the useEffect hook
2. Missing closing bracket for the MainSession component function
3. Missing closing bracket for the export statement

I've added all three missing closing brackets in the appropriate places. The rest of the code appears to be properly balanced with brackets.