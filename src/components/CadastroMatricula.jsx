import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL_NEW } from './config';

const CadastroMatricula = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        usuarioId: '',
        escolaId: '',
        valorCurso: '',
        numeroParcelas: '',
        valorParcela: '',
        valorMensalidade: '',
        tipoCobranca: 'parcelado',
        primeiraDataPagamento: '',
        status: 'ativo',
        nivelIdioma: '',
        horarioInicio: '',
        horarioFim: '',
        escolaridade: '',
        localNascimento: '',
        redeSocial: '',
        nomePai: '',
        contatoPai: '',
        nomeMae: '',
        contatoMae: ''
    });
    const [usuarios, setUsuarios] = useState([]);
    const [escolas, setEscolas] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDependencies();
        if (id) {
            setIsEdit(true);
            fetchMatricula();
        }
    }, [id]);

    const fetchDependencies = async () => {
        try {
            const [usuariosResponse, escolasResponse] = await Promise.all([
                fetch(`${API_BASE_URL_NEW}/users`),
                fetch(`${API_BASE_URL_NEW}/escolas`)
            ]);

            if (usuariosResponse.ok) {
                const usuariosData = await usuariosResponse.json();
                const alunos = usuariosData.filter(user => user.tipoUser === 5);
                setUsuarios(alunos);
            }

            if (escolasResponse.ok) {
                const escolasData = await escolasResponse.json();
                setEscolas(escolasData);
            }
        } catch (error) {
            console.error('Erro ao buscar dependências:', error);
            toast.error('Erro ao carregar dados necessários');
        }
    };

    const fetchMatricula = async () => {
        try {
            const response = await fetch(`${API_BASE_URL_NEW}/matriculas/${id}`);
            if (response.ok) {
                const matricula = await response.json();
                setFormData({
                    usuarioId: matricula.usuarioId || '',
                    escolaId: matricula.escolaId || '',
                    valorCurso: matricula.valorCurso || '',
                    numeroParcelas: matricula.numeroParcelas || '',
                    valorParcela: matricula.valorParcela || '',
                    valorMensalidade: matricula.valorMensalidade || '',
                    tipoCobranca: matricula.tipoCobranca || 'parcelado',
                    primeiraDataPagamento: matricula.primeiraDataPagamento ? 
                        new Date(matricula.primeiraDataPagamento).toISOString().split('T')[0] : '',
                    status: matricula.status || 'ativo',
                    nivelIdioma: matricula.nivelIdioma || '',
                    horarioInicio: matricula.horarioInicio || '',
                    horarioFim: matricula.horarioFim || '',
                    escolaridade: matricula.escolaridade || '',
                    localNascimento: matricula.localNascimento || '',
                    redeSocial: matricula.redeSocial || '',
                    nomePai: matricula.nomePai || '',
                    contatoPai: matricula.contatoPai || '',
                    nomeMae: matricula.nomeMae || '',
                    contatoMae: matricula.contatoMae || ''
                });
            }
        } catch (error) {
            console.error('Erro ao buscar matrícula:', error);
            toast.error('Erro ao carregar dados da matrícula');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Calcular valor da parcela automaticamente
        if (name === 'valorCurso' || name === 'numeroParcelas') {
            const valorCurso = name === 'valorCurso' ? parseFloat(value) || 0 : parseFloat(formData.valorCurso) || 0;
            const numeroParcelas = name === 'numeroParcelas' ? parseInt(value) || 1 : parseInt(formData.numeroParcelas) || 1;

            if (valorCurso > 0 && numeroParcelas > 0) {
                const valorParcela = (valorCurso / numeroParcelas).toFixed(2);
                setFormData(prev => ({
                    ...prev,
                    valorParcela: valorParcela
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isEdit 
                ? `${API_BASE_URL_NEW}/matriculas/${id}`
                : `${API_BASE_URL_NEW}/matriculas`;

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
                toast.success(data.message || (isEdit ? 'Matrícula atualizada com sucesso!' : 'Matrícula cadastrada com sucesso!'));
                navigate('/matricula');
            } else {
                toast.error(data.error || 'Erro ao salvar matrícula');
            }
        } catch (error) {
            console.error('Erro ao salvar matrícula:', error);
            toast.error('Erro interno do servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-main-body">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-24">
                <h6 className="fw-semibold mb-0">{isEdit ? 'Editar' : 'Cadastrar'} Matrícula</h6>
            </div>

            <div className="row gy-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">Informações da Matrícula</h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row gy-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Aluno</label>
                                        <select
                                            className="form-control"
                                            name="usuarioId"
                                            value={formData.usuarioId}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Selecione um aluno</option>
                                            {usuarios.map(usuario => (
                                                <option key={usuario.id} value={usuario.id}>
                                                    {usuario.nome} - {usuario.email}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Escola</label>
                                        <select
                                            className="form-control"
                                            name="escolaId"
                                            value={formData.escolaId}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Selecione uma escola</option>
                                            {escolas.map(escola => (
                                                <option key={escola.id} value={escola.id}>
                                                    {escola.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">Valor do Curso</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            name="valorCurso"
                                            value={formData.valorCurso}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">Tipo de Cobrança</label>
                                        <select
                                            className="form-control"
                                            name="tipoCobranca"
                                            value={formData.tipoCobranca}
                                            onChange={handleInputChange}
                                        >
                                            <option value="parcelado">Parcelado</option>
                                            <option value="mensalidade">Mensalidade</option>
                                        </select>
                                    </div>

                                    {formData.tipoCobranca === 'parcelado' && (
                                        <>
                                            <div className="col-md-4">
                                                <label className="form-label">Número de Parcelas</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="numeroParcelas"
                                                    value={formData.numeroParcelas}
                                                    onChange={handleInputChange}
                                                />
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label">Valor da Parcela</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="form-control"
                                                    name="valorParcela"
                                                    value={formData.valorParcela}
                                                    readOnly
                                                />
                                            </div>
                                        </>
                                    )}

                                    {formData.tipoCobranca === 'mensalidade' && (
                                        <div className="col-md-4">
                                            <label className="form-label">Valor da Mensalidade</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-control"
                                                name="valorMensalidade"
                                                value={formData.valorMensalidade}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    )}

                                    <div className="col-md-4">
                                        <label className="form-label">Primeira Data de Pagamento</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="primeiraDataPagamento"
                                            value={formData.primeiraDataPagamento}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-control"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="ativo">Ativo</option>
                                            <option value="inativo">Inativo</option>
                                            <option value="suspenso">Suspenso</option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Nível do Idioma</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="nivelIdioma"
                                            value={formData.nivelIdioma}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Horário de Início</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="horarioInicio"
                                            value={formData.horarioInicio}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label">Horário de Fim</label>
                                        <input
                                            type="time"
                                            className="form-control"
                                            name="horarioFim"
                                            value={formData.horarioFim}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Escolaridade</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="escolaridade"
                                            value={formData.escolaridade}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Local de Nascimento</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="localNascimento"
                                            value={formData.localNascimento}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Rede Social</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="redeSocial"
                                            value={formData.redeSocial}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Nome do Pai</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="nomePai"
                                            value={formData.nomePai}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Contato do Pai</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="contatoPai"
                                            value={formData.contatoPai}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Nome da Mãe</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="nomeMae"
                                            value={formData.nomeMae}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">Contato da Mãe</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="contatoMae"
                                            value={formData.contatoMae}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="col-md-12">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Cadastrar')} Matrícula
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-secondary ms-2"
                                            onClick={() => navigate('/matricula')}
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

export default CadastroMatricula;