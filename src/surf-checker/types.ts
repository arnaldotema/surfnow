interface SurfCondition {
    time: string;
    waveHeight: string;
    windSpeed: string;
}

interface BeachReport {
    url: string;
    conditions: SurfCondition[];
}

type BeachStatus= {
    url: string,
    time: string,
    waveHeightValue: number;
    windSpeedValue: number;
    waveHeight: string;
    windSpeed: string;
}