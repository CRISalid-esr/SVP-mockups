export type ActivityType =
    | 'projet'
    | 'encadrement'
    | 'editorial'
    | 'brevet'
    | 'conference'
    | 'distinction'
    | 'mediation'
    | 'enseignement'
    | 'responsabilite';

export interface Activity {
    id: string;
    type: ActivityType;
    title: string;
    startDate: string;
    endDate?: string;
    description: string;
    url?: string;
    specificData?: Record<string, any>;
    /** Diffusion : « établissement » par défaut (plan « Mon CV », D11). */
    visibility?: ActivityVisibility;
}

export type ActivityVisibility = 'private' | 'institution' | 'public';
