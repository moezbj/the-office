import api from './api';
import { Bill } from '../types';


export const createBill = (data: any) => 
  api.post<Bill>('/bills', data).then(res => res.data);
