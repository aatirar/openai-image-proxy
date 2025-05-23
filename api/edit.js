const formidable = require('formidable');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

module.exports = async (req, res) => {
  const form = new formidable.IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error parsing the files' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('model', 'gpt-image-1');
      formData.append('prompt', fields.prompt);

      const images = Array.isArray(files.image) ? files.image : [files.image];
      images.forEach((image) => {
        formData.append('image[]', fs.createReadStream(image.path), image.name);
      });

      const response = await axios.post('https://api.openai.com/v1/images/edits', formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        responseType: 'arraybuffer',
      });

      res.setHeader('Content-Type', 'image/png');
      res.send(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Error processing the request' });
    }
  });
};
