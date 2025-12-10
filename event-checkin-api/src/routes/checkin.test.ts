import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import request from 'supertest';
import app from '../server';
import { supabase } from '../lib/supabaseClient';

describe('Check-in endpoint', () => {
  // Feature: event-checkin, Property 3: Código inválido retorna error
  // Validates: Requirements 3.2
  it('should return error for invalid codigo_entrada (property test)', async () => {
    await fc.assert(
      fc.asyncProperty(fc.uuid(), async (randomUuid) => {
        const response = await request(app)
          .post('/api/check-in')
          .send({
            codigo_entrada: randomUuid,
            escaner: 'test_scanner'
          });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          status: 'error',
          message: 'codigo_invalido'
        });
      }),
      { numRuns: 100 }
    );
  }, 60000);

  // Feature: event-checkin, Property 4: Primer check-in actualiza registro
  // Validates: Requirements 3.3, 3.4
  it('should update record on first check-in (property test)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.uuid(),
        fc.integer({ min: 100000, max: 999999 }),
        async (nombreApellido, codigoEntrada, nro) => {
          // Create a test invitado without fecha_ingreso
          const { error: insertError } = await supabase
            .from('avanzar_entradas')
            .insert({
              nro,
              nombre_apellido: nombreApellido,
              codigo_entrada: codigoEntrada,
              ingreso: 'test',
              confirmacion: 'test',
              gastos_pendientes: 'test',
              monto: 0,
              fecha_ingreso: null,
              hora_ingreso: null,
              escaner: null
            });

          if (insertError) {
            // Skip if insert fails (e.g., duplicate UUID)
            return true;
          }

          try {
            // Perform check-in
            const response = await request(app)
              .post('/api/check-in')
              .send({
                codigo_entrada: codigoEntrada,
                escaner: 'test_scanner'
              });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ok');
            expect(response.body.nombre_apellido).toBe(nombreApellido);
            expect(response.body.fecha_ingreso).toBeTruthy();
            expect(response.body.hora_ingreso).toBeTruthy();

            // Verify the record was updated in the database
            const { data: updatedInvitado } = await supabase
              .from('avanzar_entradas')
              .select('*')
              .eq('codigo_entrada', codigoEntrada)
              .single();

            expect(updatedInvitado?.fecha_ingreso).toBeTruthy();
            expect(updatedInvitado?.hora_ingreso).toBeTruthy();
            expect(updatedInvitado?.escaner).toBe('test_scanner');
          } finally {
            // Clean up: delete the test record
            await supabase
              .from('avanzar_entradas')
              .delete()
              .eq('codigo_entrada', codigoEntrada);
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 120000);

  // Feature: event-checkin, Property 5: Check-in duplicado preserva datos originales
  // Validates: Requirements 3.5
  it('should preserve original data on duplicate check-in (property test)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 50 }),
        fc.uuid(),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime())),
        fc.integer({ min: 100000, max: 999999 }),
        async (nombreApellido, codigoEntrada, fechaIngreso, nro) => {
          const fechaIngresoStr = fechaIngreso.toISOString().split('T')[0];
          const horaIngresoStr = '10:30:00';
          const originalEscaner = 'original_scanner';

          // Create a test invitado with fecha_ingreso already set
          const { error: insertError } = await supabase
            .from('avanzar_entradas')
            .insert({
              nro,
              nombre_apellido: nombreApellido,
              codigo_entrada: codigoEntrada,
              ingreso: 'test',
              confirmacion: 'test',
              gastos_pendientes: 'test',
              monto: 0,
              fecha_ingreso: fechaIngresoStr,
              hora_ingreso: horaIngresoStr,
              escaner: originalEscaner
            });

          if (insertError) {
            // Skip if insert fails (e.g., duplicate UUID)
            return true;
          }

          try {
            // Attempt duplicate check-in
            const response = await request(app)
              .post('/api/check-in')
              .send({
                codigo_entrada: codigoEntrada,
                escaner: 'new_scanner'
              });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ya_registrado');
            expect(response.body.nombre_apellido).toBe(nombreApellido);
            expect(response.body.fecha_ingreso).toBe(fechaIngresoStr);
            expect(response.body.hora_ingreso).toBe(horaIngresoStr);

            // Verify the record was NOT modified in the database
            const { data: unchangedInvitado } = await supabase
              .from('avanzar_entradas')
              .select('*')
              .eq('codigo_entrada', codigoEntrada)
              .single();

            expect(unchangedInvitado?.fecha_ingreso).toBe(fechaIngresoStr);
            expect(unchangedInvitado?.hora_ingreso).toBe(horaIngresoStr);
            expect(unchangedInvitado?.escaner).toBe(originalEscaner);
          } finally {
            // Clean up: delete the test record
            await supabase
              .from('avanzar_entradas')
              .delete()
              .eq('codigo_entrada', codigoEntrada);
          }
        }
      ),
      { numRuns: 10 }
    );
  }, 120000);

  // Unit tests
  describe('validation', () => {
    it('should return 400 when codigo_entrada is missing', async () => {
      const response = await request(app)
        .post('/api/check-in')
        .send({ escaner: 'test_scanner' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('codigo_entrada is required');
    });

    it('should return 400 when escaner is missing', async () => {
      const response = await request(app)
        .post('/api/check-in')
        .send({ codigo_entrada: '123e4567-e89b-12d3-a456-426614174000' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('escaner is required');
    });

    it('should return 400 when UUID format is invalid', async () => {
      const response = await request(app)
        .post('/api/check-in')
        .send({
          codigo_entrada: 'invalid-uuid',
          escaner: 'test_scanner'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid UUID format');
    });
  });

  describe('check-in logic', () => {
    it('should return ok status on successful first check-in', async () => {
      const testUuid = 'a1b2c3d4-e5f6-4789-a012-3456789abcd1';
      const testNombre = 'Test User Unit 1';
      const testNro = 999991;

      // Create test record
      const { error: insertError } = await supabase.from('avanzar_entradas').insert({
        nro: testNro,
        nombre_apellido: testNombre,
        codigo_entrada: testUuid,
        ingreso: 'test',
        confirmacion: 'test',
        gastos_pendientes: 'test',
        monto: 0,
        fecha_ingreso: null,
        hora_ingreso: null,
        escaner: null
      });

      if (insertError) {
        console.error('Insert error:', insertError);
      }

      try {
        const response = await request(app)
          .post('/api/check-in')
          .send({
            codigo_entrada: testUuid,
            escaner: 'unit_test_scanner'
          });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
        expect(response.body.nombre_apellido).toBe(testNombre);
        expect(response.body.fecha_ingreso).toBeTruthy();
        expect(response.body.hora_ingreso).toBeTruthy();
      } finally {
        await supabase.from('avanzar_entradas').delete().eq('codigo_entrada', testUuid);
      }
    });

    it('should return ya_registrado status on duplicate check-in', async () => {
      const testUuid = 'a1b2c3d4-e5f6-4789-a012-3456789abcd2';
      const testNombre = 'Test User Unit 2';
      const testNro = 999992;
      const fechaIngreso = '2024-01-15';
      const horaIngreso = '14:30:00';

      // Create test record with existing check-in
      await supabase.from('avanzar_entradas').insert({
        nro: testNro,
        nombre_apellido: testNombre,
        codigo_entrada: testUuid,
        ingreso: 'test',
        confirmacion: 'test',
        gastos_pendientes: 'test',
        monto: 0,
        fecha_ingreso: fechaIngreso,
        hora_ingreso: horaIngreso,
        escaner: 'original_scanner'
      });

      try {
        const response = await request(app)
          .post('/api/check-in')
          .send({
            codigo_entrada: testUuid,
            escaner: 'unit_test_scanner'
          });

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ya_registrado');
        expect(response.body.nombre_apellido).toBe(testNombre);
        expect(response.body.fecha_ingreso).toBe(fechaIngreso);
        expect(response.body.hora_ingreso).toBe(horaIngreso);
      } finally {
        await supabase.from('avanzar_entradas').delete().eq('codigo_entrada', testUuid);
      }
    });

    it('should return error when codigo_entrada is not found', async () => {
      const nonExistentUuid = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

      const response = await request(app)
        .post('/api/check-in')
        .send({
          codigo_entrada: nonExistentUuid,
          escaner: 'unit_test_scanner'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('codigo_invalido');
    });
  });
});
