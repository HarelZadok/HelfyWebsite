import { Router } from 'express';
import * as productController from '../controllers/productController';

const router = Router();

router.get('/', productController.listCategories);

export default router;
