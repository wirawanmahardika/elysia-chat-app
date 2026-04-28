import { z } from 'zod';
import type { UserId, SessionId, MessageId } from './types';

// Entities
export interface User {
    id: UserId;
    username: string;
    passwordHash: string;
    createdAt: Date;
}

export interface Session {
    id: SessionId;
    userId: UserId;
    expiresAt: Date;
}

export interface Message {
    id: MessageId;
    userId: UserId;
    content: string;
    createdAt: Date;
}

export interface MessageWithUser extends Message {
    username: string;
}

// DTOs
export const RegisterDTOSchema = z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores.'),
    password: z.string().min(8).max(100),
});
export type RegisterDTO = z.infer<typeof RegisterDTOSchema>;

export const LoginDTOSchema = z.object({
    username: z.string(),
    password: z.string(),
});
export type LoginDTO = z.infer<typeof LoginDTOSchema>;

export const SendMessageDTOSchema = z.object({
    content: z.string().min(1).max(1000),
});
export type SendMessageDTO = z.infer<typeof SendMessageDTOSchema>;
