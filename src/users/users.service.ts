import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    getUsersCriteria() {
        // Mocking
        return [
            {
                name: 'Arnaldo',
                email: 'arnaldotema@gmail.com',
                phoneNumber: '+351918755576',
                criteria: {
                    minWaveHeight: 0.5,
                },
                optOut: false,
            },
        ];
    }
}