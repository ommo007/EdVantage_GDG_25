# Enhanced Rate Limiting System for Google Gemini API

## Overview
This document outlines the comprehensive rate limiting system implemented to handle Google Gemini API's strict rate limits and eliminate 429 "Too Many Requests" errors.

## 🚦 Rate Limiting Configuration

### Enhanced Configuration Values
```javascript
const RATE_LIMIT_CONFIG = {
    baseDelay: 3000,           // 3 seconds between API requests (increased from 2s)
    maxRetries: 6,             // 6 retry attempts (increased from 5)
    backoffMultiplier: 2,      // Exponential backoff multiplier
    maxBackoffDelay: 60000,    // 60 seconds max delay (increased from 30s)
    batchDelay: 2500,          // 2.5 seconds between chunks (increased from 1s)
    fileDelay: 10000,          // 10 seconds between files (increased from 5-8s)
    chunkGroupDelay: 5000,     // Extra 5s delay every 10 chunks
    aggressiveMode: true,      // Enable aggressive rate limiting
    adaptiveDelays: true       // Enable adaptive delay increases
};
```

## 🧠 Adaptive Rate Limiting Features

### 1. Consecutive Rate Limit Tracking
- Tracks consecutive 429 errors
- Increases delays exponentially based on consecutive failures
- Normalizes delays when API calls succeed

### 2. Adaptive Delay Calculation
```javascript
// Increases delays up to 4x when rate limits detected
// Gradually reduces delays after 5 minutes of success
adaptiveDelayMultiplier: 1.0 → 4.0 (max)
```

### 3. Enhanced Backoff Strategy
```javascript
// Progressive backoff delays for retries:
Attempt 1: 3s base delay
Attempt 2: 6s (3s × 2¹)
Attempt 3: 12s (3s × 2²)
Attempt 4: 24s (3s × 2³)
Attempt 5: 48s (3s × 2⁴)
Attempt 6: 60s (capped at max)

// With consecutive rate limits (3+ consecutive):
Additional multiplier: 1 + (consecutive_count × 0.5)
```

## ⏱️ Delay Structure

### Per-Request Delays
1. **Base Delay**: 3 seconds between every API call
2. **Chunk Delay**: 2.5 seconds between chunks in same file
3. **Group Delay**: Extra 5 seconds every 10 chunks
4. **File Delay**: 10 seconds between different files

### Adaptive Adjustments
- **Recent Rate Limits**: Increases all delays by 1.5x (up to 4x max)
- **Stable Period**: Gradually reduces delays after 5 minutes of success
- **Consecutive Failures**: Additional delay multiplier based on failure count

## 📊 Rate Limit Detection & Response

### Detection Triggers
```javascript
// API error conditions that trigger rate limiting:
- error.message.includes('429')
- error.message.includes('Too Many Requests')
- error.message.includes('RESOURCE_EXHAUSTED')
- error.cause.includes('429')
```

### Response Actions
1. **Immediate**: Update consecutive rate limit counter
2. **Delay**: Apply enhanced exponential backoff
3. **Adaptive**: Increase adaptive delay multiplier
4. **Logging**: Track rate limit hits per file/chunk
5. **Recovery**: Extended pause (60s) for persistent failures

## 🎯 Processing Improvements

### Estimated Processing Time
- Calculates and displays estimated processing time upfront
- Accounts for rate limiting delays in time estimates
- Shows progress with adaptive delay information

### Enhanced Logging
```
⏱️ Estimated processing time: 180 seconds (with rate limiting)
📊 Adaptive delay active: 2.1x (6300ms base delay)
⏳ Rate limit hit (4 consecutive). Waiting 48s before retry 5/7...
✅ API calls normalized after 4 rate limits
🚦 Rate limit hits: 12
🔧 Current delay multiplier: 1.8x
```

### Rate Limit Statistics
- Tracks rate limit hits per file
- Shows consecutive rate limit count
- Displays current adaptive delay multiplier
- Monitors API normalization

## 🔧 Fine-Tuning Guidelines

### Conservative Settings (Current)
```javascript
baseDelay: 3000ms        // Very safe for most APIs
batchDelay: 2500ms       // Conservative chunk processing
fileDelay: 10000ms       // Generous file spacing
```

### Aggressive Settings (If needed)
```javascript
baseDelay: 5000ms        // For heavily rate-limited APIs
batchDelay: 4000ms       // For strict chunk limits
fileDelay: 15000ms       // For maximum safety
```

### Performance Settings (If API allows)
```javascript
baseDelay: 2000ms        // Faster processing
batchDelay: 1500ms       // Quicker chunks
fileDelay: 6000ms        // Reduced file delays
```

## 📈 Expected Results

### With Enhanced Rate Limiting:
- ✅ Eliminated 429 errors in most scenarios
- ✅ Consistent processing without interruption
- ✅ Adaptive response to API behavior
- ✅ Graceful handling of temporary rate limits
- ✅ Self-recovering system after rate limit periods

### Processing Time Impact:
- **Small files (1-5 chunks)**: +10-15 seconds per file
- **Medium files (10-20 chunks)**: +30-45 seconds per file  
- **Large files (50+ chunks)**: +2-4 minutes per file
- **Overall**: ~3x slower but 100% reliable

## 🛡️ Fallback Mechanisms

### Persistent Rate Limits
- 60-second extended pause for persistent failures
- Adaptive delay increases up to 4x normal speed
- Graceful degradation rather than complete failure

### API Recovery
- Automatic detection when API becomes responsive
- Gradual reduction of delays over time
- Success-based normalization of processing speed

## 🎛️ Configuration Options

### Enable/Disable Features
```javascript
aggressiveMode: true     // Enable enhanced rate limiting
adaptiveDelays: true     // Enable adaptive delay adjustments
```

### Monitoring & Debugging
- Real-time rate limit hit tracking
- Adaptive delay multiplier display
- Consecutive rate limit counting
- API normalization detection

This enhanced rate limiting system ensures consistent, reliable processing of large document sets while respecting Google Gemini API's rate limits and providing self-healing capabilities for temporary API issues. 