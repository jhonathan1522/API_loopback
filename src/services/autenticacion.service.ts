import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Llaves} from '../config/llaves';
import {Cliente} from '../models';
import {ClienteRepository} from '../repositories';
const generatePassword = require('password-generator');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
    @repository(ClienteRepository)
    public clienteRepository: ClienteRepository,
  ) {}

  /*
   * Add service methods here
   */

  generarClaveAleatorio = (): string => {
    const claveGenerada = generatePassword(12, false); //Genero Clave de 12 caracteres
    return claveGenerada;
  };

  cifrarClave = (clave: string): string => {
    return CryptoJS.MD5(clave).toString();
  };

  identificarPersona = (usuario: string, clave: string) => {
    try {
      const p = this.clienteRepository.findOne({
        where: {username: usuario, clave: clave},
      });
      if (p) {
        return p;
      }
      return false;
    } catch {
      return false;
    }
  };

  generarTokenJWT(cliente: Cliente) {
    const token = jwt.sign(
      {
        data: {
          id: cliente.id,
          username: cliente.username,
        },
      },
      Llaves.claveJWT,
    );
    return token;
  }

  validarTokenJWT(token: string) {
    try {
      const datos = jwt.verify(token, Llaves.claveJWT);
      return datos;
    } catch {
      return false;
    }
  }
}
