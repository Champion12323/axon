import * as uploadService from './uploadService.js';

export const getPresignedUrl = async (req, res) => {
  const { uploadType, fileName, contentType, meta } = req.body;

  const result = await uploadService.getPresignedUploadUrl({
    uploadType,
    fileName,
    contentType,
    userId: req.user.id,
  });

  res.json({ success: true, data: result });
};

export const confirmUpload = async (req, res) => {
  const { uploadType, publicUrl, key, meta } = req.body;

  const result = await uploadService.confirmUpload({
    uploadType,
    publicUrl,
    key,
    meta: meta ?? {},
    userId: req.user.id,
  });

  res.json({ success: true, data: result });
};

export const deleteFile = async (req, res) => {
  const { key } = req.body;
  const result = await uploadService.deleteFile(key);
  res.json({ success: true, data: result });
};