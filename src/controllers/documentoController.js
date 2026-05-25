const Documento = require('../models/Documento');
const Proyecto = require('../models/Proyecto');
const Usuario = require('../models/Usuario');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { notificarMiembros } = require('./notificacionController');

let io;
const setIo = (socketIo) => { io = socketIo; };

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'src/uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const nombreUnico = `${Date.now()}-${file.originalname}`;
    cb(null, nombreUnico);
  }
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /pdf|doc|docx|xls|xlsx|csv|txt|png|jpg|jpeg/;
  const extension = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
  if (extension) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'));
  }
};

const upload = multer({ storage, fileFilter });

// SUBIR DOCUMENTO
const subirDocumento = async (req, res) => {
  try {
    const { nombre, descripcion, tipo, proyectoId } = req.body;

    const proyecto = await Proyecto.findByPk(proyectoId);
    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se subió ningún archivo' });
    }

    const documento = await Documento.create({
      nombre,
      descripcion,
      tipo,
      ruta: req.file.path,
      tamanio: req.file.size,
      proyectoId,
      autorId: req.usuario.id
    });

   // Notificar a miembros del proyecto
await notificarMiembros(io, proyectoId, {
  titulo: '📄 Nuevo documento',
  mensaje: `Se subió el documento "${nombre}" en el proyecto`,
  tipo: 'nuevo_documento',
  excluirUsuarioId: req.usuario.id
});

res.status(201).json({ mensaje: 'Documento subido exitosamente', documento });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// OBTENER DOCUMENTOS DE UN PROYECTO
const obtenerDocumentos = async (req, res) => {
  try {
    const { proyectoId } = req.params;
    const documentos = await Documento.findAll({
      where: { proyectoId },
      include: [
        { model: Usuario, as: 'autor', attributes: ['id', 'nombre', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(documentos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// OBTENER UN DOCUMENTO
const obtenerDocumento = async (req, res) => {
  try {
    const documento = await Documento.findByPk(req.params.id, {
      include: [
        { model: Usuario, as: 'autor', attributes: ['id', 'nombre', 'email'] },
        { model: Proyecto, as: 'proyecto', attributes: ['id', 'titulo'] }
      ]
    });

    if (!documento) {
      return res.status(404).json({ mensaje: 'Documento no encontrado' });
    }

    res.json(documento);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// DESCARGAR DOCUMENTO
const descargarDocumento = async (req, res) => {
  try {
    const documento = await Documento.findByPk(req.params.id);
    if (!documento) {
      return res.status(404).json({ mensaje: 'Documento no encontrado' });
    }

    res.download(documento.ruta, documento.nombre);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// ELIMINAR DOCUMENTO (solo autor o admin)
const eliminarDocumento = async (req, res) => {
  try {
    const documento = await Documento.findByPk(req.params.id);
    if (!documento) {
      return res.status(404).json({ mensaje: 'Documento no encontrado' });
    }

    if (req.usuario.rol !== 'admin' && documento.autorId !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para eliminar este documento' });
    }

    // Eliminar archivo físico
    if (fs.existsSync(documento.ruta)) {
      fs.unlinkSync(documento.ruta);
    }

    await documento.destroy();
    res.json({ mensaje: 'Documento eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  setIo,
  upload,
  subirDocumento,
  obtenerDocumentos,
  obtenerDocumento,
  descargarDocumento,
  eliminarDocumento
};