import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL_NEW } from './config';

const CadastroAudio = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        usuarioId: '',
        categoria: '',
        duracao: '',
        status: 'ativo'
    });
    const [arquivo, setArquivo] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    const categorias = [
        'Música',
        'Podcast',
        'Aula',
        'Entrevista',
        'Outros'
    ];

    useEffect(() => {
        fetchUsuarios();
        if (id) {
            setIsEdit(true);
            fetchAudio();
        }
    }, [id]);

    const fetchUsuarios = async () => {
        try {
            const response = await fetch(`${API_BASE_URL_NEW}/users`);
            if (response.ok) {
                const data = await response.json();
                setUsuarios(data);
            }
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            toast.error('Erro ao carregar usuários');
        }
    };

    const fetchAudio = async () => {
        try {
            const response = await fetch(`${API_BASE_URL_NEW}/audios/${id}`);
            if (response.ok) {
                const audio = await response.json();
                setFormData({
                    titulo: audio.titulo || '',
                    descricao: audio.descricao || '',
                    usuarioId: audio.usuarioId || '',
                    categoria: audio.categoria || '',
                    duracao: audio.duracao || '',
                    status: audio.status || 'ativo'
                });
            }
        } catch (error) {
            console.error('Erro ao buscar áudio:', error);
            toast.error('Erro ao carregar dados do áudio');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setArquivo(file);

            // Calcular duração do áudio se possível
            const audio = new Audio();
            audio.src = URL.createObjectURL(file);
            audio.addEventListener('loadedmetadata', () => {
                const duracao = Math.round(audio.duration);
                const minutos = Math.floor(duracao / 60);
                const segundos = duracao % 60;
                setFormData(prev => ({
                    ...prev,
                    duracao: `${minutos}:${segundos.toString().padStart(2, '0')}`
                }));
                URL.revokeObjectURL(audio.src);
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();

            // Adicionar dados do formulário
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Adicionar arquivo se selecionado
            if (arquivo) {
                formDataToSend.append('arquivo', arquivo);
            }

            const url = isEdit 
                ? `${API_BASE_URL_NEW}/audios/${id}`
                : `${API_BASE_URL_NEW}/audios`;

            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                body: formDataToSend
            });

            const data = await response.json();

            if (response.ok) {
                if (data.exists) {
                    toast.warning(data.message);
                } else {
                    toast.success(isEdit ? 'Áudio atualizado com sucesso!' : 'Áudio cadastrado com sucesso!');
                    navigate('/audio');
                }
            } else {
                toast.error(data.error || 'Erro ao salvar áudio');
            }
        } catch (error) {
            console.error('Erro ao salvar áudio:', error);
            toast.error('Erro interno do servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-main-body">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
                <h6 className="fw-semibold mb-0">{isEdit ? 'Editar' : 'Cadastrar'} Áudio</h6>
            </div>

            <div className="row gy-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Informações do Áudio</h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row gy-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Título</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="titulo"
                                            value={formData.titulo}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Categoria</label>
                                        <select
                                            className="form-control"
                                            name="categoria"
                                            value={formData.categoria}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Selecione uma categoria</option>
                                            {categorias.map(categoria => (
                                                <option key={categoria} value={categoria}>
                                                    {categoria}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-12">
                                        <label className="form-label">Descrição</label>
                                        <textarea
                                            className="form-control"
                                            name="descricao"
                                            rows="3"
                                            value={formData.descricao}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Usuário Responsável</label>
                                        <select
                                            className="form-control"
                                            name="usuarioId"
                                            value={formData.usuarioId}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Selecione um usuário</option>
                                            {usuarios.map(usuario => (
                                                <option key={usuario.id} value={usuario.id}>
                                                    {usuario.nome} - {usuario.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Duração</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="duracao"
                                            value={formData.duracao}
                                            onChange={handleInputChange}
                                            placeholder="mm:ss"
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-control"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="ativo">Ativo</option>
                                            <option value="inativo">Inativo</option>
                                        </select>
                                    </div>

                                    <div className="col-md-12">
                                        <label className="form-label">Arquivo de Áudio</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            accept="audio/*"
                                            onChange={handleFileChange}
                                            required={!isEdit}
                                        />
                                        <small className="form-text text-muted">
                                            Formatos aceitos: MP3, WAV, OGG, etc.
                                        </small>
                                    </div>

                                    <div className="col-md-12">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Cadastrar')} Áudio
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary ms-2"
                                            onClick={() => navigate('/audio')}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CadastroAudio;