// ============================================
// EmlakStüdyom - Canlı Varlık / Ziyaretçi Takip Motoru
// js/presence.js
// ============================================

(function() {
    'use strict';

    let presenceChannel = null;
    let presenceCallbacks = [];

    function initPresence() {
        if (!window.supabaseClient) return;

        try {
            const path = window.location.pathname;
            let pageName = 'index';
            if (path.includes('app.html')) pageName = 'app';
            else if (path.includes('admin.html')) pageName = 'admin';

            const isMobile = window.innerWidth <= 768;
            const userEmail = window.CURRENT_USER?.email || 'Misafir Ziyaretçi';
            const userId = window.CURRENT_USER?.id || 'anon_' + Math.random().toString(36).substring(2, 9);

            presenceChannel = window.supabaseClient.channel('estudio-presence', {
                config: {
                    presence: {
                        key: userId
                    }
                }
            });

            presenceChannel
                .on('presence', { event: 'sync' }, () => {
                    const state = presenceChannel.presenceState();
                    const stats = calculatePresenceStats(state);
                    presenceCallbacks.forEach(cb => {
                        try { cb(stats, state); } catch(e) { console.error('Presence callback error:', e); }
                    });
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await presenceChannel.track({
                            user_id: userId,
                            email: userEmail,
                            page: pageName,
                            device: isMobile ? 'mobile' : 'desktop',
                            online_at: new Date().toISOString()
                        });
                    }
                });

        } catch (e) {
            console.warn('Realtime Presence başlatılamadı:', e);
        }
    }

    function calculatePresenceStats(state) {
        let total = 0;
        let mobile = 0;
        let desktop = 0;
        let app = 0;
        let index = 0;
        let admin = 0;
        let activeList = [];

        Object.keys(state).forEach(key => {
            const presences = state[key];
            if (Array.isArray(presences)) {
                presences.forEach(p => {
                    total++;
                    if (p.device === 'mobile') mobile++; else desktop++;
                    if (p.page === 'app') app++;
                    else if (p.page === 'admin') admin++;
                    else index++;

                    activeList.push(p);
                });
            }
        });

        return {
            total,
            mobile,
            desktop,
            app,
            index,
            admin,
            activeList
        };
    }

    function onPresenceChange(cb) {
        if (typeof cb === 'function') {
            presenceCallbacks.push(cb);
            if (presenceChannel) {
                const state = presenceChannel.presenceState();
                cb(calculatePresenceStats(state), state);
            }
        }
    }

    window.PresenceManager = {
        initPresence,
        onPresenceChange
    };

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initPresence, 500);
    });

    console.log('✅ PresenceManager yüklendi');
})();
