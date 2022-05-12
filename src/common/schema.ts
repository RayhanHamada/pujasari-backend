import { Type } from '@sinclair/typebox';

export const AvailableBankSchema = Type.Union(
  [Type.Literal('BNI'), Type.Literal('BCA')],
  {
    description: 'Tipe bank yang dapat digunakan',
  }
);

export const AvailablePaymentMethodSchema = Type.Union(
  [Type.Literal('VirtualAccount'), Type.Literal('Cash')],
  {
    description: 'Jenis metode pembayaran yang dapat dilakukan',
  }
);

export const AvailableKategoriProduct = Type.Union(
  [
    Type.Literal('daging'),
    Type.Literal('sayur'),
    Type.Literal('buah'),
    Type.Literal('rempah'),
    Type.Literal('paket'),
  ],
  {
    description: 'Kategori produk yang tersedia',
  }
);

export const StatusPemesanan = Type.Union(
  [
    Type.Literal('Menunggu_Pembayaran'),
    Type.Literal('Dikirim'),
    Type.Literal('Sampai'),
  ],
  {
    description: 'Status pemesanan produk',
  }
);

export const DefaultResponse204Schema = Type.Object(
  {},
  {
    description: 'Success. No Content',
  }
);

export const DefaultResponse404Schema = Type.Object(
  {
    statusCode: Type.Literal(404),
    error: Type.Literal('Not Found'),
    message: Type.String(),
  },
  {
    description: 'Item Not Found',
  }
);

export const DefaultResponse400Schema = Type.Object(
  {
    statusCode: Type.Literal(400),
    error: Type.Literal('Bad Request'),
    message: Type.String(),
  },
  {
    description: 'Bad Request',
  }
);
