import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import { getRepository, In, getCustomRepository } from 'typeorm';
import upload from '../config/upload';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const csvFilePath = path.join(upload.directory, filename);
    const readCSVStream = fs.createReadStream(csvFilePath);
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const categories: string[] = [];
    const transactions: CSVTransaction[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const existingCategories = await categoriesRepository.find({
      where: { title: In(categories) },
    });

    const existingCategoriesTitles = existingCategories.map(
      category => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existingCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...existingCategories, ...newCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(({ title, type, value, category }) => ({
        title,
        type,
        category: finalCategories.find(
          categoryFinal => categoryFinal.title === category,
        ),
        value,
      })),
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(csvFilePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
