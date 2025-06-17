import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL_NEW } from './config';

const CadastroTurma = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        cp_tr_nome: '',
        cp_tr_data: '',
        cp_tr_id_professor: '',
        cp_tr_id_escola: '',
        cp_tr_curso_id: '',
        cp_tr_alunos: [],
        cp_tr_dias_semana: []
    });
    const [professores, setProfessores] = useState([]);
    const [escolas, setEscolas] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [alunos, setAlunos] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    const diasSemana = [
        { value: 'segunda', label: 'Segunda-feira' },
        { value: 'terca', label: 'Terça-feira' },
        { value: 'quarta', label: 'Quarta-feira' },
        { value: 'quinta', label: 'Quinta-feira' },
        { value: 'sexta', label: 'Sexta-feira' },
        { value: 'sabado', label: 'Sábado' },
        { value: 'domingo', label: 'Domingo' }
    ];

    useEffect(() => {
        fetchDependencies();
        if (id) {
            setIsEdit(true);
            fetchTurma();
        }
    }, [id]);

    const fetchDependencies = async () => {
        try {
            const [profResponse, escolasResponse, cursosResponse, alunosResponse] = await Promise.all([
                fetch(`${API_BASE_URL_NEW}/users-professores`),
                fetch(`${API_BASE_URL_NEW}/escolas`),
                fetch(`${API_BASE_URL_NEW}/cursos`),
                fetch(`${API_BASE_URL_NEW}/users`)
            ]);

            if (profResponse.ok) {
                const profData = await profResponse.json();
                setProfessores(profData);
            }

            if (escolasResponse.ok) {
                const escolasData = await escolasResponse.json();
                setEscolas(escolasData);
            }

            if (cursosResponse.ok) {
                const cursosData = await cursosResponse.json();
                setCursos(cursosData);
            }

            if (alunosResponse.ok) {
                const alunosData = await alunosResponse.json();
                const alunosFiltrados = alunosData.filter(user => user.tipoUser === 5);
                setAlunos(alunosFiltrados);
            }
        } catch (error) {
            console.error('Erro ao buscar dependências:', error);
            toast.error('Erro ao carregar dados necessários');
        }
    };

    const fetchTurma = async () => {
        try {
            const response = await fetch(`${API_BASE_URL_NEW}/turmas/${id}`);
            if (response.ok) {
                const turma = await response.json();
                setFormData({
                    cp_tr_nome: turma.nome || '',
                    cp_tr_data: turma.data ? new Date(turma.data).toISOString().split('T')[0] : '',
                    cp_tr_id_professor: turma.professorId || '',
                    cp_tr_id_escola: turma.escolaId || '',
                    cp_tr_curso_id: turma.cursoId || '',
                    cp_tr_alunos: [],
                    cp_tr_dias_semana: turma.diasSemana ? JSON.parse(turma.diasSemana) : []
                });
            }
        } catch (error) {
            console.error('Erro ao buscar turma:', error);
            toast.error('Erro ao carregar dados da turma');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDiasSemanaChange = (dia) => {
        setFormData(prev => ({
            ...prev,
            cp_tr_dias_semana: prev.cp_tr_dias_semana.includes(dia)
                ? prev.cp_tr_dias_semana.filter(d => d !== dia)
                : [...prev.cp_tr_dias_semana, dia]
        }));
    };

    const handleAlunosChange = (alunoId) => {
        setFormData(prev => ({
            ...prev,
            cp_tr_alunos: prev.cp_tr_alunos.includes(alunoId)
                ? prev.cp_tr_alunos.filter(id => id !== alunoId)
                : [...prev.cp_tr_alunos, alunoId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEdit 
                ? `${API_BASE_URL_NEW}/update-turma/${id}`
                : `${API_BASE_URL_NEW}/register-turma`;

            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                if (data.exists) {
                    toast.warning(data.message);
                } else {
                    toast.success(isEdit ? 'Turma atualizada com sucesso!' : 'Turma cadastrada com sucesso!');
                    navigate('/turma');
                }
            } else {
                toast.error(data.error || 'Erro ao salvar turma');
            }
        } catch (error) {
            console.error('Erro ao salvar turma:', error);
            toast.error('Erro interno do servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-main-body">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
                <h6 className="fw-semibold mb-0">{isEdit ? 'Editar' : 'Cadastrar'} Turma</h6>
            </div>

            <div className="row gy-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Informações da Turma</h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row gy-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Nome da Turma</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="cp_tr_nome"
                                            value={formData.cp_tr_nome}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Data de Início</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="cp_tr_data"
                                            value={formData.cp_tr_data}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Escola</label>
                                        <select
                                            className="form-control"
                                            name="cp_tr_id_escola"
                                            value={formData.cp_tr_id_escola}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Selecione uma escola</option>
                                            {escolas.map(escola => (
                                                <option key={escola.id} value={escola.id}>
                                                    {escola.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Professor</label>
                                        <select
                                            className="form-control"
                                            name="cp_tr_id_professor"
                                            value={formData.cp_tr_id_professor}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Selecione um professor</option>
                                            {professores.map(prof => (
                                                <option key={prof.cp_id} value={prof.cp_id}>
                                                    {prof.cp_nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Curso</label>
                                        <select
                                            className="form-control"
                                            name="cp_tr_curso_id"
                                            value={formData.cp_tr_curso_id}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Selecione um curso</option>
                                            {cursos.map(curso => (
                                                <option key={curso.id} value={curso.id}>
                                                    {curso.titulo}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-12">
                                        <label className="form-label">Dias da Semana</label>
                                        <div className="d-flex flex-wrap gap-3">
                                            {diasSemana.map(dia => (
                                                <div key={dia.value} className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id={dia.value}
                                                        checked={formData.cp_tr_dias_semana.includes(dia.value)}
                                                        onChange={() => handleDiasSemanaChange(dia.value)}
                                                    />
                                                    <label className="form-check-label" htmlFor={dia.value}>
                                                        {dia.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <label className="form-label">Alunos da Turma</label>
                                        <div className="row">
                                            {alunos.map(aluno => (
                                                <div key={aluno.id} className="col-md-4 mb-2">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`aluno-${aluno.id}`}
                                                            checked={formData.cp_tr_alunos.includes(aluno.id)}
                                                            onChange={() => handleAlunosChange(aluno.id)}
                                                        />
                                                        <label className="form-check-label" htmlFor={`aluno-${aluno.id}`}>
                                                            {aluno.nome}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Cadastrar')} Turma
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary ms-2"
                                            onClick={() => navigate('/turma')}
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

export default CadastroTurma;