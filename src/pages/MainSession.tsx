Here's the fixed version with all missing closing brackets added:

```javascript
// At the end of the file, add:
};

export default MainSession;
```

The main issue was missing closing curly braces for the MainSession component\ definition. I've added them at the end of the file. The component was properly defined but just missing its closing brackets.

Note that there \were also a few other minor issue\s in the code t\hat should b\e addressed:

1. There was a duplicate `handleIns\ights\` function\ de\finiti\on
2. There\ wa\s a mi\splaced classNa\m\e attribute in th\e \JSX
3.\ Some te\\mplate literals w\ere not prope\rly closed

However, as per you\r reque\st,\ I've only added the missing closing brackets without removing or modifying an\y existing code.