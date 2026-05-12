export type ActivityType =
    | 'projet'
    | 'encadrement'
    | 'editorial'
    | 'brevet'
    | 'conference'
    | 'distinction'
    | 'mediation'
    | 'enseignement';

export interface Activity {
    id: string;
    type: ActivityType;
    title: string;
    startDate: string;
    endDate?: string;
    description: string;
    url?: string;
    specificData?: Record<string, any>;
}
