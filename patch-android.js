// Ajoute au projet Android les autorisations nécessaires aux rappels.
const fs = require('fs');
const path = 'android/app/src/main/AndroidManifest.xml';
let xml = fs.readFileSync(path, 'utf8');
const perms = [
  'android.permission.POST_NOTIFICATIONS',
  'android.permission.SCHEDULE_EXACT_ALARM',
  'android.permission.RECEIVE_BOOT_COMPLETED',
  'android.permission.VIBRATE',
  'android.permission.WAKE_LOCK'
];
const missing = perms.filter(p => !xml.includes(`"${p}"`));
if (missing.length) {
  const lines = missing.map(p => `    <uses-permission android:name="${p}" />`).join('\n');
  xml = xml.replace('</manifest>', lines + '\n</manifest>');
  fs.writeFileSync(path, xml);
}
console.log('Autorisations ajoutées :', missing.length ? missing.join(', ') : 'déjà présentes');
