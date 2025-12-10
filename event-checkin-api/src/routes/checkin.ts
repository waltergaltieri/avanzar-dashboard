import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';

const router = Router();

interface CheckInRequest {
  codigo_entrada: string;
  escaner: string;
}

interface CheckInResponseOk {
  status: "ok";
  nombre_apellido: string;
  fecha_ingreso: string;
  hora_ingreso: string;
}

interface CheckInResponseYaRegistrado {
  status: "ya_registrado";
  nombre_apellido: string;
  fecha_ingreso: string;
  hora_ingreso: string;
}

interface CheckInResponseError {
  status: "error";
  message: "codigo_invalido";
}

type CheckInResponse = CheckInResponseOk | CheckInResponseYaRegistrado | CheckInResponseError;

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.post('/check-in', async (req: Request, res: Response) => {
  const { codigo_entrada, escaner } = req.body as Partial<CheckInRequest>;

  // Validate required fields
  if (!codigo_entrada) {
    return res.status(400).json({ error: 'codigo_entrada is required' });
  }

  if (!escaner) {
    return res.status(400).json({ error: 'escaner is required' });
  }

  // Validate UUID format
  if (!UUID_REGEX.test(codigo_entrada)) {
    return res.status(400).json({ error: 'Invalid UUID format' });
  }

  try {
    // Search for the record in avanzar_entradas
    const { data: invitado, error: fetchError } = await supabase
      .from('avanzar_entradas')
      .select('*')
      .eq('codigo_entrada', codigo_entrada)
      .single();

    // If not found, return error
    if (fetchError || !invitado) {
      const response: CheckInResponseError = {
        status: "error",
        message: "codigo_invalido"
      };
      return res.status(200).json(response);
    }

    // If fecha_ingreso is NULL, this is the first check-in
    if (invitado.fecha_ingreso === null) {
      const now = new Date();
      const fecha_ingreso = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const hora_ingreso = now.toTimeString().split(' ')[0]; // HH:MM:SS

      // Update the record
      const { error: updateError } = await supabase
        .from('avanzar_entradas')
        .update({
          fecha_ingreso,
          hora_ingreso,
          escaner
        })
        .eq('codigo_entrada', codigo_entrada);

      if (updateError) {
        return res.status(500).json({ error: 'Failed to update record' });
      }

      const response: CheckInResponseOk = {
        status: "ok",
        nombre_apellido: invitado.nombre_apellido,
        fecha_ingreso,
        hora_ingreso
      };
      return res.status(200).json(response);
    }

    // If fecha_ingreso is not NULL, already checked in
    const response: CheckInResponseYaRegistrado = {
      status: "ya_registrado",
      nombre_apellido: invitado.nombre_apellido,
      fecha_ingreso: invitado.fecha_ingreso,
      hora_ingreso: invitado.hora_ingreso
    };
    return res.status(200).json(response);

  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
