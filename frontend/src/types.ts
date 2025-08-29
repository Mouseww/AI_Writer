export interface Novel {
    id: number;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    totalWordCount: number;
    latestChapterTitle?: string; // Optional, as a novel might not have chapters yet
    chapters?: Chapter[] ;
}

export interface Chapter {
    id: number;
    title: string;
    content: string;
    order: number;
    wordCount: number;
    createdAt: string;
    lastUpdatedAt: string;
}

export interface Agent {
    id: number;
    name: string;
    prompt: string;
    model: string;
    order: number;
}
