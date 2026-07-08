import { Photo } from '../types';

export const CATEGORIES = {
  all: { pt: 'Todos', es: 'Todos' },
  cinematic: { pt: 'Cinematografia', es: 'Cinematografía' },
  editorial: { pt: 'Moda & Editorial', es: 'Moda y Editorial' },
  portrait: { pt: 'Retrato', es: 'Retrato' },
  minimal: { pt: 'Minimalista', es: 'Minimalista' }
};

export const PHOTOS: Photo[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
    title: {
      pt: 'Sussurros de Luz',
      es: 'Susurros de Luz'
    },
    category: 'cinematic',
    aspectRatio: 'portrait',
    description: {
      pt: 'Um estudo íntimo de luz e sombra, destacando a expressão e elegância clássica.',
      es: 'Un estudio íntimo de luz y sombra, destacando la expresión y la elegancia clásica.'
    },
    year: '2026',
    location: 'Canoas, RS'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1000&auto=format&fit=crop',
    title: {
      pt: 'O Clássico Eterno',
      es: 'El Clásico Eterno'
    },
    category: 'cinematic',
    aspectRatio: 'landscape',
    description: {
      pt: 'Uma cena com estética de cinema noir, onde o carro clássico evoca mistério e nostalgia na névoa urbana.',
      es: 'Una escena con estética de cine negro, donde el coche clásico evoca misterio y nostalgia en la niebla urbana.'
    },
    year: '2025',
    location: 'Gramado, RS'
  }
];
