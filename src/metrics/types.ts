export type MetricSource = 'apple_health' | 'health_connect' | 'google_fit' | 'mock' | 'none';

export type BodyMetrics = {
    // platform?: 'ios' | 'android';
    // source: MetricSource;
    weight: number | null;
    height: number | null;
    bodyFat: number | null; // 0-100
    bmi: number | null;
    muscleMass: number | null;
    // measured_at?: string;




};
export interface DeviceInfo {
    id: string;
    name: string;
    connected: boolean;
}