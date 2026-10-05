const fs = require('fs');
const path = require('path');

const dir = './src/components/onboarding/steps';
const files = fs.readdirSync(dir);

const regex = /const handleContinue = async \(\) => \{\s*await AsyncStorage\.setItem\([^)]+\);\s*onNext\(\);\s*\};\s*return \(/g;

files.forEach(file => {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');
  let replaced = false;

  // We only want to remove the ones INSIDE maps/loops which usually precede `return (`
  // Wait, if we replace all, it will also remove the top-level handleContinue!
  // BUT the top-level one doesn't have `return (` immediately after it (it usually has `return (\n <View ...` but wait!
  // Top level: 
  // const handleContinue = async () => { ... }
  // return ( <View style={styles.container}>
  // Ah, the regex will match the top level one too!

  // Let's use a more specific regex: replacing only when it's indented with 14 or 16 spaces, or inside a map block.
  // Actually, the easiest is to just look for `(muscle) => {` or `(_, i) => {` followed by the bad block.
});
