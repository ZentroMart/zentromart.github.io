/**
 * ZentroMart — Live Visitor Statistics System Configuration
 * 
 * -----------------------------------------------------------------------------------
 * ARCHITECTURE & MODES:
 * 
 * 1. Zero-Setup Mode (Default):
 *    - Out-of-the-box persistent traffic tracking using CountAPI
 *      (https://countapi.mileshilliard.com/api/v1).
 *    - Deduplicated Total Unique Visitors via anonymous browser UUID in localStorage.
 *    - Automatic Daily Unique Visitors reset at 00:00:00 PKT (Pakistan Standard Time, UTC+5).
 *    - Live 10-seconds activity window local session presence sync across open tabs.
 *    - Requires ZERO API keys, ZERO account registrations, and ZERO backend servers.
 * 
 * 2. Firebase Realtime Database Mode (Optional Free Tier):
 *    - For true multi-device, multi-user WebSocket live presence synchronization.
 *    - To enable:
 *        a) Set `mode: 'firebase'` below.
 *        b) Set `firebase.enabled: true`.
 *        c) Paste your free Firebase Web App credentials into `firebase.config`.
 * -----------------------------------------------------------------------------------
 */

const VisitorCounterConfig = {
  // Tracking Mode: 'countapi' (Zero-Setup, Default) or 'firebase' (Realtime Database)
  mode: 'countapi',

  // ---------------------------------------------------------------------------------
  // 1. Zero-Setup Mode (CountAPI)
  // ---------------------------------------------------------------------------------
  countapi: {
    // Miles Hilliard CountAPI Endpoint
    apiBaseUrl: 'https://countapi.mileshilliard.com/api/v1',

    // Key namespace prefix to prevent collision with other applications
    namespace: 'zentromart_pk_wholesale',

    // Dedicated metric keys
    keys: {
      // Metric 1: Total all-time deduplicated unique visitors
      totalVisitors: 'zm_total_unique_visitors',

      // Metric 2: Today's unique visitors prefix (auto-suffixed with YYYY-MM-DD in PKT)
      todayVisitorsPrefix: 'zm_daily_unique_',

      // Metric 4: Total catalog page views
      totalPageViews: 'zm_catalog_pageviews_all'
    },

    // Optional initial seed offsets (can be 0 for pure raw counter or adjusted if migrating traffic)
    offsets: {
      totalVisitors: 0,
      todayVisitors: 0,
      totalPageViews: 0
    }
  },

  // ---------------------------------------------------------------------------------
  // 2. Firebase Realtime Database Mode (Optional Free Tier)
  // ---------------------------------------------------------------------------------
  firebase: {
    enabled: false,

    // Paste your Google Firebase Web App configuration below:
    config: {
      apiKey: "PASTE_YOUR_FIREBASE_API_KEY_HERE",
      authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
      databaseURL: "https://PASTE_YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
      projectId: "PASTE_YOUR_PROJECT_ID",
      storageBucket: "PASTE_YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID",
      appId: "PASTE_YOUR_APP_ID"
    },

    // Realtime Database paths
    paths: {
      presence: 'zentromart/presence',     // Active online clients
      metrics: 'zentromart/metrics'        // Aggregated store stats
    }
  },

  // ---------------------------------------------------------------------------------
  // 3. Activity Window & Timezone Settings
  // ---------------------------------------------------------------------------------
  activity: {
    // Activity window for currently active visitors (strictly 10 seconds per requirements)
    windowSeconds: 10,

    // Heartbeat interval (milliseconds) to keep presence fresh within the 10s window
    heartbeatIntervalMs: 3500,

    // Periodic stats refresh interval (milliseconds)
    refreshIntervalMs: 15000,

    // Target Timezone: Pakistan Standard Time (PKT, UTC+5)
    timeZone: 'Asia/Karachi',
    pktUtcOffsetHours: 5
  },

  // ---------------------------------------------------------------------------------
  // 4. UI & Display Preferences
  // ---------------------------------------------------------------------------------
  ui: {
    containerId: 'live-visitor-stats',
    autoInjectIfMissing: true,
    animateCounters: true,
    showPktClock: true,
    showModeBadge: true
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.VisitorCounterConfig = VisitorCounterConfig;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = VisitorCounterConfig;
}
