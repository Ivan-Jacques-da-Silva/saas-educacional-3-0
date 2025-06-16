import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

const API_BASE_URL = "http://localhost:3001/api";

const CadastroAudio = () => {
    const [formData, setFormData] = useState({
        titulo: "",
        cursoId: "",
        audioFile: null
    });
    const [cursos, setCursos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCursos();
    }, []);

    const fetchCursos = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/cursos`);
            const data = await response.json();
            setCursos(data);
        } catch (error) {
            console.error("Erro ao buscar cursos:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpar erro do campo quando usuário digita
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            audioFile: e.target.files[0]
        }));
        if (errors.audioFile) {
            setErrors(prev => ({
                ...prev,
                audioFile: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.titulo.trim()) {
            newErrors.titulo = "Título é obrigatório";
        }

        if (!formData.cursoId) {
            newErrors.cursoId = "Curso é obrigatório";
        }

        if (!formData.audioFile) {
            newErrors.audioFile = "Arquivo de áudio é obrigatório";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('titulo', formData.titulo);
            formDataToSend.append('cursoId', formData.cursoId);
            formDataToSend.append('audio', formData.audioFile);

            const response = await fetch(`${API_BASE_URL}/audios`, {
                method: 'POST',
                body: formDataToSend
            });

            if (!response.ok) {
                throw new Error('Erro ao cadastrar áudio');
            }

            // Reset form
            setFormData({
                titulo: "",
                cursoId: "",
                audioFile: null
            });

            // Reset file input
            const fileInput = document.getElementById('audioFile');
            if (fileInput) {
                fileInput.value = '';
            }

            alert('Áudio cadastrado com sucesso!');
        } catch (error) {
            console.error('Erro ao cadastrar áudio:', error);
            alert('Erro ao cadastrar áudio. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-header border-bottom bg-base py-16 px-24">
                <h6 className="text-lg fw-semibold mb-0">Cadastro de Áudio</h6>
            </div>
            <div className="card-body p-24">
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-sm-6">
                            <div className="mb-20">
                                <label htmlFor="titulo" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Título do Áudio <span className="text-danger-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    className={`form-control radius-8 ${errors.titulo ? 'is-invalid' : ''}`}
                                    id="titulo"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    placeholder="Digite o título do áudio"
                                />
                                {errors.titulo && (
                                    <div className="invalid-feedback">
                                        {errors.titulo}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-sm-6">
                            <div className="mb-20">
                                <label htmlFor="cursoId" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Curso <span className="text-danger-600">*</span>
                                </label>
                                <select
                                    className={`form-control radius-8 form-select ${errors.cursoId ? 'is-invalid' : ''}`}
                                    id="cursoId"
                                    name="cursoId"
                                    value={formData.cursoId}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Selecione um curso</option>
                                    {cursos.map((curso) => (
                                        <option key={curso.id} value={curso.id}>
                                            {curso.nome}
                                        </option>
                                    ))}
                                </select>
                                {errors.cursoId && (
                                    <div className="invalid-feedback">
                                        {errors.cursoId}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-sm-12">
                            <div className="mb-20">
                                <label htmlFor="audioFile" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                    Arquivo de Áudio <span className="text-danger-600">*</span>
                                </label>
                                <input
                                    type="file"
                                    className={`form-control radius-8 ${errors.audioFile ? 'is-invalid' : ''}`}
                                    id="audioFile"
                                    accept="audio/*"
                                    onChange={handleFileChange}
                                />
                                {errors.audioFile && (
                                    <div className="invalid-feedback">
                                        {errors.audioFile}
                                    </div>
                                )}
                                <small className="text-muted">
                                    Formatos aceitos: MP3, WAV, OGG
                                </small>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-center gap-3">
                        <button
                            type="button"
                            className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                            onClick={() => {
                                setFormData({
                                    titulo: "",
                                    cursoId: "",
                                    audioFile: null
                                });
                                setErrors({});
                                const fileInput = document.getElementById('audioFile');
                                if (fileInput) {
                                    fileInput.value = '';
                                }
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Salvando...
                                </>
                            ) : (
                                'Salvar'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CadastroAudio;