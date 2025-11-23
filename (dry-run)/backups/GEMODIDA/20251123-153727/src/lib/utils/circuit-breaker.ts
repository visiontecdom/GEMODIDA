// Circuit breaker utility to prevent infinite loops and excessive API calls

interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  expectedErrors?: string[];
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number | null;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

export class CircuitBreaker {
  private state: CircuitBreakerState = {
    failures: 0,
    lastFailureTime: null,
    state: 'CLOSED'
  };

  private readonly options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      failureThreshold: options.failureThreshold || 5,
      recoveryTimeout: options.recoveryTimeout || 30000,
      expectedErrors: options.expectedErrors || []
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state.state = 'HALF_OPEN';
        console.warn('🔄 Circuit breaker: Attempting to reset');
      } else {
        throw new Error('Circuit breaker is OPEN - blocking operation');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.state.lastFailureTime) return false;
    return Date.now() - this.state.lastFailureTime >= this.options.recoveryTimeout;
  }

  private onSuccess(): void {
    this.state.failures = 0;
    this.state.state = 'CLOSED';
    console.log('✅ Circuit breaker: Operation successful, resetting failure count');
  }

  private onFailure(error: unknown): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();

    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (this.options.expectedErrors?.some(expected => errorMessage.includes(expected))) {
      console.warn('⚠️ Circuit breaker: Expected error occurred:', errorMessage);
      return;
    }

    if (this.state.failures >= this.options.failureThreshold) {
      this.state.state = 'OPEN';
      console.error('❌ Circuit breaker: OPEN - too many failures', {
        failures: this.state.failures,
        threshold: this.options.failureThreshold,
        lastError: errorMessage
      });
    } else {
      console.warn('⚠️ Circuit breaker: Failure recorded', {
        failures: this.state.failures,
        threshold: this.options.failureThreshold,
        lastError: errorMessage
      });
    }
  }

  getState(): string {
    return this.state.state;
  }

  getStats() {
    return {
      state: this.state.state,
      failures: this.state.failures,
      lastFailureTime: this.state.lastFailureTime
    };
  }

  reset(): void {
    this.state = {
      failures: 0,
      lastFailureTime: null,
      state: 'CLOSED'
    };
    console.log('🔄 Circuit breaker: Manual reset');
  }
}

// Global circuit breakers for different operations
export const supabaseAuthCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  recoveryTimeout: 10000, // 10 seconds
  expectedErrors: ['Invalid login credentials', 'Email not confirmed']
});

export const apiCallCircuitBreaker = new CircuitBreaker({
  failureThreshold: 10,
  recoveryTimeout: 30000, // 30 seconds
  expectedErrors: ['NetworkError', 'Failed to fetch']
});

export const navigationCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeout: 5000, // 5 seconds
  expectedErrors: ['Navigation cancelled']
});

// Safe navigation wrapper
export async function safeNavigate(router: any, path: string, timeout: number = 5000): Promise<void> {
  return navigationCircuitBreaker.execute(async () => {
    const navigationPromise = router.push(path);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Navigation timeout')), timeout);
    });
    
    try {
      await Promise.race([navigationPromise, timeoutPromise]);
    } catch (error) {
      console.error('Navigation failed:', error);
      throw error;
    }
  });
}

// Rate limiter to prevent excessive API calls
export class RateLimiter {
  private calls: Map<string, number[]> = new Map();

  constructor(private maxCalls: number = 10, private windowMs: number = 1000) {}

  async checkLimit(operation: string): Promise<boolean> {
    const now = Date.now();
    const calls = this.calls.get(operation) || [];
    
    // Remove calls outside the window
    const validCalls = calls.filter(time => now - time < this.windowMs);
    
    if (validCalls.length >= this.maxCalls) {
      console.warn(`🚦 Rate limiter: ${operation} blocked - too many calls in window`);
      return false;
    }
    
    validCalls.push(now);
    this.calls.set(operation, validCalls);
    return true;
  }
}

// Global rate limiter for API calls
export const apiRateLimiter = new RateLimiter(20, 1000); // 20 calls per second