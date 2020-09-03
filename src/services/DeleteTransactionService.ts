import { getCustomRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const trasaction = await transactionsRepository.findOne(id);

    if (!trasaction) {
      throw new AppError('Transaction not found');
    }

    await transactionsRepository.remove(trasaction);
  }
}

export default DeleteTransactionService;
