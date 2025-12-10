import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { filterInvitados } from '../utils/filterUtils';
import { type Invitado } from '../lib/supabaseClient';

describe('InvitadosList', () => {
  // Feature: event-checkin, Property 1: Filtrado de búsqueda es inclusivo
  // Validates: Requirements 1.3
  it('property: todos los resultados filtrados contienen el término de búsqueda (case-insensitive)', () => {
    fc.assert(
      fc.property(
        // Generate random list of invitados
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            nro: fc.integer({ min: 1, max: 10000 }),
            nombre_apellido: fc.string({ minLength: 1, maxLength: 50 }),
            ingreso: fc.string(),
            confirmacion: fc.string(),
            gastos_pendientes: fc.string(),
            monto: fc.float(),
            codigo_entrada: fc.uuid(),
            confirmado: fc.boolean(),
            escaner: fc.option(fc.string(), { nil: null }),
            fecha_ingreso: fc.option(fc.string(), { nil: null }),
            hora_ingreso: fc.option(fc.string(), { nil: null }),
          })
        ),
        // Generate random search term (non-empty after trim)
        fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
        (invitados, searchTerm) => {
          const results = filterInvitados(invitados as Invitado[], searchTerm);
          
          // All results must contain the search term (case-insensitive) in name or code
          const lowerSearchTerm = searchTerm.toLowerCase();
          return results.every(invitado =>
            invitado.nombre_apellido.toLowerCase().includes(lowerSearchTerm) ||
            invitado.codigo_entrada.toLowerCase().includes(lowerSearchTerm)
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  // Unit test: búsqueda con término que coincide
  it('unit: búsqueda con término que coincide retorna resultados correctos', () => {
    const invitados: Invitado[] = [
      {
        id: 1,
        nro: 1,
        nombre_apellido: 'Juan Pérez',
        ingreso: 'Sí',
        confirmacion: 'Confirmado',
        gastos_pendientes: 'No',
        monto: 0,
        codigo_entrada: '123e4567-e89b-12d3-a456-426614174000',
        confirmado: true,
        escaner: null,
        fecha_ingreso: null,
        hora_ingreso: null,
      },
      {
        id: 2,
        nro: 2,
        nombre_apellido: 'María García',
        ingreso: 'Sí',
        confirmacion: 'Confirmado',
        gastos_pendientes: 'No',
        monto: 0,
        codigo_entrada: '223e4567-e89b-12d3-a456-426614174001',
        confirmado: true,
        escaner: null,
        fecha_ingreso: null,
        hora_ingreso: null,
      },
      {
        id: 3,
        nro: 3,
        nombre_apellido: 'Pedro Martínez',
        ingreso: 'Sí',
        confirmacion: 'Pendiente',
        gastos_pendientes: 'No',
        monto: 0,
        codigo_entrada: '323e4567-e89b-12d3-a456-426614174002',
        confirmado: false,
        escaner: null,
        fecha_ingreso: null,
        hora_ingreso: null,
      },
    ];

    const results = filterInvitados(invitados, 'juan');
    expect(results).toHaveLength(1);
    expect(results[0].nombre_apellido).toBe('Juan Pérez');
  });

  // Unit test: búsqueda sin coincidencias retorna array vacío
  it('unit: búsqueda sin coincidencias retorna array vacío', () => {
    const invitados: Invitado[] = [
      {
        id: 1,
        nro: 1,
        nombre_apellido: 'Juan Pérez',
        ingreso: 'Sí',
        confirmacion: 'Confirmado',
        gastos_pendientes: 'No',
        monto: 0,
        codigo_entrada: '123e4567-e89b-12d3-a456-426614174000',
        confirmado: true,
        escaner: null,
        fecha_ingreso: null,
        hora_ingreso: null,
      },
    ];

    const results = filterInvitados(invitados, 'xyz123');
    expect(results).toHaveLength(0);
  });

  // Unit test: búsqueda con string vacío muestra todos los invitados
  it('unit: búsqueda con string vacío muestra todos los invitados', () => {
    const invitados: Invitado[] = [
      {
        id: 1,
        nro: 1,
        nombre_apellido: 'Juan Pérez',
        ingreso: 'Sí',
        confirmacion: 'Confirmado',
        gastos_pendientes: 'No',
        monto: 0,
        codigo_entrada: '123e4567-e89b-12d3-a456-426614174000',
        confirmado: true,
        escaner: null,
        fecha_ingreso: null,
        hora_ingreso: null,
      },
      {
        id: 2,
        nro: 2,
        nombre_apellido: 'María García',
        ingreso: 'Sí',
        confirmacion: 'Confirmado',
        gastos_pendientes: 'No',
        monto: 0,
        codigo_entrada: '223e4567-e89b-12d3-a456-426614174001',
        confirmado: true,
        escaner: null,
        fecha_ingreso: null,
        hora_ingreso: null,
      },
    ];

    const results = filterInvitados(invitados, '');
    expect(results).toHaveLength(2);
    expect(results).toEqual(invitados);
  });
});
