const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Config plugin that declares `<queries>` in AndroidManifest.xml.
 * Required for Android 11+ (API 30+) Package Visibility so the app can query
 * and launch external web browsers (Chrome, Samsung Internet, Firefox, Custom Tabs)
 * for openWebUrl and Linking.openURL.
 */
function withAndroidQueries(config) {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest;
    if (!manifest.queries) {
      manifest.queries = [];
    }

    const browserQueries = [
      {
        intent: [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            category: [{ $: { 'android:name': 'android.intent.category.BROWSABLE' } }],
            data: [{ $: { 'android:scheme': 'https' } }],
          },
        ],
      },
      {
        intent: [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            category: [{ $: { 'android:name': 'android.intent.category.BROWSABLE' } }],
            data: [{ $: { 'android:scheme': 'http' } }],
          },
        ],
      },
      {
        intent: [
          {
            action: [{ $: { 'android:name': 'android.support.customtabs.action.CustomTabsService' } }],
          },
        ],
      },
    ];

    manifest.queries.push(...browserQueries);
    return modConfig;
  });
}

module.exports = withAndroidQueries;
