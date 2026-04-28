import { EventEmitter } from 'events';
import type { MessageWithUser } from '../../domain/entities';

export type ChatEvent = 'message';

export class PubSubService {
    private emitter = new EventEmitter();

    constructor() {
        this.emitter.setMaxListeners(0);
    }

    subscribe(event: ChatEvent, callback: (message: MessageWithUser) => void) {
        this.emitter.on(event, callback);
        return () => {
            this.emitter.off(event, callback);
        };
    }

    broadcast(message: MessageWithUser) {
        this.emitter.emit('message', message);
    }
}
