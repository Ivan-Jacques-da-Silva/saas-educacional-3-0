
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { API_BASE_URL_NEW } from './config';
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MatriculasLayout = () => {
    const [matriculas, setMatriculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredMatriculas, setFilteredMatriculas] = useState([]);

    useEffect(() => {
        fetchMatriculas();
    }, []);

    useEffect(() => {
        // Filtrar matrículas baseado no termo de busca
        const filtered = matriculas.filter(matricula =>
            matricula.usuario?.cp_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            matricula.escola?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            matricula.cp_mt_nivel_idioma?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredMatriculas(filtered);
    }, [matriculas, searchTerm]);

    const fetchMatriculas = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL_NEW}/api/matriculas`);
            let matriculasData = response.data;

            // Filtrar por escola se o usuário não for gestor
            const userType = parseInt(localStorage.getItem('tipoUser'));
            if (userType && userType > 1) {
                const userSchoolId = parseInt(localStorage.getItem('escolaId'));
                if (userSchoolId) {
                    matriculasData = matriculasData.filter(matricula => 
                        matricula.cp_mt_escola_id === userSchoolId
                    );
                }
            }

            setMatriculas(matriculasData);
        } catch (error) {
            console.error("Erro ao buscar matrículas:", error);
            toast.error("Erro ao carregar matrículas");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getTipoCobrancaLabel = (tipo) => {
        return tipo === 'parcelado' ? 'Parcelado' : 'Mensalidade';
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'ativo': { class: 'bg-success-focus text-success-600', text: 'Ativo' },
            'inativo': { class: 'bg-danger-focus text-danger-600', text: 'Inativo' },
            'pendente': { class: 'bg-warning-focus text-warning-600', text: 'Pendente' },
        };
        
        const statusInfo = statusMap[status] || { class: 'bg-neutral-200 text-neutral-600', text: status };
        return (
            <span className={`badge ${statusInfo.class} px-16 py-4 radius-4 fw-medium text-sm`}>
                {statusInfo.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer />
            <div className="card h-100 p-0 radius-12">
                <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
                    <div className="d-flex align-items-center flex-wrap gap-3">
                        <span className="text-md fw-medium text-secondary-light mb-0">
                            Mostrar
                        </span>
                        <select className="form-select form-select-sm w-auto ps-12 py-6 radius-12 h-40-px">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                            <option>6</option>
                            <option>7</option>
                            <option>8</option>
                            <option>9</option>
                            <option>10</option>
                        </select>
                        <form className="navbar-search">
                            <input
                                type="text"
                                className="bg-base h-40-px w-auto"
                                name="search"
                                placeholder="Buscar matrículas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Icon icon="ion:search-outline" className="icon" />
                        </form>
                    </div>
                    <a
                        href="/cadastro-matricula"
                        className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
                    >
                        <Icon
                            icon="ic:baseline-plus"
                            className="icon text-xl line-height-1"
                        />
                        Adicionar Matrícula
                    </a>
                </div>
                
                <div className="card-body p-24">
                    <div className="table-responsive scroll-sm">
                        <table className="table bordered-table sm-table mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        <div className="d-flex align-items-center gap-10">
                                            <div className="form-check style-check d-flex align-items-center">
                                                <input
                                                    className="form-check-input radius-4 border input-form-dark"
                                                    type="checkbox"
                                                    name="checkbox"
                                                    id="selectAll"
                                                />
                                            </div>
                                            S.L
                                        </div>
                                    </th>
                                    <th scope="col">Aluno</th>
                                    <th scope="col">Escola</th>
                                    <th scope="col">Valor do Curso</th>
                                    <th scope="col">Tipo de Cobrança</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Nível Idioma</th>
                                    <th scope="col">Data Cadastro</th>
                                    <th scope="col" className="text-center">
                                        Ação
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMatriculas.length > 0 ? (
                                    filteredMatriculas.map((matricula, index) => (
                                        <tr key={matricula.cp_mt_id || index}>
                                            <td>
                                                <div className="d-flex align-items-center gap-10">
                                                    <div className="form-check style-check d-flex align-items-center">
                                                        <input
                                                            className="form-check-input radius-4 border border-neutral-400"
                                                            type="checkbox"
                                                            name="checkbox"
                                                        />
                                                    </div>
                                                    {index + 1}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="">
                                                        <h6 className="text-md mb-0 fw-medium flex-grow-1">
                                                            {matricula.usuario?.cp_nome || 'N/A'}
                                                        </h6>
                                                        <span className="text-sm text-secondary-light fw-medium">
                                                            {matricula.usuario?.cp_email || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-md mb-0 fw-normal text-secondary-light">
                                                    {matricula.escola?.nome || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-md mb-0 fw-normal text-secondary-light">
                                                    {formatCurrency(matricula.cp_mt_valor_curso || 0)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-md mb-0 fw-normal text-secondary-light">
                                                    {getTipoCobrancaLabel(matricula.cp_mt_tipo_cobranca)}
                                                    {matricula.cp_mt_tipo_cobranca === 'parcelado' && matricula.cp_mt_numero_parcelas && (
                                                        <div className="text-sm text-neutral-600">
                                                            {matricula.cp_mt_numero_parcelas}x de {formatCurrency(matricula.cp_mt_valor_parcela || 0)}
                                                        </div>
                                                    )}
                                                    {matricula.cp_mt_tipo_cobranca === 'mensalidade' && matricula.cp_mt_valor_mensalidade && (
                                                        <div className="text-sm text-neutral-600">
                                                            Mensalidade: {formatCurrency(matricula.cp_mt_valor_mensalidade)}
                                                        </div>
                                                    )}
                                                </span>
                                            </td>
                                            <td>
                                                {getStatusBadge(matricula.cp_mt_status)}
                                            </td>
                                            <td>
                                                <span className="text-md mb-0 fw-normal text-secondary-light">
                                                    {matricula.cp_mt_nivel_idioma || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-md mb-0 fw-normal text-secondary-light">
                                                    {formatDate(matricula.created_at)}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="d-flex align-items-center gap-10 justify-content-center">
                                                    <button
                                                        type="button"
                                                        className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                        title="Ver detalhes"
                                                    >
                                                        <Icon icon="majesticons:eye-line" className="menu-icon" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                        title="Editar"
                                                    >
                                                        <Icon icon="lucide:edit" className="menu-icon" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                                                        title="Excluir"
                                                    >
                                                        <Icon
                                                            icon="fluent:delete-24-regular"
                                                            className="menu-icon"
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4">
                                            Nenhuma matrícula encontrada
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-24">
                        <span>Mostrando {filteredMatriculas.length} de {matriculas.length} entradas</span>
                        <ul className="pagination d-flex flex-wrap align-items-center gap-2 justify-content-center">
                            <li className="page-item">
                                <a
                                    className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md"
                                    href="#"
                                >
                                    <Icon icon="ep:d-arrow-left" className="" />
                                </a>
                            </li>
                            <li className="page-item">
                                <a
                                    className="page-link text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md bg-primary-600 text-white"
                                    href="#"
                                >
                                    1
                                </a>
                            </li>
                            <li className="page-item">
                                <a
                                    className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md"
                                    href="#"
                                >
                                    2
                                </a>
                            </li>
                            <li className="page-item">
                                <a
                                    className="page-link bg-neutral-200 text-secondary-light fw-semibold radius-8 border-0 d-flex align-items-center justify-content-center h-32-px w-32-px text-md"
                                    href="#"
                                >
                                    <Icon icon="ep:d-arrow-right" className="" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MatriculasLayout;
