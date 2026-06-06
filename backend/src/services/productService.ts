import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../db/pool';
import { AppError } from '../utils/AppError';
import { IProduct, ICategory, IPaginationMeta } from '../types';

interface ProductFilters {
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

const parseProduct = (row: RowDataPacket): IProduct => ({
  id: row.id as number,
  categoryId: row.categoryId as number,
  categoryName: row.categoryName as string,
  name: row.name as string,
  slug: row.slug as string,
  description: row.description as string,
  price: parseFloat(row.price as string),
  comparePrice: row.comparePrice != null ? parseFloat(row.comparePrice as string) : null,
  images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images as string[]),
  stock: row.stock as number,
  featured: Boolean(row.featured),
  rating: parseFloat(row.rating as string),
  reviewCount: row.reviewCount as number,
  createdAt: row.createdAt as string,
});

export const getProducts = async (
  filters: ProductFilters
): Promise<{ products: IProduct[]; meta: IPaginationMeta }> => {
  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 12));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: (string | number | boolean)[] = [];

  if (filters.search) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }
  if (filters.categoryId) {
    conditions.push('p.categoryId = ?');
    params.push(filters.categoryId);
  }
  if (filters.minPrice !== undefined) {
    conditions.push('p.price >= ?');
    params.push(filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    conditions.push('p.price <= ?');
    params.push(filters.maxPrice);
  }
  if (filters.featured !== undefined) {
    conditions.push('p.featured = ?');
    params.push(filters.featured ? 1 : 0);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sortMap: Record<string, string> = {
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    rating: 'p.rating DESC',
    newest: 'p.createdAt DESC',
    name: 'p.name ASC',
  };
  const orderBy = sortMap[filters.sort || ''] || 'p.createdAt DESC';

  const countQuery = `
    SELECT COUNT(*) as total
    FROM products p
    JOIN categories c ON p.categoryId = c.id
    ${where}
  `;
  const [countRows] = await pool.execute<RowDataPacket[]>(countQuery, params);
  const total = (countRows[0].total as number) || 0;

  const dataQuery = `
    SELECT p.*, c.name as categoryName
    FROM products p
    JOIN categories c ON p.categoryId = c.id
    ${where}
    ORDER BY ${orderBy}
    LIMIT ${limit} OFFSET ${offset}
  `;
  const [rows] = await pool.execute<RowDataPacket[]>(dataQuery, params);

  return {
    products: rows.map(parseProduct),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: number): Promise<IProduct> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT p.*, c.name as categoryName
     FROM products p
     JOIN categories c ON p.categoryId = c.id
     WHERE p.id = ?`,
    [id]
  );
  if (rows.length === 0) {
    throw new AppError('Product not found', 404, 'NOT_FOUND');
  }
  return parseProduct(rows[0]);
};

export const getCategories = async (): Promise<ICategory[]> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM categories ORDER BY name ASC'
  );
  return rows as ICategory[];
};
