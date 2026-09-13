// Metro (el bundler de React Native) exige que require() reciba una ruta
// literal, no una variable — por eso no se puede usar directamente el string
// "posterImage" de la data para cargar una imagen local. Este mapa resuelve
// ese problema: cada código de película apunta a su imagen ya "requerida".
//
// Para agregar una película nueva al mock con poster real:
// 1. Pon el archivo .jpg/.png en assets/posters/
// 2. Agrega una línea aquí abajo con su código

export const posterMap: Record<string, any> = {
  'PEL-001': require('../../assets/posters/aven.jpg'),
  'PEL-002': require('../../assets/posters/spider.jpg'),
  'PEL-003': require('../../assets/posters/inter.jpg'),
  'PEL-004': require('../../assets/posters/titan.jpg'),
  'PEL-005': require('../../assets/posters/yat.jpg'),
  'PEL-006': require('../../assets/posters/conjuro.jpg'),
  'PEL-007': require('../../assets/posters/ts4.jpg'),
  'PEL-008': require('../../assets/posters/shrek.jpg'),
  'PEL-009': require('../../assets/posters/jurass.jpg'),
  'PEL-010': require('../../assets/posters/froz.jpg'),
  'PEL-011': require('../../assets/posters/jok.jpg'),
  'PEL-012': require('../../assets/posters/rf.jpg'),
  'PEL-013': require('../../assets/posters/int2.jpg'),
  'PEL-014': require('../../assets/posters/open.jpg'),
  'PEL-015': require('../../assets/posters/avatar.jpg'),
};
