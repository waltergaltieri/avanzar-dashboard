import { type Invitado } from '../lib/supabaseClient';

export function filterInvitados(invitados: Invitado[], searchTerm: string): Invitado[] {
  if (!searchTerm.trim()) {
    return invitados;
  }
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return invitados.filter(invitado =>
    invitado.nombre_apellido.toLowerCase().includes(lowerSearchTerm) ||
    invitado.codigo_entrada.toLowerCase().includes(lowerSearchTerm)
  );
}