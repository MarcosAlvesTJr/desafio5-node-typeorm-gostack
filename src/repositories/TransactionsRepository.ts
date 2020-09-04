import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const balance = transactions.reduce(
      (accumulator, currentTransaction) => {
        if (currentTransaction.type === 'income') {
          return {
            income: accumulator.income + Number(currentTransaction.value),
            outcome: accumulator.outcome,
            total:
              accumulator.income +
              Number(currentTransaction.value) -
              accumulator.outcome,
          };
        }
        return {
          income: accumulator.income,
          outcome: accumulator.outcome + Number(currentTransaction.value),
          total:
            accumulator.income -
            (accumulator.outcome + Number(currentTransaction.value)),
        };
      },
      { income: 0, outcome: 0, total: 0 },
    );

    return balance;
  }
}

export default TransactionsRepository;
