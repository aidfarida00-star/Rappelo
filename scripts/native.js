/* Rappello — couche native Android (Capacitor)
   Programme de vraies notifications système qui sonnent même téléphone verrouillé.
   Sur un simple navigateur, ce fichier ne fait rien. */
(function () {
  const Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;
  const LN = Cap.Plugins && Cap.Plugins.LocalNotifications;
  if (!LN) return;

  const DAYS_AHEAD = 7;                 // on programme les 7 prochains jours
  const KINDS = { main: 0, leave: 1, snooze: 2 };

  function baseHash(id) {
    let h = 0;
    for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) | 0;
    return Math.abs(h) % 100000;
  }
  const nid = (id, kind, day) => baseHash(id) * 100 + day * 4 + KINDS[kind] + 1;

  function dayStart(offset) { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + offset); return d; }
  // heure locale exacte, même les jours de changement d'heure
  const atMin = (d0, min) => new Date(d0.getFullYear(), d0.getMonth(), d0.getDate(), 0, min);
  function dateFromKey(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); }

  function buildList() {
    const now = Date.now(), out = [];
    const push = (it, kind, at, day) => {
      if (at.getTime() <= now + 5000) return;
      out.push({
        id: nid(it.id, kind, day),
        title: kind === 'leave' ? t('leaveNow') : t(it.type) + ' · ' + fmtTime(it.time),
        body: phrase({ it, kind: kind === 'leave' ? 'leave' : 'main' }),
        schedule: { at, allowWhileIdle: true },
        channelId: 'rappels',
        actionTypeId: 'RAPPEL',
        extra: { id: it.id, kind: kind === 'leave' ? 'leave' : 'main' }
      });
    };
    for (const it of state.items) {
      const days = it.repeat === 'daily'
        ? Array.from({ length: DAYS_AHEAD }, (_, i) => [i, dayStart(i)])
        : [[0, dateFromKey(it.date || todayKey())]];
      for (const [i, d0] of days) {
        if (i === 0 && isDone(it)) continue;
        const main = atMin(d0, alertMin(it));
        push(it, 'main', main, i);
        const lm = leaveMin(it);
        if (lm != null && lm !== alertMin(it)) push(it, 'leave', atMin(d0, lm), i);
      }
      if (it.snooze && !isDone(it)) push(it, 'snooze', new Date(it.snooze), 0);
    }
    return out;
  }

  let lastSig = '', timer = null;
  async function scheduleAll() {
    try {
      const list = buildList();
      const sig = JSON.stringify(list.map(n => [n.id, n.schedule.at.getTime(), n.body, n.title]));
      if (sig === lastSig) return;
      lastSig = sig;
      const pending = await LN.getPending();
      if (pending.notifications && pending.notifications.length) {
        await LN.cancel({ notifications: pending.notifications.map(n => ({ id: n.id })) });
      }
      if (list.length) await LN.schedule({ notifications: list });
    } catch (e) { console.warn('Programmation des rappels impossible', e); }
  }
  const later = () => { clearTimeout(timer); timer = setTimeout(scheduleAll, 800); };

  // Chaque enregistrement reprogramme les notifications
  const origSave = window.save;
  window.save = function () { origSave(); later(); };

  async function registerTypes() {
    try {
      await LN.registerActionTypes({ types: [{ id: 'RAPPEL', actions: [
        { id: 'done', title: t('done') },
        { id: 'snooze', title: t('snooze') }
      ] }] });
    } catch (e) {}
  }

  async function init() {
    try { await LN.requestPermissions(); } catch (e) {}
    try {
      await LN.createChannel({ id: 'rappels', name: 'Rappels', description: 'Médicaments, rendez-vous et tâches',
        importance: 5, visibility: 1, vibration: true, lights: true, lightColor: '#4F46E5' });
    } catch (e) {}
    try {
      // Android 12+ : autoriser les alarmes exactes pour sonner à l'heure pile
      if (LN.checkExactNotificationSetting) {
        const s = await LN.checkExactNotificationSetting();
        if (s && s.exact_alarm && s.exact_alarm !== 'granted' && LN.changeExactNotificationSetting) {
          await LN.changeExactNotificationSetting();
        }
      }
    } catch (e) {}
    await registerTypes();

    // Notification reçue pendant que l'application est ouverte : écran d'alerte
    LN.addListener('localNotificationReceived', n => {
      const ex = n.extra || {}, it = state.items.find(i => i.id === ex.id);
      if (!it) return;
      state.fired[fkey(it, ex.kind)] = true;
      fire(it, ex.kind);
    });
    // Bouton touché sur la notification (même téléphone verrouillé)
    LN.addListener('localNotificationActionPerformed', ev => {
      const ex = (ev.notification && ev.notification.extra) || {}, it = state.items.find(i => i.id === ex.id);
      if (!it) return;
      if (ev.actionId === 'done') { setDone(it, true); save(); render(); }
      else if (ev.actionId === 'snooze') { it.snooze = Date.now() + 10 * 60000; save(); render(); }
      else { unlockAudio(); state.fired[fkey(it, ex.kind)] = true; fire(it, ex.kind); } // ouverture : voix du proche
    });

    // Langue changée : met à jour les boutons des notifications
    document.querySelectorAll('.langs button').forEach(b => b.addEventListener('click', () => { registerTypes(); later(); }));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { render(); later(); } });

    scheduleAll();
  }
  init();
})();
