import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '../../auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return res.status(401).json({ error: 'Yetkisiz' });
    }
    return res.status(200).json({ message: 'Authentication başarıyla geçti.', user });
  } catch (error) {
    return res.status(500).json({ error: 'Sunucu hatası', details: error });
  }
}
