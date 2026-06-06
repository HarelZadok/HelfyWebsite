import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../db/pool';
import { AppError } from '../utils/AppError';
import { ICart } from '../types';

const getOrCreateCart = async (userId: number): Promise<number> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM carts WHERE userId = ?',
    [userId]
  );
  if (rows.length > 0) {
    return rows[0].id as number;
  }
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO carts (userId) VALUES (?)',
    [userId]
  );
  return result.insertId;
};

export const getCart = async (userId: number): Promise<ICart> => {
  const cartId = await getOrCreateCart(userId);

  const [items] = await pool.execute<RowDataPacket[]>(
    `SELECT
       ci.productId,
       p.name,
       p.price,
       ci.quantity,
       (p.price * ci.quantity) AS lineTotal,
       JSON_UNQUOTE(JSON_EXTRACT(p.images, '$[0]')) AS image
     FROM cart_items ci
     JOIN products p ON ci.productId = p.id
     WHERE ci.cartId = ?`,
    [cartId]
  );

  const cartItems = items.map((row) => ({
    productId: row.productId as number,
    name: row.name as string,
    image: (row.image as string | null) ?? null,
    price: parseFloat(row.price as string),
    quantity: row.quantity as number,
    lineTotal: parseFloat(row.lineTotal as string),
  }));

  const subtotal = cartItems.reduce((sum: number, item: { lineTotal: number }) => sum + item.lineTotal, 0);
  const itemCount = cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);

  return { id: cartId, items: cartItems, subtotal, itemCount };
};

export const addItem = async (userId: number, productId: number, quantity: number): Promise<ICart> => {
  const [productRows] = await pool.execute<RowDataPacket[]>(
    'SELECT id, stock FROM products WHERE id = ?',
    [productId]
  );
  if (productRows.length === 0) {
    throw new AppError('Product not found', 404, 'NOT_FOUND');
  }
  if ((productRows[0].stock as number) < quantity) {
    throw new AppError('Insufficient stock', 400, 'INSUFFICIENT_STOCK');
  }

  const cartId = await getOrCreateCart(userId);

  await pool.execute(
    `INSERT INTO cart_items (cartId, productId, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [cartId, productId, quantity]
  );

  return getCart(userId);
};

export const updateItem = async (userId: number, productId: number, quantity: number): Promise<ICart> => {
  if (quantity <= 0) {
    return removeItem(userId, productId);
  }

  const cartId = await getOrCreateCart(userId);
  await pool.execute(
    'UPDATE cart_items SET quantity = ? WHERE cartId = ? AND productId = ?',
    [quantity, cartId, productId]
  );

  return getCart(userId);
};

export const removeItem = async (userId: number, productId: number): Promise<ICart> => {
  const cartId = await getOrCreateCart(userId);
  await pool.execute(
    'DELETE FROM cart_items WHERE cartId = ? AND productId = ?',
    [cartId, productId]
  );
  return getCart(userId);
};

export const clearCart = async (userId: number): Promise<void> => {
  const cartId = await getOrCreateCart(userId);
  await pool.execute('DELETE FROM cart_items WHERE cartId = ?', [cartId]);
};
