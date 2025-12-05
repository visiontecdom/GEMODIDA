export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getAverage(name: string): number {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    this.metrics.forEach((values, name) => {
      result[name] = {
        average: values.reduce((a, b) => a + b, 0) / values.length,
        count: values.length
      };
    });

    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

export const performanceMonitor = new PerformanceMonitor();
