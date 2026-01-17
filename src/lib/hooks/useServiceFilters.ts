'use client';
import { useState, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import type { Service } from '../types/service';

export type ServiceSortBy = 'nombre' | 'precio' | 'tiempo' | 'fecha';
export type SortOrder = 'asc' | 'desc';

export function useServiceFilters(servicios: Service[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<ServiceSortBy>('nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

  const getFilteredAndSortedServices = useCallback(() => {
    let filtered = servicios.filter(servicio => {
      const matchesSearch =
        servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        servicio.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesPrice = true;
      if (priceRange.min || priceRange.max) {
        const precio = parseFloat(servicio.precio.replace(/[^\d.]/g, ''));
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        matchesPrice = precio >= min && precio <= max;
      }

      return matchesSearch && matchesPrice;
    });

    filtered.sort((a, b) => {
      let valueA: string | number;
      let valueB: string | number;

      switch (sortBy) {
        case 'nombre':
          valueA = a.nombre.toLowerCase();
          valueB = b.nombre.toLowerCase();
          break;
        case 'precio':
          valueA = parseFloat(a.precio.replace(/[^\d.]/g, ''));
          valueB = parseFloat(b.precio.replace(/[^\d.]/g, ''));
          break;
        case 'tiempo':
          valueA = a.tiempo.toLowerCase();
          valueB = b.tiempo.toLowerCase();
          break;
        case 'fecha':
          // Handle both Timestamp and Date types
          valueA = a.createdAt instanceof Timestamp
            ? a.createdAt.seconds
            : a.createdAt instanceof Date
            ? a.createdAt.getTime() / 1000
            : 0;
          valueB = b.createdAt instanceof Timestamp
            ? b.createdAt.seconds
            : b.createdAt instanceof Date
            ? b.createdAt.getTime() / 1000
            : 0;
          break;
        default:
          valueA = a.nombre.toLowerCase();
          valueB = b.nombre.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

    return filtered;
  }, [servicios, searchTerm, priceRange, sortBy, sortOrder]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setPriceRange({ min: '', max: '' });
    setSortBy('nombre');
    setSortOrder('asc');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    priceRange,
    setPriceRange,
    getFilteredAndSortedServices,
    clearFilters,
  };
}
