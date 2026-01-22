export interface BillingData {
  razonSocial: string;
  rfc: string;
  direccion: {
    calle: string;
    numeroExterior: string;
    numeroInterior: string;
    colonia: string;
    codigoPostal: string;
    municipio: string;
    estado: string;
  };
  email: string;
  telefono: string;
}

export interface BrandingData {
  nombreDespacho: string;
  slogan?: string;
  anoFundacion?: string;
  descripcion?: string;
  colores: {
    primario: string;
    secundario: string;
    terciario: string;
  };
  logoURL?: string;
  signatureBlock?: string;
}
