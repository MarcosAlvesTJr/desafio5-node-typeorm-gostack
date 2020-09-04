import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    category,
    value,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Could not complete operation, insufficient funds');
    }

    const foundCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!foundCategory) {
      const newCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(newCategory);

      const transaction = transactionsRepository.create({
        category: newCategory,
        title,
        type,
        value,
      });

      await transactionsRepository.save(transaction);

      return transaction;
    }

    const transaction = transactionsRepository.create({
      category: foundCategory,
      title,
      type,
      value,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
