import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  private rounds: number = 10;

  async hashValue(value: string, rounds: number = this.rounds) {
    return await bcrypt.hash(value, rounds);
  }

  async compareValues(value: string, hash: string) {
    return await bcrypt.compare(value, hash);
  }
}
