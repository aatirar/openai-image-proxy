import formidable from 'formidable';
import FormData from 'form-data';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Parse multipart/form-data with formidable
    const form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('❌ Parsing error:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      console.log('👉 Fields:', fields);
      console.log('👉 Files:', files);

      const prompt = fields.prompt;

      if (!files.image1 || !files.image2) {
        return res.status(400).json({ error: 'Both image1 and image2 are required' });
      }

      const openaiForm = new FormData();

      openaiForm.append('model', 'gpt-image-1');
      openaiForm.append('prompt', prompt);

      openaiForm.append('image[]', fs.createReadStream(files.image1[0].filepath), {
        filename: files.image1[0].originalFilename,
        contentType: files.image1[0].mimetype,
      });

      openaiForm.append('image[]', fs.createReadStream(files.image2[0].filepath), {
        filename: files.image2[0].originalFilename,
        contentType: files.image2[0].mimetype,
      });

      console.log('👉 Sending request to OpenAI');

      const response = await axios.post(
        'https://api.openai.com/v1/images/edits',
        openaiForm,
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            ...openaiForm.getHeaders(),
          },
          responseType: 'arraybuffer',
        }
      );

      res.setHeader('Content-Type', 'image/png');
      return res.status(200).send(response.data);
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ error: 'Error processing the request' });
  }
}

import fs from 'fs';
