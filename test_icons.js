const { FontAwesome6 } = require('@expo/vector-icons');
const icons = ['instagram', 'tiktok', 'youtube', 'reddit-alien', 'reddit', 'user-group', 'google', 'apple', 'podcast'];
for (const icon of icons) {
  try {
    const hasIcon = FontAwesome6.glyphMap[icon] !== undefined;
    console.log(icon, hasIcon ? 'EXISTS' : 'MISSING');
  } catch (e) {
    console.log('Error checking', icon);
  }
}
