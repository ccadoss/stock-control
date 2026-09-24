export type Role = 'admin' | 'staff';
export type TrackingMode = 'unit' | 'quantity';
export type ItemStatus = 'IN_STOCK' | 'OUT';

export interface Profile { id: string; full_name: string | null; role: Role; }
export interface Department { id: string; name: string; }
export interface Category { id: string; department_id: string; name: string; tracking_mode: TrackingMode; default_unit: string | null; }
export interface Item {
  id: string; code: string; name: string; department_id: string; category_id: string;
  tracking_mode: TrackingMode; status: ItemStatus; unit: string | null;
  initial_quantity: number; current_quantity: number; attributes: Record<string, unknown>;
  created_at: string;
}
