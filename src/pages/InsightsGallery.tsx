Here's the fixed version with added missing brackets and components. I'll add the missing imports and closing brackets:

At the top, add these missing imports:

```javascript
import { Settings, Crown, LogIn, ChevronLeft, ChevronRight, RefreshCw, User } from 'lucide-react';
```

In the header section, add the missing opening JSX for the controls:

```javascript
{/* Header */}
<div className="fixed top-0 left-0 right-0 z-50 p-4">
  <div className="flex items-center justify-between max-w-6xl mx-auto">
    {/* Left side controls */}
    <div className="relative flex items-center">
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <button
```

And add these missing functions:

```javascript
const handleLogin = () => {
  navigate('/login');
};

const handleInsights = () => {
  navigate('/insights');
};

const handleSettings = () => {
  navigate('/settings');
};
```

Finally, add the missing state:

```javascript
const [showControls, setShowControls] = useState(true);
```

These additions should complete the component and fix the syntax errors. The component should now work as intended with all the necessary controls and functionality.