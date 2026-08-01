import { UserRepository } from '../../domain/repositories';
import { UserId } from '../../domain/types';

export class UserService {
    constructor(private userRepository: UserRepository) {}

    async getUser(id: UserId) {
        return await this.userRepository.findById(id);
    }
}
