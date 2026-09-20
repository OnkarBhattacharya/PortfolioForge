'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { PostgrestQueryBuilder } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseClient;
}

// Collection reference - mimics Firebase's collection()
export function collection<T = any>(path: string) {
  const supabase = getSupabase();
  return supabase.from(path);
}

// Document reference - mimics Firebase's doc()
export function doc<T = any>(path: string, ...segments: string[]): any {
  const fullPath = [path, ...segments].join('/');
  const supabase = getSupabase();
  // Extract table and ID from path
  const parts = fullPath.split('/');
  if (parts.length >= 2) {
    const table = parts[0];
    const id = parts.slice(1).join('/');
    return {
      id,
      path: fullPath,
      get: async () => {
        const { data, error } = await getSupabase()
          .from(table)
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        return { data: data ? { ...data, id } : null, exists: !!data };
      },
      update: async (data: any) => {
        const { error } = await getSupabase()
          .from(table)
          .update(data)
          .eq('id', id);
        if (error) throw error;
      },
      delete: async () => {
        const { error } = await getSupabase()
          .from(table)
          .delete()
          .eq('id', id);
        if (error) throw error;
      },
      set: async (data: any) => {
        const { error } = await getSupabase()
          .from(table)
          .upsert({ id, ...data });
        if (error) throw error;
      },
    };
  }
  throw new Error(`Invalid doc path: ${fullPath}`);
}

// Query - mimics Firebase's query()
export function query<T = any>(ref: any, ...constraints: any[]): any {
  let query = ref;
  
  for (const constraint of constraints) {
    if (constraint.type === 'where') {
      query = query.eq(constraint.field, constraint.value);
    } else if (constraint.type === 'limit') {
      query = query.limit(constraint.limit);
    } else if (constraint.type === 'orderBy') {
      query = query.order(constraint.field, { ascending: constraint.direction === 'asc' });
    }
  }
  
  return {
    get: async () => {
      const { data, error } = await query;
      if (error) throw error;
      return {
        docs: data?.map((item: any) => ({
          id: item.id,
          data: () => item,
        })) || [],
        empty: !data || data.length === 0,
        size: data?.length || 0,
      };
    },
    onSnapshot: (callback: any) => {
      // Supabase realtime subscription
      const channel = getSupabase()
        .channel('realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: getTableName(ref) }, () => {
          query.then((result: any) => callback({
            docs: result?.data?.map((item: any) => ({
              id: item.id,
              data: () => item,
            })) || [],
            empty: !result?.data || result.data.length === 0,
            size: result?.data?.length || 0,
          }));
        })
        .subscribe();
      
      return () => {
        getSupabase().removeChannel(channel);
      };
    },
  };
  
  return query;
}

// where() constraint
export function where(field: string, operator: string, value: any) {
  return { type: 'where', field, operator, value };
}

// limit() constraint
export function limit(limit: number) {
  return { type: 'limit', limit };
}

// orderBy() constraint
export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
  return { type: 'orderBy', field, direction };
}

// Helper to extract table name from ref
function getTableName(ref: any): string {
  if (ref?.from) return ref.from;
  if (ref?.table) return ref.table;
  return '';
}

// onSnapshot - mimics Firebase's onSnapshot
export function onSnapshot<T = any>(ref: any, callback: (snapshot: any) => void): () => void {
  const query = ref.get();
  const { data, error } = query;
  
  if (error) throw error;
  
  callback({
    docs: data?.map((item: any) => ({
      id: item.id,
      data: () => item,
    })) || [],
    empty: !data || data.length === 0,
    size: data?.length || 0,
  });
  
  // Set up realtime subscription
  const channel = getSupabase()
    .channel('realtime')
    .on('postgres_changes', { event: '*', schema: 'public' }, () => {
      ref.get().then((result: any) => {
        callback({
          docs: result?.data?.map((item: any) => ({
            id: item.id,
            data: () => item,
          })) || [],
          empty: !result?.data || result.data.length === 0,
          size: result?.data?.length || 0,
        });
      });
    })
    .subscribe();
  
  return () => {
    getSupabase().removeChannel(channel);
  };
}

// getDocs - mimics Firebase's getDocs
export async function getDocs<T = any>(query: any): Promise<{
  docs: Array<{ id: string; data: () => T }>;
  empty: boolean;
  size: number;
}> {
  const { data, error } = await query;
  if (error) throw error;
  return {
    docs: data?.map((item: any) => ({
      id: item.id,
      data: () => item,
    })) || [],
    empty: !data || data.length === 0,
    size: data?.length || 0,
  };
}

// addDoc - mimics Firebase's addDoc
export async function addDoc(ref: any, data: any): Promise<{ id: string }> {
  const { data: newData, error } = await ref.insert(data).select('id').single();
  if (error) throw error;
  return { id: newData.id };
}

// updateDoc - mimics Firebase's updateDoc
export async function updateDoc(ref: any, data: any): Promise<void> {
  const { error } = await ref.update(data);
  if (error) throw error;
}

// deleteDoc - mimics Firebase's deleteDoc
export async function deleteDoc(ref: any): Promise<void> {
  const { error } = await ref.delete();
  if (error) throw error;
}

// setDoc - mimics Firebase's setDoc
export async function setDoc(ref: any, data: any): Promise<void> {
  const { error } = await ref.upsert(data);
  if (error) throw error;
}

// getDoc - mimics Firebase's getDoc
export async function getDoc(ref: any): Promise<{
  id: string;
  data: () => any;
  exists: boolean;
}> {
  const { data, error } = await ref.get();
  if (error) throw error;
  return {
    id: data.id,
    data: () => data,
    exists: !!data,
  };
}

// serverTimestamp - mimics Firebase's serverTimestamp
export const serverTimestamp = () => new Date().toISOString();