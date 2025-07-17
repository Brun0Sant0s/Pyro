import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  UploadCloud,
  Download,
  FileText,
  Trash2,
  CheckCircle,
  Image,
  FileSpreadsheet,
  FileSignature,
  FileArchive,
  FileCode,
  File
} from 'lucide-react';

function Documentos({ token, role }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [newObservation, setNewObservation] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileAdded, setFileAdded] = useState(false);

  const fetchFiles = () => {
    axios.get('http://localhost:3001/documents', {
      headers: { Authorization: token }
    }).then(res => setFiles(res.data));
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleSelectFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setFileAdded(true);
    setNewObservation('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('observation', newObservation);

    setUploading(true);
    try {
      await axios.post('http://localhost:3001/documents', formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSelectedFile(null);
      setNewObservation('');
      setFileAdded(false);
      fetchFiles();
    } catch (err) {
      console.error('Erro no upload:', err);
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (filename) => {
    try {
      await axios.delete(`http://localhost:3001/documents/${filename}`, {
        headers: { Authorization: token }
      });
      fetchFiles();
    } catch (err) {
      console.error('Erro ao eliminar:', err);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return <FileSignature className="w-5 h-5 text-white mt-1 shrink-0" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif': return <Image className="w-5 h-5 text-white mt-1 shrink-0" />;
      case 'doc':
      case 'docx': return <FileText className="w-5 h-5 text-white mt-1 shrink-0" />;
      case 'xls':
      case 'xlsx': return <FileSpreadsheet className="w-5 h-5 text-white mt-1 shrink-0" />;
      case 'zip':
      case 'rar': return <FileArchive className="w-5 h-5 text-white mt-1 shrink-0" />;
      case 'js':
      case 'html':
      case 'css': return <FileCode className="w-5 h-5 text-white mt-1 shrink-0" />;
      case 'txt': return <FileText className="w-5 h-5 text-white mt-1 shrink-0" />;
      default: return <File className="w-5 h-5 text-white mt-1 shrink-0" />;
    }
  };

  return (
    <div className="max-w-10xl mx-auto space-y-10 text-white">
      {role?.toLowerCase().trim() === 'boss' && (
        <section className="bg-[#1a1a1a] border border-[#2c2c2c] p-6 rounded-lg space-y-4">
          <h3 className="text-lg font-bold text-red-500 flex items-center gap-2 mb-6">📄 Importar Documento</h3>

          {!fileAdded && (
            <label className="cursor-pointer">
              <div className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 px-5 py-3 rounded text-white font-semibold w-full sm:w-fit transition">
                <UploadCloud className="w-5 h-5" />
                <span>Selecionar Ficheiro</span>
              </div>
              <input
                type="file"
                onChange={handleSelectFile}
                className="hidden"
                accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
              />
            </label>
          )}

          {fileAdded && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="truncate">{selectedFile?.name}</span>
              </div>

              <input
                type="text"
                className="bg-[#2a2a2a] text-white p-3 rounded w-full"
                placeholder="Observações (opcional)"
                value={newObservation}
                onChange={e => setNewObservation(e.target.value)}
              />

              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`w-full sm:w-auto bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-semibold transition ${uploading ? 'opacity-70 cursor-wait' : ''}`}
              >
                {uploading ? 'A carregar...' : 'Carregar Documento'}
              </button>
            </div>
          )}
        </section>
      )}

      <section className="bg-[#1a1a1a] border border-[#2c2c2c] p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-red-500 mb-6 flex items-center gap-2">
          📁 Documentos Disponíveis
        </h2>

        {files.length === 0 ? (
          <p className="text-gray-400 italic">Nenhum documento encontrado.</p>
        ) : (
          <ul className="space-y-6">
            {files.map((file, idx) => (
              <li key={idx} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-[#2e2e2e] pb-4">
                <div className="flex items-start gap-2 flex-1">
                  {getFileIcon(file.originalname)}
                  <div>
                    <span className="text-white break-all text-base font-medium">
                      {file.originalname}
                    </span>
                    <p className="text-sm text-gray-400 italic mt-1">
                      Observação:{' '}
                      <span className={file.observation?.trim() ? '' : 'text-gray-500'}>
                        {file.observation?.trim() || '—'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:mt-1 w-full sm:w-auto">
                  <a
                    href={`http://localhost:3001/uploads/${file.filename}`}
                    download
                    title="Download"
                    className="w-full sm:w-auto bg-neutral-700 hover:bg-neutral-600 text-white py-2 px-3 rounded flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span className="sm:hidden">Download</span>
                  </a>

                  {role?.toLowerCase().trim() === 'boss' && (
                    <button
                      onClick={() => deleteFile(file.filename)}
                      title="Eliminar documento"
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="sm:hidden">Remover</span>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Documentos;