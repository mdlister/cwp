// Enhanced GA4 tracking for Cornwall Wedding Photography
class CornwallAnalytics {
  constructor() {
    this.initialized = false;
    this.formStartTime = null;
    this.portfolioScrollDepth = 0;
  }
  
  init() {
    if (this.initialized || typeof gtag === 'undefined') return;
    
    this.setupPageTracking();
    this.setupPortfolioTracking();
    this.setupFormTracking();
    this.setupCTATracking();
    this.setupTestimonialTracking();
    this.setupIntentSignals();
    
    this.initialized = true;
    console.log('Cornwall Analytics initialized');
  }
  
  setupPageTracking() {
    // Track page type based on URL
    const pageType = this.getPageType();
    const contentFocus = this.getContentFocus();
    
    gtag('event', 'page_view', {
      'page_type': pageType,
      'content_focus': contentFocus,
      'page_path': window.location.pathname,
      'page_title': document.title
    });
    
    // Track time on page for engaged sessions
    setTimeout(() => {
      gtag('event', 'engaged_session', {
        'engagement_time': 30,
        'page_type': pageType
      });
    }, 30000);
  }
  
  setupPortfolioTracking() {
    // Portfolio image interactions
    document.querySelectorAll('[class*="portfolio"], [class*="gallery"], .group.relative.overflow-hidden').forEach((item, index) => {
      item.addEventListener('click', () => {
        const imageCategory = item.querySelector('h4') ? item.querySelector('h4').textContent : 'portfolio_image';
        gtag('event', 'view_portfolio_image', {
          'event_category': 'Portfolio',
          'event_label': imageCategory,
          'image_position': index + 1,
          'portfolio_section': this.getElementSection(item)
        });
      });
    });
    
    // Portfolio scroll tracking
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if ([25, 50, 75, 90, 95].includes(Math.floor(scrollPercent))) {
          gtag('event', 'portfolio_scroll_depth', {
            'event_category': 'Engagement',
            'event_label': 'Portfolio Page',
            'scroll_depth': Math.floor(scrollPercent),
            'page_type': this.getPageType()
          });
        }
      }
    });
  }
  
  setupFormTracking() {
    const form = document.getElementById('cwp-contact-form');
    if (!form) return;
    
    // Track form focus (GA4 enhanced measurements should catch this, but we add specifics)
    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('focus', () => {
        if (!this.formStartTime) {
          this.formStartTime = Date.now();
          gtag('event', 'begin_contact_form', {
            'event_category': 'Form',
            'event_label': 'Form Interaction Started',
            'form_location': 'contact_section'
          });
        }
        
        gtag('event', 'form_field_interaction', {
          'event_category': 'Form',
          'event_label': field.name || field.id,
          'field_type': field.type
        });
      });
    });
    
    // Track form submission success (integrate with your existing Dynamics code)
    const originalSubmitHandler = form.onsubmit;
    form.addEventListener('submit', (e) => {
      if (!e.defaultPrevented) {
        const formTime = this.formStartTime ? Math.round((Date.now() - this.formStartTime) / 1000) : 0;
        const filledFields = Array.from(form.elements).filter(el => 
          ['text', 'email', 'textarea'].includes(el.type) && el.value.trim()
        ).length;
        
        gtag('event', 'submit_contact_form', {
          'event_category': 'Conversion',
          'event_label': 'Contact Form Submitted',
          'form_completion_time': formTime,
          'fields_filled': filledFields,
          'form_location': 'contact_section'
        });
        
        // Mark as conversion
        gtag('event', 'generate_lead', {
          'event_category': 'Lead Generation',
          'event_label': 'Website Enquiry',
          'value': 1
        });
        
        this.formStartTime = null;
      }
    }, true);
  }
  
  setupCTATracking() {
    // Track all CTA clicks
    document.querySelectorAll('a[href*="#contact"], .btn-accent, .btn-primary, [class*="btn-"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ctaText = btn.textContent.trim().substring(0, 50);
        gtag('event', 'click_cta', {
          'event_category': 'CTA',
          'event_label': ctaText,
          'cta_location': this.getElementLocation(btn),
          'cta_type': this.getCTAType(btn),
          'page_type': this.getPageType()
        });
      });
    });
    
    // Track phone clicks
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
      link.addEventListener('click', () => {
        gtag('event', 'click_phone', {
          'event_category': 'Contact',
          'event_label': 'Phone Call Attempt',
          'phone_number': link.href.replace('tel:', '')
        });
      });
    });
    
    // Track email clicks
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
      link.addEventListener('click', () => {
        gtag('event', 'click_email', {
          'event_category': 'Contact',
          'event_label': 'Email Link Click',
          'email_address': link.href.replace('mailto:', '')
        });
      });
    });
  }
  
  setupTestimonialTracking() {
    // Track testimonial reads
    const testimonials = document.querySelectorAll('.testimonial, blockquote, [class*="testimonial"]');
    if (testimonials.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const testimonial = entry.target;
          const coupleName = testimonial.querySelector('h4, [class*="name"]') ? 
                            testimonial.querySelector('h4, [class*="name"]').textContent : 
                            'Anonymous Couple';
          
          gtag('event', 'view_testimonial', {
            'event_category': 'Social Proof',
            'event_label': coupleName,
            'testimonial_position': Array.from(testimonials).indexOf(testimonial) + 1
          });
          
          observer.unobserve(testimonial); // Track only once
        }
      });
    }, { threshold: 0.5 });
    
    testimonials.forEach(testimonial => observer.observe(testimonial));
  }
  
  setupIntentSignals() {
    // Track serious intent signals
    const pageType = this.getPageType();
    
    // Portfolio deep engagement
    if (pageType === 'portfolio' || window.location.pathname.includes('portfolio')) {
      setTimeout(() => {
        gtag('event', 'portfolio_deep_engagement', {
          'event_category': 'Intent',
          'event_label': 'Spent Significant Time on Portfolio',
          'engagement_time': 60
        });
      }, 60000);
    }
    
    // Multiple page views in session
    let pageViewCount = parseInt(sessionStorage.getItem('cwp_page_views') || '0');
    pageViewCount++;
    sessionStorage.setItem('cwp_page_views', pageViewCount.toString());
    
    if (pageViewCount >= 3) {
      gtag('event', 'high_engagement_session', {
        'event_category': 'Intent',
        'event_label': 'Multiple Page Views',
        'page_view_count': pageViewCount
      });
    }
  }
  
  // Helper methods
  getPageType() {
    const path = window.location.pathname;
    if (path === '/' || path.includes('index') || path.includes('home')) return 'home';
    if (path.includes('portfolio')) return 'portfolio';
    if (path.includes('blog')) return 'blog';
    if (path.includes('about')) return 'about';
    if (path.includes('contact')) return 'contact';
    if (path.includes('pricing') || path.includes('investment')) return 'pricing';
    return 'other';
  }
  
  getContentFocus() {
    const path = window.location.pathname;
    if (path.includes('portfolio')) {
      // Check for specific portfolio categories
      if (path.includes('beach') || document.body.textContent.includes('beach')) return 'beach_weddings';
      if (path.includes('manor') || document.body.textContent.includes('manor')) return 'manor_weddings';
      if (path.includes('church')) return 'church_weddings';
      return 'portfolio_general';
    }
    return 'information';
  }
  
  getElementLocation(element) {
    if (element.closest('#contact')) return 'contact_section';
    if (element.closest('#hero')) return 'hero_section';
    if (element.closest('#portfolio')) return 'portfolio_section';
    if (element.closest('footer')) return 'footer';
    if (element.closest('header')) return 'header';
    return 'page_body';
  }
  
  getElementSection(element) {
    const sections = ['hero', 'portfolio', 'testimonials', 'process', 'contact'];
    for (const section of sections) {
      if (element.closest(`#${section}`)) return section;
    }
    return 'unknown';
  }
  
  getCTAType(element) {
    if (element.classList.contains('btn-accent')) return 'primary_accent';
    if (element.classList.contains('btn-primary')) return 'primary';
    if (element.classList.contains('btn-secondary')) return 'secondary';
    return 'link';
  }
  
  // Public method to track custom events
  trackEvent(category, action, label, value = 1, params = {}) {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', action, {
      'event_category': category,
      'event_label': label,
      'value': value,
      ...params
    });
  }
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for GA4 to load
  setTimeout(() => {
    window.cornwallAnalytics = new CornwallAnalytics();
    window.cornwallAnalytics.init();
  }, 1000);
});

// Expose for manual tracking if needed
function trackAnalyticsEvent(category, action, label, value, params) {
  if (window.cornwallAnalytics) {
    window.cornwallAnalytics.trackEvent(category, action, label, value, params);
  } else if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      'event_category': category,
      'event_label': label,
      'value': value,
      ...params
    });
  }
}