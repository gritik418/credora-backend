import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  private rounds: number = 10;

  async hashValue(
    value: string,
    rounds: number = this.rounds,
  ): Promise<string> {
    return bcrypt.hash(value, rounds);
  }

  async compareValues(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
