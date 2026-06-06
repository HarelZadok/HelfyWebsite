import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../db/pool';
import { AppError } from '../utils/AppError';
import { IOrder, IAddress, IPaginationMeta } from '../types';

const parseOrder = (row: RowDataPacket): Omit<IOrder, 'items'> => ({
  id: row.id as number,
  userId: row.userId as number,
  status: row.status as IOrder['status'],
  subtotal: parseFloat(row.subtotal as string),
  shippingCost: parseFloat(row.shippingCost as string),
  total: parseFloat(row.total as string),
  shippingAddress: typeof row.shippingAddress === 'string'
    ? JSON.parse(row.shippingAddress)
    : row.shippingAddress as IAddress,
  createdAt: row.createdAt as string,
  updatedAt: row.updatedAt as string,
});

export const placeOrder = async (userId: number, shippingAddress: IAddress): Promise<IOrder> => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [cartRows] = await conn.execute<RowDataPacket[]>(
      'SELECT id FROM carts WHERE userId = ?',
      [userId]
    );
    if (cartRows.length === 0) {
      throw new AppError('Cart is empty', 400, 'EMPTY_CART');
    }
    const cartId = cartRows[0].id as number;

    const [cartItems] = await conn.execute<RowDataPacket[]>(
      `SELECT ci.productId, ci.quantity, p.name, p.price, p.stock
       FROM cart_items ci
       JOIN products p ON ci.productId = p.id
       WHERE ci.cartId = ?`,
      [cartId]
    );

    if (cartItems.length === 0) {
      throw new AppError('Cart is empty', 400, 'EMPTY_CART');
    }

    let subtotal = 0;
    for (const item of cartItems) {
      if ((item.stock as number) < (item.quantity as number)) {
        throw new AppError(`Insufficient stock for ${item.name as string}`, 400, 'INSUFFICIENT_STOCK');
      }
      subtotal += parseFloat(item.price as string) * (item.quantity as number);
    }

    const shippingCost = subtotal >= 100 ? 0 : 9.99;
    const total = subtotal + shippingCost;

    const [orderResult] = await conn.execute<ResultSetHeader>(
      `INSERT INTO orders (userId, status, subtotal, shippingCost, total, shippingAddress)
       VALUES (?, 'pending', ?, ?, ?, ?)`,
      [userId, subtotal, shippingCost, total, JSON.stringify(shippingAddress)]
    );
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await conn.execute(
        `INSERT INTO order_items (orderId, productId, productName, price, quantity, lineTotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.name,
          item.price,
          item.quantity,
          parseFloat(item.price as string) * (item.quantity as number),
        ]
      );

      await conn.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    await conn.execute('DELETE FROM cart_items WHERE cartId = ?', [cartId]);

    await conn.commit();

    return getOrderById(userId, orderId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getOrders = async (
  userId: number,
  page: number = 1,
  limit: number = 10
): Promise<{ orders: IOrder[]; meta: IPaginationMeta }> => {
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit)));
  const safePage = Math.max(1, Math.floor(page));
  const offset = (safePage - 1) * safeLimit;

  const [countRows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as total FROM orders WHERE userId = ?',
    [userId]
  );
  const total = (countRows[0].total as number) || 0;

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC LIMIT ${safeLimit} OFFSET ${offset}`,
    [userId]
  );

  const orders = await Promise.all(
    rows.map(async (row: RowDataPacket) => {
      const [itemRows] = await pool.execute<RowDataPacket[]>(
        `SELECT oi.id, oi.orderId, oi.productId,
                oi.productName AS name,
                oi.price, oi.quantity, oi.lineTotal,
                JSON_UNQUOTE(JSON_EXTRACT(p.images, '$[0]')) AS image
         FROM order_items oi
         LEFT JOIN products p ON oi.productId = p.id
         WHERE oi.orderId = ?`,
        [row.id as number]
      );
      return {
        ...parseOrder(row),
        items: itemRows.map((ir: RowDataPacket) => ({
          id: ir.id as number,
          productId: ir.productId as number | null,
          name: ir.name as string,
          image: (ir.image as string | null) ?? null,
          price: parseFloat(ir.price as string),
          quantity: ir.quantity as number,
          lineTotal: parseFloat(ir.lineTotal as string),
        })),
      };
    })
  );

  return {
    orders,
    meta: { page: safePage, limit: safeLimit, total, totalPages: Math.ceil(total / safeLimit) },
  };
};

export const getOrderById = async (userId: number, orderId: number): Promise<IOrder> => {
  const [orderRows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM orders WHERE id = ? AND userId = ?',
    [orderId, userId]
  );
  if (orderRows.length === 0) {
    throw new AppError('Order not found', 404, 'NOT_FOUND');
  }

  const [itemRows] = await pool.execute<RowDataPacket[]>(
    `SELECT oi.id, oi.orderId, oi.productId,
            oi.productName AS name,
            oi.price, oi.quantity, oi.lineTotal,
            JSON_UNQUOTE(JSON_EXTRACT(p.images, '$[0]')) AS image
     FROM order_items oi
     LEFT JOIN products p ON oi.productId = p.id
     WHERE oi.orderId = ?`,
    [orderId]
  );

  const order = parseOrder(orderRows[0]);
  return {
    ...order,
    items: itemRows.map((row: RowDataPacket) => ({
      id: row.id as number,
      productId: row.productId as number | null,
      name: row.name as string,
      image: (row.image as string | null) ?? null,
      price: parseFloat(row.price as string),
      quantity: row.quantity as number,
      lineTotal: parseFloat(row.lineTotal as string),
    })),
  };
};
