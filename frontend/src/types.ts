export interface Novel {
    id: number;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    totalWordCount: number;
    latestChapterTitle?: string; // Optional, as a novel might not have chapters yet
    chapters?: Chapter[] ;
    userNovelPlatformId?: number;
    platformNumber?: string;
    autoPublish: boolean;
}

export interface NovelPlatform {
    id: number;
    name: string;
    publishUrl: string;
}

export interface UserNovelPlatform {
    id: number;
    userId: number;
    novelPlatformId: number;
    platformUserName: string;
    novelPlatformName: string;
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
