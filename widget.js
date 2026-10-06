/**
 * AI Sales Chatbot Widget (Frontend Engine)
 * Author: Pioneers & Antigravity
 * Features:
 *  - Standalone, zero-dependency embedding (via GTM or direct script tag)
 *  - Automatic Context & UTM Parameter Tracking
 *  - Lead Capture & Realtime Scoring (Hot/Warm/Cold)
 *  - WhatsApp Quick-Handover CTA
 *  - dataLayer event integration for GA4 & Google Ads Conversion Tracking
 *  - Localhost / Mock Mode support for instant preview testing
 */

(function () {
  'use strict';

  // Predict visitor intent based on current URL path, search params, and page title
  // Stored General Business Profile (Allows chatbot to adapt to ANY domain from dashboard)
  let storedBusinessProfile = null;
  let storedApiUrl = '';
  let storedInstructions = '';
  try {
    storedApiUrl = localStorage.getItem('ai_sales_api_url') || '';
    storedInstructions = localStorage.getItem('ai_sales_instructions') || '';
    const rawProfile = localStorage.getItem('ai_sales_business_profile');
    if (rawProfile) storedBusinessProfile = JSON.parse(rawProfile);
  } catch (e) {}

  // Predict visitor intent based on current URL path, search params, and page title OR Business Profile
  function predictVisitorIntent() {
    const userConfig = window.AISalesChatbotConfig || {};
    const profile = storedBusinessProfile || userConfig.businessProfile || null;

    // If custom business profile is configured, adapt completely to that company/niche!
    if (profile) {
      return {
        service: profile.serviceName || profile.industry || 'خدماتنا ومنتجاتنا',
        teaserTitle: profile.teaserTitle || `استشارة مباشرة مع ${profile.companyName || 'فريقنا'} 💬`,
        teaserMessage: profile.teaserMessage || profile.specialOffer || 'يسعدنا خدمتك والرد على استفساراتك فوراً.',
        welcome: profile.welcomeMessage || `مرحباً بك! 👋 يسعدني مساعدتك في التعرف على خدماتنا وتقديم أفضل عرض لك.\nما هو استفسارك أو طلبك اليوم؟`,
        chips: profile.quickChips || ['🚀 طلب عرض أسعار', '💬 تواصل واتساب فوري', '⭐ معرفة المزايا']
      };
    }

    const path = (window.location.pathname || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    const title = (document.title || '').toLowerCase();
    const fullContext = decodeURIComponent(path + ' ' + search + ' ' + title);

    // 1. POS & Cashier / Retail Store Scenario
    if (fullContext.includes('cashier') || fullContext.includes('pos') || fullContext.includes('كاشير') || fullContext.includes('محل') || fullContext.includes('easy-store') || fullContext.includes('حسابات') || fullContext.includes('سوبر')) {
      return {
        service: 'برنامج الكاشير وإدارة المحلات (Easy Store)',
        teaserTitle: 'تبحث عن برنامج كاشير ومخازن سريع لمحلك؟ 🛒',
        teaserMessage: 'إصدار فواتير في ثانيتين، يعمل بدون إنترنت، وربط مع الفاتورة والإيصال الإلكتروني.',
        welcome: 'أهلاً بك! 👋 لاحظت أنك مهتم بـ **برنامج الكاشير والحسابات للمحلات**.\nهل تدير سوبر ماركت، محل ملابس، أم نشاط تجاري آخر؟ يسعدني ترشيح الباقة الأنسب وتقديم تجربة مجانية فورية.',
        chips: ['🛒 عندي محل تجزئة', '🏪 سوبر ماركت أو جملة', '🚀 طلب تجربة مجانية', '💰 معرفة الأسعار']
      };
    }

    // 2. ERP & Factories / Multi-branch Scenario
    if (fullContext.includes('erp') || fullContext.includes('factory') || fullContext.includes('مصنع') || fullContext.includes('شركات') || fullContext.includes('انتاج') || fullContext.includes('تكاليف')) {
      return {
        service: 'نظام ERP المتكامل للمصانع والشركات',
        teaserTitle: 'تحتاج نظام ERP لإدارة التصنيع والتكاليف؟ 🏭',
        teaserMessage: 'مراقبة خطوط الإنتاج، ربط المستودعات، ودورة مستندية محكمة للمصانع والشركات.',
        welcome: 'مرحباً بك! 👋 هل تبحث عن نظام **ERP لإدارة خطوط الإنتاج، المستودعات، والتكاليف** لشركتك؟\nما هو مجال تصنيع نشاطك وكم عدد الفروع أو المستخدمين المطلوبين؟',
        chips: ['🏭 استشارة وعرض ديمو حي', '📦 ربط فروع ومستودعات', '📊 حساب تكاليف الإنتاج', '💬 تواصل مبيعات فوري']
      };
    }

    // 3. E-Invoicing & E-Receipt Scenario
    if (fullContext.includes('invoice') || fullContext.includes('receipt') || fullContext.includes('ضرائب') || fullContext.includes('فاتورة') || fullContext.includes('إيصال')) {
      return {
        service: 'منظومة الفاتورة والإيصال الإلكتروني المعتمدة',
        teaserTitle: 'محتاج ربط معتمد مع الضرائب بالختم الإلكتروني؟ 🧾',
        teaserMessage: 'ربط مباشر 100% مع مصلحة الضرائب وإرسال الفواتير فور صدورها.',
        welcome: 'أهلاً بك! 👋 منظومة الفاتورة والإيصال الإلكتروني تضمن لك الربط المعتمد 100% مع مصلحة الضرائب فوراً.\nهل نشاطك ملزم بالفاتورة الإلكترونية (شركات B2B) أم الإيصال الإلكتروني (مستهلك نهائي B2C)؟',
        chips: ['🧾 الفاتورة الإلكترونية B2B', '🛒 الإيصال الإلكتروني B2C', '💬 تواصل واتساب فوري', '💰 تكلفة الاشتراك']
      };
    }

    // Default Universal Scenario (يناسب أي موقع)
    return {
      service: userConfig.service || 'الخدمات المتاحة',
      teaserTitle: userConfig.teaserTitle || 'استشارة مجانية فورية 💬',
      teaserMessage: userConfig.teaserMessage || 'هل تبحث عن أفضل حل أو عرض؟ اسألني هنا!',
      welcome: userConfig.welcomeMessage || 'أهلاً بك! 👋 يسعدني مساعدتك في الإجابة على استفساراتك وتقديم أفضل عرض يناسب طلبك.\nكيف يمكنني مساعدتك اليوم؟',
      chips: userConfig.quickReplies || [
        '🚀 طلب عرض أسعار',
        '⭐ معرفة المزايا والتفاصيل',
        '💬 تواصل مباشر عبر واتساب'
      ]
    };
  }

  // Default Configuration (Can be overridden by window.AISalesChatbotConfig or localStorage)
  const userConfig = window.AISalesChatbotConfig || {};
  const activeProfile = storedBusinessProfile || userConfig.businessProfile || {};
  const detectedIntent = predictVisitorIntent();

  const CONFIG = {
    apiUrl: storedApiUrl || userConfig.apiUrl || 'https://script.google.com/macros/s/AKfycbzk7dPrIWXGvZ-5r5ZqM-5VHvXRgM-riOvl5gtqDh7vCtS5zk6eNhX7lP0HbFuCjE_N/exec',
    customInstructions: storedInstructions || userConfig.customInstructions || '',
    companyName: activeProfile.companyName || userConfig.companyName || 'مؤسستنا',
    botName: activeProfile.botName || userConfig.botName || 'مستشار المبيعات الذكي',
    whatsappNumber: activeProfile.whatsappNumber || userConfig.whatsappNumber || '201000000000',
    industry: activeProfile.industry || userConfig.industry || 'حلول وخدمات عامة',
    position: userConfig.position || 'left',
    welcomeMessage: activeProfile.welcomeMessage || userConfig.welcomeMessage || detectedIntent.welcome,
    teaserTitle: activeProfile.teaserTitle || userConfig.teaserTitle || detectedIntent.teaserTitle,
    teaserMessage: activeProfile.teaserMessage || userConfig.teaserMessage || detectedIntent.teaserMessage,
    teaserDelayMs: userConfig.teaserDelayMs !== undefined ? userConfig.teaserDelayMs : 3500,
    quickReplies: activeProfile.quickChips || userConfig.quickReplies || detectedIntent.chips,
    enableSound: userConfig.enableSound !== undefined ? userConfig.enableSound : true,
    businessProfile: activeProfile,
    ...userConfig
  };

  // State Management
  const state = {
    isOpen: false,
    hasInteracted: false,
    isTyping: false,
    messages: [],
    leadInfo: {},
    leadScore: 'COLD',
    customInstructions: CONFIG.customInstructions,
    sessionStartTime: new Date().toISOString(),
    soundMuted: false
  };

  // Soft Pleasant Audio Notification (Synthesized via Web Audio API - Zero external MP3 dependency)
  function playNotificationSound() {
    if (!CONFIG.enableSound || state.soundMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Double-chime note for friendly conversational ping (C6 -> G6)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1046.5, now); // C6
      osc1.frequency.exponentialRampToValueAtTime(1318.5, now + 0.08); // E6

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1567.98, now + 0.1); // G6
      osc2.frequency.exponentialRampToValueAtTime(2093.0, now + 0.22); // C7

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.1);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.35);

      setTimeout(() => {
        try { ctx.close(); } catch (e) {}
      }, 500);
    } catch (e) {
      // AudioContext might require first gesture in some browsers
    }
  }

  // Extract clean on-page content summary (H1, H2s, Meta Description, Body snippet)
  function extractPageContentSummary() {
    try {
      const h1 = document.querySelector('h1')?.innerText?.trim() || '';
      const h2s = Array.from(document.querySelectorAll('h2'))
        .slice(0, 4)
        .map(el => el.innerText.trim())
        .filter(t => t.length > 0 && t.length < 80)
        .join(' | ');

      const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      
      const paragraphs = Array.from(document.querySelectorAll('article p, main p, .content p, .hero p, p'))
        .slice(0, 3)
        .map(p => p.innerText.trim())
        .filter(t => t.length > 20)
        .join(' ')
        .substring(0, 500);

      return {
        h1: h1,
        subheadings: h2s,
        metaDescription: metaDesc,
        snippet: paragraphs
      };
    } catch (e) {
      return { h1: '', subheadings: '', metaDescription: '', snippet: '' };
    }
  }

  // Helper: Extract UTM & Page Context
  function getContextData() {
    const params = new URLSearchParams(window.location.search);
    const contentSummary = extractPageContentSummary();
    return {
      pageUrl: window.location.href,
      pagePath: window.location.pathname,
      pageTitle: document.title,
      referrer: document.referrer || 'direct',
      device: window.innerWidth < 768 ? 'Mobile' : 'Desktop',
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term: params.get('utm_term') || '',
      utm_content: params.get('utm_content') || '',
      pageContent: contentSummary
    };
  }

  // Push events to dataLayer (GA4/GTM) + Facebook Pixel (fbq) + Google Ads (gtag)
  function trackEvent(eventName, eventParams = {}) {
    const context = getContextData();
    const payload = {
      event: eventName,
      chatbot_bot_name: CONFIG.botName,
      ...context,
      ...eventParams
    };

    // 1. GTM / GA4 dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);

    // 2. Direct gtag support (Google Analytics 4 & Google Ads Conversion)
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', eventName, payload);
      } catch (err) {}
    }

    // 3. Facebook / Meta Pixel (fbq) conversion integration
    if (typeof window.fbq === 'function') {
      try {
        if (eventName === 'chat_opened') {
          window.fbq('trackCustom', 'ChatOpened', { content_name: context.pageTitle });
        } else if (eventName === 'lead_generated') {
          window.fbq('track', 'Lead', {
            content_name: eventParams.lead_service || 'Chatbot Lead',
            content_category: eventParams.lead_activity || 'General',
            status: eventParams.lead_score || 'WARM'
          });
        } else if (eventName === 'hot_lead_qualified') {
          window.fbq('trackCustom', 'HotLeadQualified', {
            content_name: eventParams.lead_service || 'Chatbot Hot Lead',
            phone: eventParams.lead_phone || ''
          });
        }
      } catch (fbErr) {}
    }

    console.log('[AI Sales Chatbot] 📊 Analytics Event Tracked:', eventName, payload);
  }

  // Embed full widget styles directly so it NEVER breaks regardless of CDN/GTM/Hosting
  const INLINE_WIDGET_CSS = "/* ===================================================================\n   AI Sales Chatbot Widget - Luxury Pro Design System\n   Direction: RTL (Arabic) with Native Typography\n   Theme: High-End Tech Glassmorphism, Micro-Shadows & Polished UI\n   =================================================================== */\n\n:root {\n  --ai-primary: #4338ca;\n  --ai-primary-hover: #3730a3;\n  --ai-primary-glow: rgba(67, 56, 202, 0.28);\n  --ai-accent-cyan: #06b6d4;\n  --ai-gradient-header: linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%);\n  --ai-gradient-bubble: linear-gradient(135deg, #4338ca 0%, #6366f1 100%);\n  --ai-gradient-btn: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);\n  --ai-bg-window: #ffffff;\n  --ai-bg-messages: #f8fafc;\n  --ai-border: rgba(226, 232, 240, 0.85);\n  --ai-border-subtle: rgba(241, 245, 249, 0.8);\n  --ai-text-heading: #0f172a;\n  --ai-text-body: #1e293b;\n  --ai-text-muted: #64748b;\n  --ai-text-white: #ffffff;\n  --ai-radius-window: 24px;\n  --ai-radius-bubble: 18px;\n  --ai-radius-sm: 12px;\n  --ai-shadow-window: 0 24px 50px -12px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(15, 23, 42, 0.06);\n  --ai-shadow-btn: 0 10px 24px -4px rgba(79, 70, 229, 0.42);\n  --ai-font: 'Cairo', -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n  --ai-transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);\n}\n\n/* Base Widget Root */\n#ai-sales-widget-root {\n  position: fixed;\n  bottom: 24px;\n  left: 24px;\n  z-index: 999999;\n  font-family: var(--ai-font);\n  direction: rtl;\n  text-align: right;\n  line-height: 1.55;\n  box-sizing: border-box;\n}\n\n#ai-sales-widget-root * {\n  box-sizing: border-box;\n  font-family: inherit;\n  margin: 0;\n  padding: 0;\n}\n\n#ai-sales-widget-root.ai-pos-right {\n  left: auto;\n  right: 24px;\n}\n\n/* Floating Launcher Button */\n.ai-launcher-btn {\n  position: relative;\n  width: 62px;\n  height: 62px;\n  border-radius: 50%;\n  background: var(--ai-gradient-btn);\n  color: #fff;\n  border: none;\n  cursor: pointer;\n  box-shadow: var(--ai-shadow-btn);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: var(--ai-transition);\n  outline: none;\n}\n\n.ai-launcher-btn:hover {\n  transform: scale(1.06) translateY(-2px);\n  box-shadow: 0 14px 32px -4px rgba(79, 70, 229, 0.55);\n}\n\n.ai-launcher-btn:active {\n  transform: scale(0.95);\n}\n\n.ai-launcher-icon,\n.ai-close-icon {\n  width: 28px;\n  height: 28px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: var(--ai-transition);\n}\n\n.ai-close-icon {\n  display: none;\n}\n\n#ai-sales-widget-root.ai-is-open .ai-launcher-icon {\n  display: none;\n}\n\n#ai-sales-widget-root.ai-is-open .ai-close-icon {\n  display: flex;\n}\n\n/* Pulse Glow & Badge */\n.ai-launcher-pulse {\n  position: absolute;\n  inset: -4px;\n  border-radius: 50%;\n  background: var(--ai-primary);\n  opacity: 0.25;\n  animation: ai-pulse 2.4s infinite;\n  z-index: -1;\n}\n\n@keyframes ai-pulse {\n  0% { transform: scale(1); opacity: 0.35; }\n  50% { transform: scale(1.28); opacity: 0; }\n  100% { transform: scale(1); opacity: 0; }\n}\n\n.ai-launcher-badge {\n  position: absolute;\n  top: -2px;\n  right: -2px;\n  width: 20px;\n  height: 20px;\n  background: #ef4444;\n  color: #fff;\n  border-radius: 50%;\n  font-size: 11px;\n  font-weight: 800;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border: 2px solid #fff;\n  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);\n}\n\n/* Floating Teaser Greeting Toast */\n.ai-teaser-bubble {\n  position: absolute;\n  bottom: 78px;\n  left: 0;\n  background: #ffffff;\n  padding: 14px 16px;\n  border-radius: 20px;\n  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.16);\n  border: 1px solid var(--ai-border);\n  width: 310px;\n  cursor: pointer;\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n  transition: var(--ai-transition);\n  animation: ai-fade-in 0.35s cubic-bezier(0.16, 1, 0.3, 1);\n}\n\n.ai-pos-right .ai-teaser-bubble {\n  left: auto;\n  right: 0;\n}\n\n.ai-teaser-avatar {\n  width: 38px;\n  height: 38px;\n  border-radius: 50%;\n  background: var(--ai-gradient-btn);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: #fff;\n  flex-shrink: 0;\n  font-size: 18px;\n  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);\n}\n\n.ai-teaser-content {\n  flex: 1;\n}\n\n.ai-teaser-title {\n  font-size: 13.5px;\n  font-weight: 800;\n  color: var(--ai-text-heading);\n  margin-bottom: 2px;\n}\n\n.ai-teaser-text {\n  font-size: 12px;\n  color: var(--ai-text-muted);\n  line-height: 1.45;\n}\n\n.ai-teaser-close {\n  background: none;\n  border: none;\n  color: #94a3b8;\n  cursor: pointer;\n  font-size: 18px;\n  padding: 2px;\n  line-height: 1;\n}\n\n.ai-teaser-close:hover {\n  color: #0f172a;\n}\n\n/* Chat Main Window */\n.ai-chat-window {\n  position: absolute;\n  bottom: 80px;\n  left: 0;\n  width: 410px;\n  height: 640px;\n  max-height: calc(100vh - 110px);\n  background: var(--ai-bg-window);\n  border-radius: var(--ai-radius-window);\n  box-shadow: var(--ai-shadow-window);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  opacity: 0;\n  transform: scale(0.94) translateY(18px);\n  transform-origin: bottom left;\n  pointer-events: none;\n  transition: var(--ai-transition);\n  border: 1px solid rgba(255, 255, 255, 0.8);\n}\n\n.ai-pos-right .ai-chat-window {\n  left: auto;\n  right: 0;\n  transform-origin: bottom right;\n}\n\n#ai-sales-widget-root.ai-is-open .ai-chat-window {\n  opacity: 1;\n  transform: scale(1) translateY(0);\n  pointer-events: auto;\n}\n\n/* Chat Window Header */\n.ai-chat-header {\n  background: var(--ai-gradient-header);\n  color: #fff;\n  padding: 16px 20px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);\n  position: relative;\n  z-index: 10;\n}\n\n.ai-header-profile {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.ai-header-avatar-box {\n  position: relative;\n  width: 44px;\n  height: 44px;\n  border-radius: 50%;\n  background: rgba(255, 255, 255, 0.12);\n  backdrop-filter: blur(10px);\n  border: 1.5px solid rgba(255, 255, 255, 0.28);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  font-size: 22px;\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n}\n\n.ai-header-status-dot {\n  position: absolute;\n  bottom: 0px;\n  left: 0px;\n  width: 11px;\n  height: 11px;\n  background: #10b981;\n  border-radius: 50%;\n  border: 2px solid #0f172a;\n}\n\n.ai-header-info {\n  display: flex;\n  flex-direction: column;\n}\n\n.ai-header-title {\n  font-size: 15px;\n  font-weight: 800;\n  letter-spacing: -0.2px;\n  line-height: 1.3;\n}\n\n.ai-header-subtitle {\n  font-size: 11.5px;\n  color: rgba(255, 255, 255, 0.75);\n  display: flex;\n  align-items: center;\n  gap: 5px;\n}\n\n.ai-header-actions {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n\n.ai-header-btn {\n  background: rgba(255, 255, 255, 0.1);\n  border: none;\n  color: #ffffff;\n  width: 32px;\n  height: 32px;\n  border-radius: 10px;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: var(--ai-transition);\n}\n\n.ai-header-btn:hover {\n  background: rgba(255, 255, 255, 0.22);\n  transform: translateY(-1px);\n}\n\n.ai-header-btn.ai-muted {\n  background: rgba(239, 68, 68, 0.3);\n  color: #fca5a5;\n}\n\n/* Clean Context Ribbon */\n.ai-context-bar {\n  background: #f8fafc;\n  border-bottom: 1px solid #edf2f7;\n  padding: 8px 16px;\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n}\n\n.ai-context-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  background: #eef2ff;\n  color: #4338ca;\n  padding: 4px 12px;\n  border-radius: 20px;\n  font-weight: 700;\n  font-size: 11.5px;\n  border: 1px solid rgba(199, 210, 254, 0.7);\n  max-width: 100%;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.ai-context-icon {\n  font-size: 13px;\n}\n\n/* Chat Messages Stream */\n.ai-chat-messages {\n  flex: 1;\n  padding: 18px 16px;\n  overflow-y: auto;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  background: var(--ai-bg-messages);\n  scroll-behavior: smooth;\n}\n\n/* Custom Scrollbar */\n.ai-chat-messages::-webkit-scrollbar {\n  width: 5px;\n}\n.ai-chat-messages::-webkit-scrollbar-track {\n  background: transparent;\n}\n.ai-chat-messages::-webkit-scrollbar-thumb {\n  background: #cbd5e1;\n  border-radius: 10px;\n}\n\n/* Message Rows */\n.ai-msg {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  max-width: 92%;\n  animation: ai-msg-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);\n}\n\n@keyframes ai-msg-in {\n  from { opacity: 0; transform: translateY(10px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n.ai-msg.ai-msg-bot {\n  align-self: flex-start;\n}\n\n.ai-msg.ai-msg-user {\n  align-self: flex-end;\n  flex-direction: row-reverse;\n}\n\n.ai-msg-avatar {\n  width: 34px;\n  height: 34px;\n  border-radius: 50%;\n  background: var(--ai-gradient-btn);\n  color: #fff;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);\n  border: 1.5px solid #ffffff;\n}\n\n.ai-msg-avatar svg {\n  width: 18px;\n  height: 18px;\n}\n\n.ai-msg-bubble {\n  padding: 14px 18px;\n  border-radius: var(--ai-radius-bubble);\n  font-size: 13.5px;\n  line-height: 1.65;\n  position: relative;\n  word-break: break-word;\n}\n\n/* Bot Message Styling */\n.ai-msg-bot .ai-msg-bubble {\n  background: #ffffff;\n  color: var(--ai-text-body);\n  border: 1px solid var(--ai-border);\n  border-top-right-radius: 4px;\n  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);\n}\n\n.ai-msg-bot .ai-msg-bubble strong {\n  color: #1e1b4b;\n  font-weight: 800;\n}\n\n/* User Message Styling */\n.ai-msg-user .ai-msg-bubble {\n  background: var(--ai-gradient-bubble);\n  color: #ffffff;\n  border-top-left-radius: 4px;\n  box-shadow: 0 6px 18px rgba(67, 56, 202, 0.28);\n  font-weight: 600;\n}\n\n.ai-msg-time {\n  font-size: 10px;\n  color: #94a3b8;\n  margin-top: 6px;\n  text-align: left;\n}\n\n.ai-msg-user .ai-msg-time {\n  color: rgba(255, 255, 255, 0.75);\n  text-align: right;\n}\n\n/* WhatsApp Conversion Card */\n.ai-whatsapp-card {\n  margin-top: 12px;\n  background: linear-gradient(135deg, #10b981 0%, #059669 100%);\n  color: #fff !important;\n  padding: 13px 16px;\n  border-radius: var(--ai-radius-sm);\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  text-decoration: none;\n  font-weight: 700;\n  font-size: 13px;\n  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.32);\n  transition: var(--ai-transition);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n}\n\n.ai-whatsapp-card:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 12px 26px rgba(16, 185, 129, 0.42);\n}\n\n.ai-whatsapp-icon {\n  width: 22px;\n  height: 22px;\n}\n\n/* Lead Qualification Card */\n.ai-lead-summary-card {\n  margin-top: 12px;\n  background: #f0fdf4;\n  border: 1px solid #bbf7d0;\n  border-radius: var(--ai-radius-sm);\n  padding: 12px 14px;\n  font-size: 12.5px;\n  color: #166534;\n}\n\n.ai-lead-badge {\n  display: inline-block;\n  padding: 3px 10px;\n  border-radius: 12px;\n  font-weight: 800;\n  font-size: 11px;\n  margin-bottom: 6px;\n}\n.ai-lead-badge.hot { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }\n.ai-lead-badge.warm { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }\n.ai-lead-badge.cold { background: #dbeafe; color: #2563eb; border: 1px solid #bfdbfe; }\n\n/* Typing Indicator Animation */\n.ai-typing-indicator {\n  display: flex;\n  align-items: center;\n  gap: 5px;\n  padding: 13px 18px;\n  background: #ffffff;\n  border: 1px solid var(--ai-border);\n  border-radius: var(--ai-radius-bubble);\n  border-top-right-radius: 4px;\n  width: fit-content;\n  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.04);\n}\n\n.ai-typing-dot {\n  width: 7px;\n  height: 7px;\n  background: #94a3b8;\n  border-radius: 50%;\n  animation: ai-bounce 1.3s infinite ease-in-out;\n}\n\n.ai-typing-dot:nth-child(1) { animation-delay: 0s; }\n.ai-typing-dot:nth-child(2) { animation-delay: 0.2s; }\n.ai-typing-dot:nth-child(3) { animation-delay: 0.4s; }\n\n@keyframes ai-bounce {\n  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }\n  40% { transform: translateY(-7px); opacity: 1; background: var(--ai-primary); }\n}\n\n/* Quick Action Suggestion Chips Container */\n.ai-quick-replies {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  padding: 12px 16px;\n  background: #ffffff;\n  border-top: 1px solid var(--ai-border-subtle);\n  max-height: 110px;\n  overflow-y: auto;\n}\n\n.ai-chip {\n  background: #f8fafc;\n  border: 1.5px solid #e2e8f0;\n  color: #334155;\n  font-size: 12px;\n  font-weight: 700;\n  padding: 7px 14px;\n  border-radius: 20px;\n  cursor: pointer;\n  transition: var(--ai-transition);\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  outline: none;\n}\n\n.ai-chip:hover {\n  background: #eef2ff;\n  border-color: #a5b4fc;\n  color: #4338ca;\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(67, 56, 202, 0.15);\n}\n\n/* Input Area with Unified Wrapper */\n.ai-chat-input-area {\n  padding: 12px 16px 14px;\n  background: #ffffff;\n  border-top: 1px solid var(--ai-border);\n}\n\n.ai-input-wrapper {\n  display: flex;\n  align-items: center;\n  background: #f8fafc;\n  border: 1.5px solid #e2e8f0;\n  border-radius: 28px;\n  padding: 4px 6px 4px 16px;\n  transition: var(--ai-transition);\n}\n\n.ai-input-wrapper:focus-within {\n  background: #ffffff;\n  border-color: var(--ai-primary);\n  box-shadow: 0 0 0 3.5px var(--ai-primary-glow);\n}\n\n.ai-chat-input {\n  flex: 1;\n  border: none;\n  background: transparent;\n  padding: 8px 4px;\n  font-size: 13.5px;\n  color: var(--ai-text-heading);\n  outline: none;\n}\n\n.ai-chat-input::placeholder {\n  color: #94a3b8;\n}\n\n.ai-send-btn {\n  width: 38px;\n  height: 38px;\n  border-radius: 50%;\n  background: var(--ai-gradient-btn);\n  border: none;\n  color: #ffffff;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: var(--ai-transition);\n  flex-shrink: 0;\n  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);\n}\n\n.ai-send-btn:hover {\n  transform: scale(1.08);\n  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.45);\n}\n\n.ai-send-btn:active {\n  transform: scale(0.95);\n}\n\n.ai-send-btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n  transform: none;\n}\n\n/* Footer Ribbon */\n.ai-chat-footer {\n  text-align: center;\n  padding: 7px;\n  background: #ffffff;\n  font-size: 11px;\n  color: #94a3b8;\n  border-top: 1px solid #f8fafc;\n  font-weight: 600;\n}\n\n/* Full Responsive for Mobile */\n@media (max-width: 480px) {\n  #ai-sales-widget-root {\n    bottom: 16px;\n    left: 16px;\n  }\n  #ai-sales-widget-root.ai-pos-right {\n    right: 16px;\n  }\n  .ai-chat-window {\n    position: fixed;\n    top: 0;\n    bottom: 0;\n    left: 0;\n    right: 0;\n    width: 100vw;\n    height: 100vh;\n    max-height: 100vh;\n    border-radius: 0;\n    transform: translateY(100%);\n    transform-origin: bottom center;\n  }\n  #ai-sales-widget-root.ai-is-open .ai-chat-window {\n    transform: translateY(0);\n  }\n  .ai-teaser-bubble {\n    width: calc(100vw - 32px);\n    left: 0;\n  }\n}\n";

  function ensureWidgetStyles() {
    if (document.getElementById('ai-sales-widget-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'ai-sales-widget-styles';
    styleEl.textContent = INLINE_WIDGET_CSS;
    (document.head || document.body || document.documentElement).appendChild(styleEl);
  }

  // DOM Building
  function createWidgetDOM() {
    if (document.getElementById('ai-sales-widget-root')) return;
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', createWidgetDOM);
      return;
    }

    ensureWidgetStyles();

    const root = document.createElement('div');
    root.id = 'ai-sales-widget-root';
    if (CONFIG.position === 'right') {
      root.classList.add('ai-pos-right');
    }

    const context = getContextData();
    const contextTopic = context.pageTitle ? context.pageTitle.split('-')[0].trim() : 'خدماتنا';

    root.innerHTML = `
      <!-- Teaser Bubble -->
      <div class="ai-teaser-bubble" id="ai-teaser" style="display: none;">
        <div class="ai-teaser-avatar">🤖</div>
        <div class="ai-teaser-content">
          <div class="ai-teaser-title">${CONFIG.teaserTitle}</div>
          <div class="ai-teaser-text">${CONFIG.teaserMessage}</div>
        </div>
        <button class="ai-teaser-close" id="ai-teaser-close" aria-label="إغلاق">&times;</button>
      </div>

      <!-- Chat Window -->
      <div class="ai-chat-window" id="ai-chat-window">
        <!-- Header -->
        <div class="ai-chat-header">
          <div class="ai-header-profile">
            <div class="ai-header-avatar-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
                <line x1="8" y1="16" x2="8" y2="16"></line>
                <line x1="16" y1="16" x2="16" y2="16"></line>
              </svg>
              <span class="ai-header-status-dot"></span>
            </div>
            <div class="ai-header-info">
              <span class="ai-header-title">${CONFIG.botName}</span>
              <span class="ai-header-subtitle">
                <span>متصل الآن</span> • <span>${CONFIG.companyName}</span>
              </span>
            </div>
          </div>
          <div class="ai-header-actions">
            <button class="ai-header-btn" id="ai-btn-sound" title="كتم/تشغيل الصوت" aria-label="الصوت">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            </button>
            <button class="ai-header-btn" id="ai-btn-reset" title="بدء محادثة جديدة" aria-label="إعادة تعيين">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            </button>
            <button class="ai-header-btn" id="ai-btn-minimize" title="تصغير" aria-label="إغلاق">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <!-- Context Bar -->
        <div class="ai-context-bar">
          <div class="ai-context-badge">
            <span class="ai-context-icon">📍</span>
            <span>يتصفح الآن: <strong>${escapeHTML(contextTopic)}</strong></span>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="ai-chat-messages" id="ai-chat-messages"></div>

        <!-- Quick Action Chips -->
        <div class="ai-quick-replies" id="ai-quick-replies"></div>

        <!-- Input Area with Unified Wrapper -->
        <form class="ai-chat-input-area" id="ai-chat-form">
          <div class="ai-input-wrapper">
            <input type="text" class="ai-chat-input" id="ai-user-input" placeholder="اكتب استفسارك هنا..." autocomplete="off" />
            <button type="submit" class="ai-send-btn" id="ai-send-btn" aria-label="إرسال">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>

        <!-- Footer -->
        <div class="ai-chat-footer">
          <span>مدعوم بواسطة الذكاء الاصطناعي للمبيعات ⚡</span>
        </div>
      </div>

      <!-- Launcher Button -->
      <button class="ai-launcher-btn" id="ai-launcher-btn" aria-label="مساعد المبيعات الذكي">
        <div class="ai-launcher-pulse"></div>
        <div class="ai-launcher-icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="ai-close-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
        <span class="ai-launcher-badge" id="ai-launcher-badge">1</span>
      </button>
    `;

    document.body.appendChild(root);
    setupEventHandlers();
    renderQuickReplies(CONFIG.quickReplies);

    // Initial greeting
    addBotMessage(CONFIG.welcomeMessage);

    // Setup Teaser Timer
    if (CONFIG.teaserDelayMs > 0) {
      setTimeout(() => {
        if (!state.isOpen && !state.hasInteracted) {
          const teaser = document.getElementById('ai-teaser');
          if (teaser) teaser.style.display = 'flex';
        }
      }, CONFIG.teaserDelayMs);
    }
  }

  // Setup Event Listeners
  function setupEventHandlers() {
    const launcherBtn = document.getElementById('ai-launcher-btn');
    const minimizeBtn = document.getElementById('ai-btn-minimize');
    const resetBtn = document.getElementById('ai-btn-reset');
    const soundBtn = document.getElementById('ai-btn-sound');
    const teaser = document.getElementById('ai-teaser');
    const teaserClose = document.getElementById('ai-teaser-close');
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-user-input');

    launcherBtn.addEventListener('click', toggleWidget);
    minimizeBtn.addEventListener('click', toggleWidget);

    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        state.soundMuted = !state.soundMuted;
        soundBtn.classList.toggle('ai-muted', state.soundMuted);
        soundBtn.title = state.soundMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت';
        soundBtn.innerHTML = state.soundMuted
          ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`
          : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
      });
    }

    if (teaser) {
      teaser.addEventListener('click', (e) => {
        if (e.target !== teaserClose) {
          openWidget();
        }
      });
    }

    if (teaserClose) {
      teaserClose.addEventListener('click', (e) => {
        e.stopPropagation();
        teaser.style.display = 'none';
      });
    }

    resetBtn.addEventListener('click', resetChat);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || state.isTyping) return;
      input.value = '';
      handleUserSubmit(text);
    });
  }

  // Toggle open / close
  function toggleWidget() {
    if (state.isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }

  function openWidget() {
    const root = document.getElementById('ai-sales-widget-root');
    const badge = document.getElementById('ai-launcher-badge');
    const teaser = document.getElementById('ai-teaser');
    const input = document.getElementById('ai-user-input');

    state.isOpen = true;
    state.hasInteracted = true;
    root.classList.add('ai-is-open');

    if (badge) badge.style.display = 'none';
    if (teaser) teaser.style.display = 'none';

    trackEvent('chat_opened');
    trackEvent('chatbot_opened');

    setTimeout(() => {
      if (input && window.innerWidth > 768) input.focus();
    }, 200);
  }

  function closeWidget() {
    const root = document.getElementById('ai-sales-widget-root');
    state.isOpen = false;
    root.classList.remove('ai-is-open');
    trackEvent('chatbot_closed');
  }

  function resetChat() {
    const container = document.getElementById('ai-chat-messages');
    container.innerHTML = '';
    state.messages = [];
    state.leadInfo = {};
    state.leadScore = 'COLD';
    addBotMessage(CONFIG.welcomeMessage);
    renderQuickReplies(CONFIG.quickReplies);
    trackEvent('chatbot_reset');
  }

  // Rendering Messages
  function addUserMessage(text) {
    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const container = document.getElementById('ai-chat-messages');
    const msgEl = document.createElement('div');
    msgEl.className = 'ai-msg ai-msg-user';
    msgEl.innerHTML = `
      <div class="ai-msg-bubble">
        ${escapeHTML(text)}
        <div class="ai-msg-time">${time}</div>
      </div>
    `;
    container.appendChild(msgEl);
    scrollToBottom();
    state.messages.push({ role: 'user', content: text, time });
  }

  function addBotMessage(text, extraData = {}) {
    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const container = document.getElementById('ai-chat-messages');
    const msgEl = document.createElement('div');
    msgEl.className = 'ai-msg ai-msg-bot';

    let extraHtml = '';

    // If Lead Qualified or WhatsApp Handover recommended
    if (extraData.showWhatsApp || extraData.leadScore === 'HOT') {
      const waNumber = CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
      const encodedMsg = encodeURIComponent(`مرحباً، أود استكمال طلبي الخاص بـ: ${extraData.service || 'أنظمة وبرامج الشركة'}`);
      const waLink = `https://wa.me/${waNumber}?text=${encodedMsg}`;

      extraHtml += `
        <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="ai-whatsapp-card" id="ai-wa-cta">
          <span>📲 متابعة مع مستشار المبيعات عبر واتساب</span>
          <svg class="ai-whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893 0-3.177-1.237-6.164-3.486-8.414z"/>
          </svg>
        </a>
      `;
    }

    if (extraData.leadCapturedSummary) {
      extraHtml += `
        <div class="ai-lead-summary-card">
          <span class="ai-lead-badge ${extraData.leadScore.toLowerCase()}">
            ${extraData.leadScore === 'HOT' ? '🔥 عميل مهتم جداً (Hot Lead)' : '🟡 عميل محتمل (Warm Lead)'}
          </span>
          <div>تم تدوين بياناتك بنجاح! سيقوم فريق المبيعات بالتواصل معك فوراً لتقديم أفضل عرض وتجربة مجانية.</div>
        </div>
      `;
    }

    msgEl.innerHTML = `
      <div class="ai-msg-avatar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="10" rx="2"></rect>
          <circle cx="12" cy="5" r="2"></circle>
          <path d="M12 7v4"></path>
          <line x1="8" y1="16" x2="8" y2="16"></line>
          <line x1="16" y1="16" x2="16" y2="16"></line>
        </svg>
      </div>
      <div class="ai-msg-bubble">
        ${formatBotText(text)}
        ${extraHtml}
        <div class="ai-msg-time">${time}</div>
      </div>
    `;

    container.appendChild(msgEl);
    scrollToBottom();
    state.messages.push({ role: 'bot', content: text, time, extra: extraData });

    // Play pleasant soft audio chime for visitor
    if (!extraData.isWelcome) {
      playNotificationSound();
    }

    // Track WhatsApp Click if present
    const waBtn = msgEl.querySelector('#ai-wa-cta');
    if (waBtn) {
      waBtn.addEventListener('click', () => {
        trackEvent('chatbot_whatsapp_clicked', {
          lead_score: extraData.leadScore || state.leadScore,
          service: extraData.service
        });
      });
    }
  }

  // Quick Replies UI
  function renderQuickReplies(replies) {
    const container = document.getElementById('ai-quick-replies');
    if (!container) return;
    if (!replies || replies.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    container.innerHTML = '';
    replies.forEach((reply) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'ai-chip';
      chip.innerText = reply;
      chip.addEventListener('click', () => {
        handleUserSubmit(reply);
      });
      container.appendChild(chip);
    });
  }

  // Typing indicator
  function showTypingIndicator() {
    state.isTyping = true;
    const container = document.getElementById('ai-chat-messages');
    const typing = document.createElement('div');
    typing.id = 'ai-typing-indicator-el';
    typing.className = 'ai-typing-indicator';
    typing.innerHTML = `
      <div class="ai-typing-dot"></div>
      <div class="ai-typing-dot"></div>
      <div class="ai-typing-dot"></div>
    `;
    container.appendChild(typing);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    state.isTyping = false;
    const typing = document.getElementById('ai-typing-indicator-el');
    if (typing) typing.remove();
  }

  function scrollToBottom() {
    const container = document.getElementById('ai-chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // Text formatter for bot response (handles simple markdown bold, linebreaks, bullets)
  function formatBotText(str) {
    if (!str) return '';
    let formatted = escapeHTML(str);
    // Bold **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Bullet points
    formatted = formatted.replace(/^[\*\-]\s+(.*)$/gm, '• $1');
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br/>');
    return formatted;
  }

  function escapeHTML(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
  }

  // Handle User Message Submission
  async function handleUserSubmit(userText) {
    addUserMessage(userText);
    showTypingIndicator();

    trackEvent('chatbot_message_sent', { message: userText });

    // Handle instant WhatsApp chip click
    if (userText.includes('واتساب') || userText.includes('WhatsApp')) {
      hideTypingIndicator();
      addBotMessage('يسعدنا جداً تواصلك معنا مباشرة عبر واتساب لخدمتك فوراً والرد على كافة استفساراتك:', {
        showWhatsApp: true,
        leadScore: 'HOT'
      });
      return;
    }

    try {
      let responseData;
      if (CONFIG.apiUrl && CONFIG.apiUrl.startsWith('https://script.google.com')) {
        // Send to Live Google Apps Script
        responseData = await callGoogleAppsScript(userText);
      } else {
        // Simulate local intelligent sales conversation (Mock Mode)
        responseData = await simulateLocalSalesResponse(userText);
      }

      hideTypingIndicator();

      // Process response data
      if (responseData) {
        state.leadScore = responseData.lead_score || state.leadScore;
        if (responseData.lead_info) {
          state.leadInfo = { ...state.leadInfo, ...responseData.lead_info };
        }

        // If a lead was captured (phone extracted) or score became HOT
        if (responseData.lead_captured) {
          trackEvent('lead_generated', {
            lead_score: state.leadScore,
            lead_name: state.leadInfo.name || '',
            lead_phone: state.leadInfo.phone || '',
            lead_activity: state.leadInfo.activity || '',
            lead_service: state.leadInfo.service || ''
          });
        }

        if (state.leadScore === 'HOT') {
          trackEvent('hot_lead_qualified', {
            lead_score: 'HOT',
            lead_name: state.leadInfo.name || '',
            lead_phone: state.leadInfo.phone || '',
            lead_service: state.leadInfo.service || ''
          });
        }

        addBotMessage(responseData.reply, {
          showWhatsApp: responseData.whatsapp_action || state.leadScore === 'HOT',
          leadCapturedSummary: responseData.lead_captured,
          leadScore: state.leadScore,
          service: state.leadInfo.service
        });

        // Update suggested quick replies if returned
        if (responseData.quick_replies && responseData.quick_replies.length > 0) {
          renderQuickReplies(responseData.quick_replies);
        }
      }
    } catch (err) {
      console.error('[AI Sales Chatbot] Error communicating with server:', err);
      hideTypingIndicator();
      addBotMessage('شكراً لتواصلك! يمكنك دائماً التحدث مباشرة مع فريق المبيعات عبر واتساب لمساعدتك في أي وقت:', {
        showWhatsApp: true,
        leadScore: 'WARM'
      });
    }
  }

  // Google Apps Script API Call
  async function callGoogleAppsScript(userText) {
    const payload = {
      message: userText,
      history: state.messages.map(m => ({ role: m.role, content: m.content })),
      context: getContextData(),
      current_lead: state.leadInfo,
      business_profile: CONFIG.businessProfile || null,
      custom_instructions: state.customInstructions || CONFIG.customInstructions || ''
    };

    const res = await fetch(CONFIG.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Google Apps Script handles CORS best with text/plain
      body: JSON.stringify(payload)
    });

    return await res.json();
  }

  // Local Intelligent Mock Sales Simulation (Runs out of the box without setup!)
  // Local Intelligent Consultative Sales Qualification Machine
  async function simulateLocalSalesResponse(userText) {
    await new Promise(r => setTimeout(r, 850)); // realistic typing delay
    const text = userText.trim();
    const lower = text.toLowerCase();

    // 1. Phone number detection (High Priority)
    const phoneMatch = text.match(/(?:01[0125][0-9]{8}|(?:\+|00)[0-9]{10,14}|[0-9]{8,12})/);
    if (phoneMatch) {
      const phone = phoneMatch[0];
      state.leadInfo.phone = phone;

      // Extract name if provided alongside phone (e.g. "أنا أحمد ورقمي 010...")
      const nameMatch = text.match(/(?:اسمي|أنا|معاك|أخوك)\s+([^\s,،]+)/);
      if (nameMatch && nameMatch[1]) {
        state.leadInfo.name = nameMatch[1];
      }

      return {
        reply: `تسلم يا فندم! تم تسجيل بياناتك بنجاح 🚀 (${phone})${state.leadInfo.name ? ' - أ/ ' + state.leadInfo.name : ''}.\n\nمستشار المبيعات المتخصص في **${state.leadInfo.activity || state.leadInfo.service || 'نشاطك'}** سيقوم بالتواصل معك فوراً عبر واتساب لتسليمك رابط التجربة المجانية والاطلاع على الخصم الحالي.`,
        lead_score: 'HOT',
        lead_captured: true,
        whatsapp_action: true,
        lead_info: { phone, name: state.leadInfo.name },
        quick_replies: ['💬 فتح محادثة واتساب الآن', 'طلب زيارة مندوب للمقر', 'استفسار عن طريقة الدفع']
      };
    }

    // 2. Track extracted data incrementally into state.leadInfo
    // Detect branches:
    const branchMatch = text.match(/([0-9]+)\s*(?:فرع|فروع|نقاط|نقطة|أفرع)/);
    if (branchMatch) {
      state.leadInfo.branches = branchMatch[1];
    } else if (lower.includes('فرع واحد') || lower.includes('محل واحد')) {
      state.leadInfo.branches = '1';
    } else if (lower.includes('فرعين') || lower.includes('فرعان')) {
      state.leadInfo.branches = '2';
    } else if (lower.includes('فروع متعددة') || lower.includes('أكثر من فرع')) {
      state.leadInfo.branches = '3+';
    }

    // Detect activity/business field:
    if (lower.includes('ملابس') || lower.includes('أزياء') || lower.includes('بوتيك')) {
      state.leadInfo.activity = 'محل ملابس وأزياء';
      state.leadInfo.service = 'برنامج كاشير ملابس ومقاسات وألوان';
    } else if (lower.includes('سوبر') || lower.includes('ماركت') || lower.includes('بقالة') || lower.includes('تموينات')) {
      state.leadInfo.activity = 'سوبر ماركت ومواد غذائية';
      state.leadInfo.service = 'برنامج نقاط بيع وميزان باركود';
    } else if (lower.includes('مطعم') || lower.includes('كافيه') || lower.includes('مقهى') || lower.includes('وجبات')) {
      state.leadInfo.activity = 'مطعم / كافيه';
      state.leadInfo.service = 'نظام كاشير مطاعم وطاولات ودليفري';
    } else if (lower.includes('صيدلية') || lower.includes('دواء')) {
      state.leadInfo.activity = 'صيدلية';
      state.leadInfo.service = 'برنامج صيدليات وتواريخ صلاحية';
    } else if (lower.includes('مصنع') || lower.includes('تصنيع') || lower.includes('إنتاج') || lower.includes('ورشة')) {
      state.leadInfo.activity = 'مصنع / منشأة تصنيع';
      state.leadInfo.service = 'نظام ERP لإدارة خطوط الإنتاج والتكاليف';
    } else if (lower.includes('شركة') || lower.includes('توزيع') || lower.includes('مقاولات') || lower.includes('تجارة')) {
      state.leadInfo.activity = 'شركة تجارة وتوزيع';
      state.leadInfo.service = 'نظام حسابات ومخازن وسيرفر مركزي';
    } else if (lower.includes('محل') || lower.includes('متجر') || lower.includes('تجزئة')) {
      state.leadInfo.activity = 'متجر تجزئة';
      state.leadInfo.service = 'برنامج كاشير ومخازن';
    }

    // 3. Consultative Multi-Step Sales Funnel (بناء مسار جمع البيانات خطوة بخطوة)

    // المرحلة أ: إذا عرفنا النشاط ولكن لا نعرف عدد الفروع
    if (state.leadInfo.activity && !state.leadInfo.branches) {
      return {
        reply: `أهلاً بك! ممتاز جداً، نظامنا مجهز بقوة لقطاع **${state.leadInfo.activity}** بميزات مثل جرد المخازن السريع، دعم الباركود، والفاتورة الإلكترونية.\n\nلتحديد النسخة وإمكانية ربط الشبكة:\nهل تدير **فرعاً واحداً** حالياً أم **فروعاً متعددة** تحتاج لربطها معاً؟`,
        lead_score: 'WARM',
        lead_info: { activity: state.leadInfo.activity, service: state.leadInfo.service },
        quick_replies: ['🏪 فرع واحد حالياً', '🏬 فرعان', '🏢 3 فروع أو أكثر', '🚀 طلب تجربة مجانية']
      };
    }

    // المرحلة ب: إذا عرفنا النشاط وعدد الفروع ولكن لم نجمع الاسم أو الهاتف
    if (state.leadInfo.activity && state.leadInfo.branches && !state.leadInfo.phone) {
      return {
        reply: `عظيم جداً! تم تجهيز التكوين الأنسب لـ (${state.leadInfo.activity} - ${state.leadInfo.branches} فرع) مع ترخيص دائم ويعمل بدون نت 100% 🚀.\n\nيسعدني جداً إرسال **العرض التوضيحي (Demo الحي) وتفاصيل خصم اليوم**:\nما هو **اسمك الكريم** ورقم **الواتساب** أو الهاتف المفضل للتواصل معك؟`,
        lead_score: 'HOT',
        lead_info: { activity: state.leadInfo.activity, branches: state.leadInfo.branches },
        quick_replies: ['💬 تواصل واتساب فوري', 'هل التجربة تشمل تدريب الموظفين؟', 'كم يستغرق التركيب؟']
      };
    }

    // المرحلة ج: إذا سأل عن الأسعار قبل تحديد النشاط
    if (lower.includes('سعر') || lower.includes('أسعار') || lower.includes('تكلفة') || lower.includes('بكام') || lower.includes('فلوس')) {
      return {
        reply: 'الترخيص لدينا شراء لمرة واحدة **مدى الحياة (بدون اشتراك شهري إجباري)** مع دعم فني مجاني وضمان كامل 💎.\n\nلتحديد باقة الخصم المناسبة بدقة لنشاطك: ما هو **نوع نشاطك التجاري** حالياً؟',
        lead_score: 'WARM',
        lead_info: { interested_in: 'pricing' },
        quick_replies: ['👗 محل ملابس وأزياء', '🛒 سوبر ماركت أو مواد غذائية', '🍽️ مطعم أو كافيه', '🏭 مصنع أو شركة توزيع']
      };
    }

    // المرحلة د: إذا طلب تجربة مجانية
    if (lower.includes('تجربة') || lower.includes('ديمو') || lower.includes('demo') || lower.includes('مجانية')) {
      return {
        reply: 'يسعدنا تفعيل **نسخة تجريبية مجانية بالكامل مع جلسة شرح عملية (Demo حي)** مخصصة لبيانات نشاطك! 🚀\n\nتفضل بمشاركتنا **اسمك ورقم هاتفك أو الواتساب** لإرسال رابط التحميل والبدء فوراً:',
        lead_score: 'HOT',
        whatsapp_action: false,
        quick_replies: ['💬 تواصل واتساب فوري', 'هل التجربة أونلاين أم مقرنا؟', 'ما هي المتطلبات لتشغيله؟']
      };
    }

    // المرحلة هـ: بداية المحادثة أو رسالة عامة (تتكيف ديناميكياً مع أي نشاط)
    const company = CONFIG.companyName || 'مؤسستنا';
    const industry = CONFIG.industry || 'خدماتنا';
    return {
      reply: `أهلاً بك يا فندم! يسعدني خدمتك وتقديم أفضل عرض واستشارة بخصوص (${industry}) من **${company}** 🌟.\n\nما هو استفسارك أو الخدمة المحددة التي تبحث عنها اليوم؟`,
      lead_score: 'WARM',
      whatsapp_action: false,
      quick_replies: CONFIG.quickReplies || ['🚀 طلب عرض أسعار', '⭐ معرفة المزايا والتفاصيل', '💬 تواصل مباشر عبر واتساب']
    };
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidgetDOM);
  } else {
    createWidgetDOM();
  }

  // Expose global controller for custom integrations
  window.AISalesChatbot = {
    init: createWidgetDOM,
    open: openWidget,
    close: closeWidget,
    reset: resetChat,
    getState: () => ({ ...state }),
    setApiUrl: (url) => {
      CONFIG.apiUrl = url ? url.trim() : '';
      try {
        if (CONFIG.apiUrl) {
          localStorage.setItem('ai_sales_api_url', CONFIG.apiUrl);
        } else {
          localStorage.removeItem('ai_sales_api_url');
        }
      } catch (e) {}
      console.log('[AI Sales Chatbot] API URL updated:', CONFIG.apiUrl);
    },
    setInstructions: (text) => {
      state.customInstructions = text || '';
      CONFIG.customInstructions = text || '';
      try {
        if (text) {
          localStorage.setItem('ai_sales_instructions', text);
        } else {
          localStorage.removeItem('ai_sales_instructions');
        }
      } catch (e) {}
      console.log('[AI Sales Chatbot] Custom instructions updated:', state.customInstructions);
    },
    setBusinessProfile: (profile) => {
      try {
        if (profile) {
          localStorage.setItem('ai_sales_business_profile', JSON.stringify(profile));
          Object.assign(CONFIG, profile);
        } else {
          localStorage.removeItem('ai_sales_business_profile');
        }
      } catch (e) {}
      console.log('[AI Sales Chatbot] Business Profile adapted:', profile);
    },
    send: handleUserSubmit
  };
})();
