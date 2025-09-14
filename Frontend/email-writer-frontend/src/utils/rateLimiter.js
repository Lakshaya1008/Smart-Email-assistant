// Rate limiter to respect Gemini API limits
class RateLimiter {
  constructor() {
    this.requests = [];
    this.dailyRequests = this.getDailyRequests();
    this.lastResetDate = new Date().toDateString();
    
    // Gemini 2.5 Flash free tier limits
    this.limits = {
      requestsPerMinute: 8, // Conservative: 8 instead of 10 to leave buffer
      requestsPerDay: 200,  // Conservative: 200 instead of 250 to leave buffer
      tokensPerMinute: 200000 // Conservative: 200k instead of 250k
    };
    
    this.tokenUsage = [];
  }

  getDailyRequests() {
    const stored = localStorage.getItem('gemini_daily_requests');
    if (!stored) return [];
    
    const data = JSON.parse(stored);
    const today = new Date().toDateString();
    
    // Reset if it's a new day
    if (data.date !== today) {
      localStorage.removeItem('gemini_daily_requests');
      return [];
    }
    
    return data.requests || [];
  }

  saveDailyRequests() {
    localStorage.setItem('gemini_daily_requests', JSON.stringify({
      date: new Date().toDateString(),
      requests: this.dailyRequests
    }));
  }

  estimateTokens(text) {
    // Rough estimation: ~4 characters per token for English
    // Add buffer for processing tokens and response
    const inputTokens = Math.ceil(text.length / 4);
    const responseTokens = 200; // Estimated response size
    const processingBuffer = 100; // Buffer for processing tokens
    return inputTokens + responseTokens + processingBuffer;
  }

  canMakeRequest(emailContent = '', subject = '') {
    const now = new Date();
    const oneMinuteAgo = new Date(now - 60000);
    const today = now.toDateString();

    // Reset daily counter if new day
    if (this.lastResetDate !== today) {
      this.dailyRequests = [];
      this.lastResetDate = today;
      this.saveDailyRequests();
    }

    // Clean old requests (older than 1 minute)
    this.requests = this.requests.filter(time => time > oneMinuteAgo);
    this.tokenUsage = this.tokenUsage.filter(usage => usage.time > oneMinuteAgo);

    // Check rate limits
    const recentRequests = this.requests.length;
    const dailyCount = this.dailyRequests.length;
    
    // Estimate tokens for this request
    const estimatedTokens = this.estimateTokens(emailContent + subject);
    const recentTokens = this.tokenUsage.reduce((sum, usage) => sum + usage.tokens, 0);

    const checks = {
      withinMinuteLimit: recentRequests < this.limits.requestsPerMinute,
      withinDailyLimit: dailyCount < this.limits.requestsPerDay,
      withinTokenLimit: (recentTokens + estimatedTokens) < this.limits.tokensPerMinute
    };

    return {
      canProceed: checks.withinMinuteLimit && checks.withinDailyLimit && checks.withinTokenLimit,
      limits: {
        requestsThisMinute: recentRequests,
        requestsToday: dailyCount,
        tokensThisMinute: recentTokens,
        estimatedTokensForRequest: estimatedTokens
      },
      timeUntilReset: {
        minute: 60 - ((now.getTime() % 60000) / 1000),
        daily: this.getTimeUntilMidnight()
      },
      reasons: {
        rateLimited: !checks.withinMinuteLimit,
        dailyLimitReached: !checks.withinDailyLimit,
        tokenLimitReached: !checks.withinTokenLimit
      }
    };
  }

  recordRequest(emailContent = '', subject = '') {
    const now = new Date();
    const estimatedTokens = this.estimateTokens(emailContent + subject);
    
    this.requests.push(now);
    this.tokenUsage.push({ time: now, tokens: estimatedTokens });
    this.dailyRequests.push(now.toISOString());
    
    this.saveDailyRequests();
  }

  getTimeUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.ceil((midnight - now) / (1000 * 60 * 60)); // Hours until reset
  }

  getUsageStats() {
    const now = new Date();
    const oneMinuteAgo = new Date(now - 60000);
    
    const recentRequests = this.requests.filter(time => time > oneMinuteAgo).length;
    const recentTokens = this.tokenUsage
      .filter(usage => usage.time > oneMinuteAgo)
      .reduce((sum, usage) => sum + usage.tokens, 0);
    
    return {
      requestsThisMinute: recentRequests,
      maxRequestsPerMinute: this.limits.requestsPerMinute,
      requestsToday: this.dailyRequests.length,
      maxRequestsPerDay: this.limits.requestsPerDay,
      tokensThisMinute: recentTokens,
      maxTokensPerMinute: this.limits.tokensPerMinute,
      percentageUsed: {
        minute: (recentRequests / this.limits.requestsPerMinute) * 100,
        daily: (this.dailyRequests.length / this.limits.requestsPerDay) * 100,
        tokens: (recentTokens / this.limits.tokensPerMinute) * 100
      }
    };
  }

  getRemainingQuota() {
    const stats = this.getUsageStats();
    return {
      requestsThisMinute: this.limits.requestsPerMinute - stats.requestsThisMinute,
      requestsToday: this.limits.requestsPerDay - stats.requestsToday,
      tokensThisMinute: this.limits.tokensPerMinute - stats.tokensThisMinute
    };
  }
}

export const rateLimiter = new RateLimiter();
